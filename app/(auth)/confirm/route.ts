import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const destino = searchParams.get("next");

  // Los enlaces de recuperación y los enlaces de confirmación antiguos
  // pueden llegar sin un destino explícito.
  const next =
    type === "recovery" || destino === "/update-password"
      ? "/update-password"
      : destino === "/diagnostico" || type === "signup" || type === "email" || (code && !destino)
        ? "/diagnostico"
        : "/inicio";

  if (!(tokenHash && type) && !code) {
    redirect("/error?error=El enlace de confirmación está incompleto.");
  }

  const supabase = await createClient();
  const { error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    redirect(`/error?error=${encodeURIComponent(error.message)}`);
  }

  redirect(next);
}
