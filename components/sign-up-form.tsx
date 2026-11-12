
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
} from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/protected");
        router.refresh();
        return;
      }

      router.push("/auth/sign-up-success");

    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible crear tu cuenta. Inténtalo nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-5">

      {/* Correo electrónico */}
      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-sm font-semibold text-[#24324A]"
        >
          Correo electrónico
        </label>

        <div className="flex items-center rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 transition focus-within:border-[#3478F6] focus-within:ring-2 focus-within:ring-blue-100">
          <IconMail size={20} className="shrink-0 text-[#718096]" />

          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label
          htmlFor="signup-password"
          className="mb-2 block text-sm font-semibold text-[#24324A]"
        >
          Contraseña
        </label>

        <div className="flex items-center rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 transition focus-within:border-[#3478F6] focus-within:ring-2 focus-within:ring-blue-100">
          <IconLock size={20} className="shrink-0 text-[#718096]" />

          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Crea una contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="shrink-0 text-[#718096] transition hover:text-[#3478F6]"
          >
            {showPassword ? (
              <IconEyeOff size={20} />
            ) : (
              <IconEye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Confirmación de contraseña */}
      <div>
        <label
          htmlFor="repeat-password"
          className="mb-2 block text-sm font-semibold text-[#24324A]"
        >
          Confirmar contraseña
        </label>

        <div className="flex items-center rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 transition focus-within:border-[#3478F6] focus-within:ring-2 focus-within:ring-blue-100">
          <IconLock size={20} className="shrink-0 text-[#718096]" />

          <input
            id="repeat-password"
            name="repeatPassword"
            type={showRepeatPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            className="w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            aria-label={
              showRepeatPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
            className="shrink-0 text-[#718096] transition hover:text-[#3478F6]"
          >
            {showRepeatPassword ? (
              <IconEyeOff size={20} />
            ) : (
              <IconEye size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Botón de registro */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3478F6] py-4 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}

        {!isLoading && <IconArrowRight size={18} />}
      </button>

      {/* Acceso al inicio de sesión */}
      <p className="pt-3 text-center text-sm text-[#718096]">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-[#3478F6] hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>

    </form>
  );
}
