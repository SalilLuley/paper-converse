import supabase from "./supabase-client";

export async function uploadToSupabase(file: File) {
  try {
    const file_key =
      "/uploads/" + Date.now().toString() + file.name.replace("", "-");
    const { data, error } = await supabase.storage
      .from("papers")
      .upload(file_key, file);
    return { file_key, file_name: file.name };
  } catch (error) {}
}

export function getSupabaseUrl(file_key: string) {
  return (
    "https://eadvowaklcncgmaqkvua.supabase.co/storage/v1/object/public/papers" +
    file_key
  );
}
