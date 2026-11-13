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

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        throw authError;
      }

      router.replace("/inicio");
      router.refresh();
    } catch {
      setError(
        "No fue posible iniciar sesión. Verifica tu correo y contraseña e inténtalo nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Correo electrónico */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-[#24324A]"
        >
          Correo electrónico
        </label>

        <div className="flex items-center rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 transition focus-within:border-[#3478F6] focus-within:ring-2 focus-within:ring-blue-100">
          <IconMail size={20} className="shrink-0 text-[#718096]" />

          <input
            id="email"
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
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-[#24324A]"
          >
            Contraseña
          </label>

          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#3478F6] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="flex items-center rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 transition focus-within:border-[#3478F6] focus-within:ring-2 focus-within:ring-blue-100">
          <IconLock size={20} className="shrink-0 text-[#718096]" />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
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

      {/* Mensaje de error */}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Botón de inicio de sesión */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3478F6] py-4 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}

        {!isLoading && <IconArrowRight size={18} />}
      </button>

      {/* Registro */}
      <p className="pt-3 text-center text-sm text-[#718096]">
        ¿Aún no tienes una cuenta?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-[#3478F6] hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
