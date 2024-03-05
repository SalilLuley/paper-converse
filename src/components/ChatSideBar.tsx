"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chatId, chats, isPro }: Props) => {
  const [loading, setUploading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setUploading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log("error in stripe", error);
    }
  };
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href={"/"}>
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="m-2 w-4 h-4"></PlusCircle>
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipse">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href={"/"}>Home</Link>
          <Link href={"/"}>Source</Link>
        </div>
        {/* <div className="mt-3">
          <SubscriptionButton isPro={isPro}></SubscriptionButton>
        </div> */}
      </div>
    </div>
  );
};

export default ChatSideBar;
