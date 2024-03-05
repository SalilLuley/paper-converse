import path from "path";
import supabase from "./supabase-client";
import fs from "fs";

export async function downlaodFromSupbase(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(".5");
      const obj = await supabase.storage.from("papers").download(file_key);
      const buffer = await obj.data?.arrayBuffer();
      console.log("1");
      const file_name = `/tmp/${Date.now().toString()}.pdf`;
      const dir = path.dirname(file_name);
      console.log("2");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file_name, Buffer.from(buffer as ArrayBuffer));
      console.log("3");
      return resolve(file_name);
    } catch (error) {
      console.error(error);
      reject(error);
      return null;
    }
  });
}
