import path from "path";
import supabase from "./supabase-client";
import fs from "fs";

export async function downlaodFromSupbase(file_key: string) {
  const obj = await supabase.storage.from("papers").download(file_key);
  const buffer = await obj.data?.arrayBuffer();

  const file_name = `./tmp/pdf-${Date.now()}.pdf`;
  const dir = path.dirname(file_name);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file_name, Buffer.from(buffer as ArrayBuffer));
  return file_name;
}
