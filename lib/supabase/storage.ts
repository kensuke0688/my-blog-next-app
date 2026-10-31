import { supabase } from "@/lib/supabase/client";

const THUMBNAIL_BUCKET = "post_thumbnail";

export const THUMBNAIL_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const THUMBNAIL_MAX_SIZE_BYTES = 3 * 1024 * 1024;

export async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, {
      contentType: file.type,
    });

  if (error) {
    throw new Error(`サムネイルのアップロードに失敗しました: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(THUMBNAIL_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
