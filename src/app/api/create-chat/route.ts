//api-create-chat

import { db } from "@/lib/db";
import { loadSupabaseIntoPinecode } from "@/lib/db/pinecone";
import { chats } from "@/lib/db/schema";
import { getSupabaseUrl } from "@/lib/db/supabase";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    throw NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log("file_key", file_key);
    await loadSupabaseIntoPinecode(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getSupabaseUrl(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.log(error);
    return NextResponse.json({ error: "Internal server error", status: 500 });
  }
}
