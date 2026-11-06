import { createClient } from "@/lib/supabase/createClient";

// 認証(401)と管理者判定(403)をまとめて行う。
// Cookie(httpOnly)に保存されたセッションを見るため、引数は不要。
// 問題なければnull、問題があればそのまま返すべきResponseを返す。
export async function requireAdmin(): Promise<Response | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return Response.json({ error: "認証が必要です。" }, { status: 401 });
  }

  if (data.user.id !== process.env.BLOG_ADMIN_USER_ID) {
    return Response.json({ error: "権限がありません。" }, { status: 403 });
  }

  return null;
}
