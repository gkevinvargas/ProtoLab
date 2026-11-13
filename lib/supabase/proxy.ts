
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    // Las solicitudes API reciben JSON, no una redirección HTML.
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          valid: false,
          errors: ["Debes iniciar sesión para utilizar este servicio."],
        },
        { status: 401 },
      );
    }

    // Las páginas privadas conservan su redirección al login.
    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/forgot-password") &&
      !request.nextUrl.pathname.startsWith("/sign-up") &&
      !request.nextUrl.pathname.startsWith("/sign-up-success") &&
      !request.nextUrl.pathname.startsWith("/confirm") &&
      !request.nextUrl.pathname.startsWith("/error") &&
      !request.nextUrl.pathname.startsWith("/forgot-password") &&
      !request.nextUrl.pathname.startsWith("/update-password")
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  }
