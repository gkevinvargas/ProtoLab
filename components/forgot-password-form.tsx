
"use client";

import { useState, type FormEvent } from "react";
import {
  IconMail,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: `${window.location.origin}/confirm?next=/update-password`,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible enviar el correo. Inténtalo nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Correo electrónico */}
      <div>
        <label
          htmlFor="recovery-email"
          className="block text-sm font-semibold text-[#24324A] mb-2"
        >
          Correo electrónico
        </label>

        <div className="relative">
          <IconMail
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
          />

          <input
            id="recovery-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ejemplo@correo.com"
            required
            disabled={isLoading || success}
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3 border border-[#DCE5F1] rounded-xl text-[#24324A] placeholder:text-[#A0AEC0] outline-none focus:border-[#3478F6] focus:ring-2 focus:ring-[#3478F6]/10 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600">
          <IconAlertCircle size={19} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#E8F7F4] border border-[#BCE9DF] text-[#187D70]">
          <IconCheck size={21} className="flex-shrink-0 mt-0.5" />

          <div>
            <p className="font-semibold text-sm">
              Solicitud enviada
            </p>

            <p className="text-sm mt-1 leading-relaxed">
              Si existe una cuenta asociada a ese correo, recibirás
              instrucciones para recuperar tu contraseña.
              Revisa también tu carpeta de spam.
            </p>
          </div>
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={isLoading || success}
        className="w-full flex items-center justify-center gap-2 bg-[#3478F6] hover:bg-[#2865D5] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-5 rounded-xl transition-colors"
      >
        {isLoading ? (
          <>
            <IconLoader2 size={19} className="animate-spin" />
            Enviando solicitud...
          </>
        ) : success ? (
          <>
            <IconCheck size={19} />
            Solicitud enviada
          </>
        ) : (
          "Enviar instrucciones"
        )}
      </button>

    </form>
  );
}
