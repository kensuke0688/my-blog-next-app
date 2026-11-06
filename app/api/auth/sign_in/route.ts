import { createClient } from "@/lib/supabase/createClient";

export type SignInRequestBody = {
  email: string;
  password: string;
};

export type SignInResponseBody = {
  message: string;
};

export type SignInErrorResponseBody = {
  error: string;
};

export async function POST(request: Request) {
  try {
    const body: SignInRequestBody = await request.json();

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return Response.json(
        { error: error.message } satisfies SignInErrorResponseBody,
        { status: 401 }
      );
    }

    return Response.json(
      { message: "success" } satisfies SignInResponseBody,
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/sign_in] failed to sign in:", error);

    return Response.json(
      { error: "ログインに失敗しました。" } satisfies SignInErrorResponseBody,
      { status: 500 }
    );
  }
}
