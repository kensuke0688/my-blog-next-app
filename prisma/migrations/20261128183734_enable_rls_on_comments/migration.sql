-- Supabase Security Advisor で critical 判定される
-- 「public schema に RLS 無効のテーブルがある」を事前に防ぐ。
-- Prisma は RLS をバイパスする postgres ロールで接続しているため、
-- アプリの動作には影響しない。ポリシーを追加しないことで、
-- Data API(PostgREST)経由のアクセスは全面拒否される。
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;
