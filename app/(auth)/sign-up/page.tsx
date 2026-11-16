
import { IconAtom } from "@tabler/icons-react";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] px-3 py-4 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid w-full min-w-0 overflow-hidden rounded-2xl bg-white shadow-xl shadow-blue-100/60 sm:rounded-[2rem] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">

          {/* Panel de presentación */}
          <section className="relative flex flex-col justify-between overflow-hidden bg-[#3478F6] p-5 text-white sm:p-8 lg:p-12">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[40px] border-white/10" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#3478F6]">
                <IconAtom size={28} />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                ProtoLab
              </span>
            </div>

            <div className="relative z-10 mt-5 lg:my-12">
              <span className="mb-5 hidden lg:inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                Comienza tu experiencia
              </span>

              <h1 className="max-w-md text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
                El primer paso para crear algo extraordinario.
              </h1>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-blue-100 lg:mt-6 lg:text-base">
                Crea tu cuenta y descubre nuevas formas de aprender,
                experimentar y desarrollar tus habilidades tecnológicas.
              </p>
            </div>

            <div className="relative z-10 hidden items-center gap-2 text-sm text-blue-100 lg:flex">
              <span className="h-2 w-2 rounded-full bg-[#21B8A6]" />
              Aprende creando en ProtoLab.
            </div>
          </section>

          {/* Panel del formulario */}
          <section className="flex min-w-0 flex-col justify-center p-4 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-xl">

              <div className="mb-5 lg:mb-7">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3478F6]">
                  Únete a ProtoLab
                </p>

                <h2 className="text-2xl font-bold text-[#24324A] sm:text-3xl">
                  Crear una cuenta
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#718096]">
                  Regístrate para comenzar a explorar nuestros laboratorios.
                </p>
              </div>

              <SignUpForm />

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
