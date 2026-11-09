import { createClient } from "@/lib/supabase/createClient";
import { requireAdmin } from "@/lib/auth";
import {
  THUMBNAIL_ALLOWED_TYPES,
  THUMBNAIL_MAX_SIZE_BYTES,
} from "@/lib/supabase/thumbnailConstants";

const THUMBNAIL_BUCKET = "post_thumbnail";

export type UploadThumbnailResponseBody = {
  url: string;
};

export type UploadThumbnailErrorResponseBody = {
  error: string;
};

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          error: "ファイルが指定されていません。",
        } satisfies UploadThumbnailErrorResponseBody,
        { status: 400 }
      );
    }

    if (!THUMBNAIL_ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        {
          error: "画像はjpeg・png・webpのいずれかの形式でアップロードしてください。",
        } satisfies UploadThumbnailErrorResponseBody,
        { status: 400 }
      );
    }

    if (file.size > THUMBNAIL_MAX_SIZE_BYTES) {
      return Response.json(
        {
          error: "画像サイズは3MB以内にしてください。",
        } satisfies UploadThumbnailErrorResponseBody,
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${ext}`;

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(THUMBNAIL_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(THUMBNAIL_BUCKET)
      .getPublicUrl(path);

    return Response.json(
      { url: data.publicUrl } satisfies UploadThumbnailResponseBody,
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin/thumbnails] failed to upload thumbnail:", error);

    return Response.json(
      {
        error: "サムネイルのアップロードに失敗しました。",
      } satisfies UploadThumbnailErrorResponseBody,
      { status: 500 }
    );
  }
}
