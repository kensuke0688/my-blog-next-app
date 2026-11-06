import { createClient } from "@/lib/supabase/createClient";

export type SignUpRequestBody = {
  email: string;
  password: string;
};

export type SignUpResponseBody = {
  message: string;
  // trueの場合、メール確認が完了するまでログインセッションは発行されない
  needsEmailConfirmation: boolean;
};

export type SignUpErrorResponseBody = {
  error: string;
};

export async function POST(request: Request) {
  try {
    const body: SignUpRequestBody = await request.json();

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return Response.json(
        { error: error.message } satisfies SignUpErrorResponseBody,
        { status: 400 }
      );
    }

    return Response.json(
      {
        message: "success",
        needsEmailConfirmation: data.session === null,
      } satisfies SignUpResponseBody,
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/sign_up] failed to sign up:", error);

    return Response.json(
      { error: "会員登録に失敗しました。" } satisfies SignUpErrorResponseBody,
      { status: 500 }
    );
  }
}
