import { createClient } from "@/lib/supabase/createClient";

export type MeResponseBody =
  | {
      isLoggedIn: true;
      userId: string;
      email: string | null;
      isAdmin: boolean;
    }
  | {
      isLoggedIn: false;
    };

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return Response.json({ isLoggedIn: false } satisfies MeResponseBody);
  }

  return Response.json({
    isLoggedIn: true,
    userId: data.user.id,
    email: data.user.email ?? null,
    isAdmin: data.user.id === process.env.BLOG_ADMIN_USER_ID,
  } satisfies MeResponseBody);
}
