import { IconAtom } from "@tabler/icons-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] px-5 py-8 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-100/60 md:grid-cols-2">

          {/* Panel de presentación */}
          <section className="relative flex flex-col justify-between overflow-hidden bg-[#3478F6] p-8 text-white md:min-h-[650px] md:p-12">
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

            <div className="relative z-10 my-12">
              <span className="mb-5 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
                Aprende creando
              </span>

              <h1 className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
                Convierte tus ideas en proyectos reales.
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
                Explora, experimenta y desarrolla nuevas habilidades mediante
                herramientas interactivas de programación, robótica,
                electrónica y análisis de datos.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-sm text-blue-100">
              <span className="h-2 w-2 rounded-full bg-[#21B8A6]" />
              Un espacio para aprender haciendo.
            </div>
          </section>

          {/* Panel del formulario */}
          <section className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-9">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3478F6]">
                  Bienvenido a ProtoLab
                </p>

                <h2 className="text-3xl font-bold text-[#24324A]">
                  ¡Bienvenido de nuevo!
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#718096]">
                  Ingresa tus datos para continuar aprendiendo y desarrollando
                  tus proyectos.
                </p>
              </div>

              <LoginForm />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}