import type {
  UploadThumbnailResponseBody,
  UploadThumbnailErrorResponseBody,
} from "@/app/api/admin/thumbnails/route";

export {
  THUMBNAIL_ALLOWED_TYPES,
  THUMBNAIL_MAX_SIZE_BYTES,
} from "@/lib/supabase/thumbnailConstants";

export async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/thumbnails", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data: UploadThumbnailErrorResponseBody | null = await res
      .json()
      .catch(() => null);
    throw new Error(
      data?.error ?? `サムネイルのアップロードに失敗しました。(status: ${res.status})`
    );
  }

  const data: UploadThumbnailResponseBody = await res.json();
  return data.url;
}
