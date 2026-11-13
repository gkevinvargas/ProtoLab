
import Link from "next/link";
import {
  IconAtom,
  IconMailCheck,
  IconArrowLeft,
  IconShieldCheck,
} from "@tabler/icons-react";

export default function SignUpSuccessPage() {
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
        <section className="bg-white rounded-3xl shadow-sm border border-[#E5EDF8] p-8 text-center">
          <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-[#E8F7F4] text-[#21B8A6]">
            <IconMailCheck size={42} stroke={1.7} />
          </div>

          <h1 className="text-2xl font-bold text-[#24324A] mb-3">
            ¡Revisa tu correo electrónico!
          </h1>

          <p className="text-[#718096] leading-relaxed mb-6">
            Tu cuenta está casi lista. Hemos enviado un enlace de
            confirmación a tu correo electrónico.
          </p>

          <div className="bg-[#F5F9FF] rounded-2xl p-5 text-left mb-6">
            <h2 className="font-semibold text-[#24324A] mb-3">
              ¿Qué debes hacer?
            </h2>

            <ol className="space-y-3 text-sm text-[#718096]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3478F6] text-white flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span>
                  Abre la bandeja de entrada de tu correo electrónico.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3478F6] text-white flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span>
                  Busca el mensaje de confirmación enviado por ProtoLab.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3478F6] text-white flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span>
                  Haz clic en el enlace para activar tu cuenta.
                </span>
              </li>
            </ol>
          </div>

          <div className="flex items-start gap-3 text-left bg-[#FFF8E9] border border-[#FFE6B8] rounded-xl p-4 mb-6">
            <IconShieldCheck
              size={22}
              className="text-[#E5A02E] flex-shrink-0"
            />
            <p className="text-xs text-[#8A6A32] leading-relaxed">
              Si no encuentras el mensaje, revisa también tu carpeta de
              spam o correo no deseado.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 bg-[#3478F6] hover:bg-[#2865D5] text-white font-semibold py-3 px-5 rounded-xl transition-colors"
          >
            <IconArrowLeft size={18} />
            Volver al inicio de sesión
          </Link>
        </section>

        <p className="text-center text-xs text-[#A0AEC0] mt-6">
          ProtoLab · Explora tus habilidades y desarrolla tu potencial.
        </p>
      </div>
    </main>
  );
}
