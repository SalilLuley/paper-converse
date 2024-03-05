import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  try {
    const pineconeIndex = await client.index("paper-converse");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || {};
  } catch (error) {
    console.log("Error fetching encoding");
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7 //If score matches more than 70% return it
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

  return docs.join("\n").substring(0, 3000);
}
