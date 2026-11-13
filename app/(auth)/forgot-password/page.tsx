
import Link from "next/link";
import { IconAtom, IconArrowLeft, IconLockQuestion } from "@tabler/icons-react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="bg-[#3478F6] text-white p-2 rounded-xl">
            <IconAtom size={27} stroke={2} />
          </div>

          <span className="text-2xl font-bold text-[#24324A]">
            ProtoLab
          </span>
        </Link>

        {/* Tarjeta principal */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#E5EDF8] p-8">

          <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF1FF] text-[#3478F6]">
            <IconLockQuestion size={34} stroke={1.7} />
          </div>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-[#24324A] mb-3">
              ¿Olvidaste tu contraseña?
            </h1>

            <p className="text-[#718096] leading-relaxed text-sm">
              No te preocupes. Introduce el correo electrónico asociado
              a tu cuenta y te enviaremos instrucciones para recuperar
              el acceso.
            </p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-7 pt-6 border-t border-[#E5EDF8]">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#718096] hover:text-[#3478F6] transition-colors"
            >
              <IconArrowLeft size={17} />
              Volver al inicio de sesión
            </Link>
          </div>

        </section>

        <p className="text-center text-xs text-[#A0AEC0] mt-6">
          ProtoLab · Explora tus habilidades y desarrolla tu potencial.
        </p>

      </div>
    </main>
  );
}
