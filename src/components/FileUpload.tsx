"use client";
import { uploadToSupabase } from "@/lib/db/supabase";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFile) => {
      // console.log(acceptedFile);
      const file = acceptedFile[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToSupabase(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Error uploading file");
          return;
        }
        mutate(
          { file_key: data.file_key, file_name: data.file_name },
          {
            onSuccess: ({ chat_id }) => {
              toast.success("Chat Created");
              router.push(`/chat/${chat_id}`);
            },
            onError: (error) => {
              toast.error("Error creating chat");
            },
          }
        );
        // console.log("data", data);
      } catch (error) {
        // console.log("error", error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl justify-center ">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin">
              <p className="mt-2 text-sm text-slate-400 ">
                {" "}
                This is spilling Coffe to GPT
              </p>
            </Loader2>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500"></Inbox>
            <p className="mt-2 text-sm text-slate-500">Drop files here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
