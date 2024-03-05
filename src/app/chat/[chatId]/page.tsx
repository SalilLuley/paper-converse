import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/ui/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const isPro = await checkSubscription();
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) return redirect("/");

  if (!_chats.find((chat) => chat.id === parseInt(chatId)))
    return redirect("/");
  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* Chat Sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar
            isPro={isPro}
            chats={_chats}
            chatId={parseInt(chatId)}
          ></ChatSideBar>
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 flex-[5] overflow-scroll">
          <PDFViewer pdf_url={currentChat?.pdfUrl ?? ""}></PDFViewer>
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)}></ChatComponent>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
