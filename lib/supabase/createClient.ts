import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { COOKIE_OPTIONS } from "@/lib/supabase/cookieOptions";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              ...COOKIE_OPTIONS,
            })
          ),
      },
    }
  );
};