import { createClient } from "@/lib/supabase/createClient";

export type SignOutResponseBody = {
  message: string;
};

export type SignOutErrorResponseBody = {
  error: string;
};

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return Response.json(
        { error: error.message } satisfies SignOutErrorResponseBody,
        { status: 500 }
      );
    }

    return Response.json(
      { message: "success" } satisfies SignOutResponseBody,
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/sign_out] failed to sign out:", error);

    return Response.json(
      { error: "ログアウトに失敗しました。" } satisfies SignOutErrorResponseBody,
      { status: 500 }
    );
  }
}
