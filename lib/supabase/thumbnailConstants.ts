// app/api/admin/thumbnails/route.ts (サーバー)と lib/supabase/storage.ts (ブラウザ)の
// 両方から参照される値なので、サーバー専用の依存を持たないこのファイルに分離している。

export const THUMBNAIL_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const THUMBNAIL_MAX_SIZE_BYTES = 3 * 1024 * 1024;
