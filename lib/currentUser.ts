import { createClient } from "@/lib/supabase/createClient";
import { prisma } from "@/lib/prisma";
import type { User } from "@/app/generated/prisma/client";

// ログイン中のSupabase Authユーザーに対応するPrisma Userを返す。
// 初回ログイン時はauthUserIdで紐づくUser行がまだ無いため、READER権限で自動作成する。
// 未ログインの場合はnullを返す。
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const authUserId = data.user.id;

  const existingUser = await prisma.user.findUnique({
    where: { authUserId },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      authUserId,
      name: data.user.email ?? "名無しユーザー",
      role: "READER",
    },
  });
}
