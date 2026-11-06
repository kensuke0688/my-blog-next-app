import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_OPTIONS } from "@/lib/supabase/cookieOptions";

export const proxy = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach(cookie => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...COOKIE_OPTIONS })
        );
      },
    } }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  const isAdminPath = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/");
  if (isAdminPath && (error || !user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign_in";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  if (isAdminPath && user?.id !== process.env.BLOG_ADMIN_USER_ID) {
    const forbidden = new NextResponse("管理者のみ利用できます", { status: 403 });
    response.cookies.getAll().forEach(cookie => forbidden.cookies.set(cookie));
    return forbidden;
  }
  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};