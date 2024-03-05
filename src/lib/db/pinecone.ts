import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { downlaodFromSupbase as downloadFromSupbase } from "./supabase.server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "../embeddings";
import md5 from "md5";
import { convertToAscii } from "../utils";

let pinecone: Pinecone | null = null;

type Vector = {
  id: string;
  values: number[];
  metadata?: RecordMetadata;
};

export const getPincone = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};
export async function loadSupabaseIntoPinecode(fileKey: string) {
  //1. obtain the pdf - download and read from pdf
  // console.log("Downloading supabase");
  console.log("Started");

  const file_name = await downloadFromSupbase(fileKey);
  if (!file_name) {
    throw new Error("File not found");
  }
  console.log("In 1");
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log("1--");
  //2. split and segment the pdf into smaller documents
  console.log("In 2");
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );
  console.log("2--");
  //3. vectorise and embed in the individual documents
  console.log("In 3");
  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log("vectors", vectors);
  console.log("3--");
  //4. Upload to pinecode
  console.log("In 4");
  const client = await getPincone();
  const pineconeIndex = await client.index("paper-converse");
  console.log("inserting vectors into pinecode");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  await namespace.upsert(vectors);
  console.log("4--");
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    const vector: Vector = {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
    return vector;
  } catch (error) {
    console.log("error in embedding document in pinecode.ts", error);
    throw error;
  }
}

export const truncateStringByByte = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { metadata, pageContent } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs into smaller documents
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByByte(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
