import { supabaseServer } from "@/lib/supabase/server";

async function getRequestUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// 認証(401)と管理者判定(403)をまとめて行う。
// 問題なければnull、問題があればそのまま返すべきResponseを返す。
export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getRequestUser(request);

  if (!user) {
    return Response.json({ error: "認証が必要です。" }, { status: 401 });
  }

  if (user.id !== process.env.BLOG_ADMIN_USER_ID) {
    return Response.json({ error: "権限がありません。" }, { status: 403 });
  }

  return null;
}
