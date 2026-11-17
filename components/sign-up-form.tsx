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

import { municipioPredeterminado } from "@/lib/municipio-predeterminado";
import { createClient } from "@/lib/supabase/client";

const diagnosticPath = "/diagnostico";

const profileFields = [
  { name: "nombre", label: "Nombre(s)", autoComplete: "given-name" },
  { name: "apellido_paterno", label: "Apellido paterno", autoComplete: "family-name" },
  { name: "apellido_materno", label: "Apellido materno" },
] as const;

const profileInputClass =
  "min-w-0 w-full rounded-xl border border-[#E7EDF5] bg-[#F8FAFD] px-4 py-3 text-sm text-[#24324A] outline-none focus:border-[#3478F6] focus:ring-2 focus:ring-blue-100";

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

    const formData = new FormData(event.currentTarget);
    const perfilRegistro = {
      nombre: String(formData.get("nombre") ?? "").trim(),
      apellido_paterno: String(formData.get("apellido_paterno") ?? "").trim(),
      apellido_materno: String(formData.get("apellido_materno") ?? "").trim(),
      municipio: municipioPredeterminado.nombre,
      municipio_id: municipioPredeterminado.id,
      semestre: String(formData.get("semestre") ?? ""),
    };

    if (profileFields.some(({ name }) => !perfilRegistro[name])) {
      setError("Completa tu nombre y apellidos.");
      return;
    }

    if (!/^[1-6]$/.test(perfilRegistro.semestre)) {
      setError("Selecciona tu semestre.");
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
            data: {
              perfil_registro: perfilRegistro,
              diagnostico_pendiente: true,
            },
            emailRedirectTo: `${window.location.origin}/confirm?next=${diagnosticPath}`,
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace(diagnosticPath);
        router.refresh();
        return;
      }

      router.push("/sign-up-success");

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
    <form onSubmit={handleSignUp} className="min-w-0 space-y-4 sm:space-y-5">

      <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-base font-semibold text-[#24324A]">
          Datos del perfil
        </legend>

        {profileFields.map(({ name, label, ...attributes }) => (
          <label key={name} className="block min-w-0 text-sm font-semibold text-[#24324A]">
            <span className="mb-2 block">{label}</span>
            <input
              name={name}
              type="text"
              required
              maxLength={120}
              className={profileInputClass}
              {...attributes}
            />
          </label>
        ))}

        <div className="min-w-0 text-sm text-[#24324A]">
          <p className="mb-2 font-semibold">Municipio</p>
          <p>{municipioPredeterminado.nombre}, {municipioPredeterminado.estado}</p>
        </div>

        <label className="block min-w-0 text-sm font-semibold text-[#24324A]">
          <span className="mb-2 block">Semestre</span>
          <select name="semestre" defaultValue="" required className={profileInputClass}>
            <option value="" disabled>Selecciona tu semestre</option>
            {[1, 2, 3, 4, 5, 6].map((semestre) => (
              <option key={semestre} value={semestre}>{semestre}° semestre</option>
            ))}
          </select>
        </label>
      </fieldset>

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
            className="min-w-0 w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
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
            className="min-w-0 w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
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
            className="min-w-0 w-full bg-transparent px-3 py-4 text-sm text-[#24324A] outline-none placeholder:text-gray-400"
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
          href="/"
          className="font-semibold text-[#3478F6] hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>

    </form>
  );
}
