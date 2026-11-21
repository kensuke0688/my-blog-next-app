-- Supabase Security Advisor で critical 判定されていた
-- 「public schema に RLS 無効のテーブルがある」を解消する。
-- Prisma は RLS をバイパスする postgres ロールで接続しているため、
-- アプリの動作には影響しない。ポリシーを追加しないことで、
-- Data API(PostgREST)経由のアクセスは全面拒否される。
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
