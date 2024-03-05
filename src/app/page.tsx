import FileUpload from "@/components/FileUpload";
import SubscriptionButton from "@/components/SubscriptionButton";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { UserButton, auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isPro = await checkSubscription();
  const isAuth = !!userId;
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  return (
    <div className="w-screen min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Paper converse</h1>
            <UserButton afterSignOutUrl="/"></UserButton>
          </div>
          <div className="flex mt-3">
            {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
                  Go to chats <ArrowRight className="ml-2"></ArrowRight>
                </Button>
              </Link>
            )}
            <div className="ml-3">
              <SubscriptionButton isPro={isPro}></SubscriptionButton>
            </div>
          </div>
          <p className="max-w-xl mt-2 text-l text-slate-600">
            Join million of users and professionals to instantly answer
            questions and understand reserach with AI
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload></FileUpload>
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started!<LogIn className="w-4 h-4 m-2"></LogIn>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
