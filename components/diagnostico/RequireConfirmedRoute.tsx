
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

const CLAVE_RUTA = "protolab:ruta-aprendizaje";

function validarRuta(valor: unknown): boolean {
  if (!Array.isArray(valor) || valor.length !== 2) return false;

  const esArea = (area: unknown) =>
    area === "robolab" ||
    area === "electrolab" ||
    area === "datalab";

  return (
    esArea(valor[0]) &&
    esArea(valor[1]) &&
    valor[0] !== valor[1]
  );
}

export default function RequireConfirmedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [permitido, setPermitido] = useState<boolean | null>(null);

  useEffect(() => {
    function comprobarRuta() {
      try {
        const guardada = JSON.parse(
          localStorage.getItem(CLAVE_RUTA) ?? "null"
        );

        setPermitido(validarRuta(guardada));
      } catch {
        setPermitido(false);
      }
    }

    comprobarRuta();

    window.addEventListener("storage", comprobarRuta);

    return () => {
      window.removeEventListener("storage", comprobarRuta);
    };
  }, []);

  if (permitido === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p role="status" className="text-slate-500">
          Verificando tu ruta de aprendizaje...
        </p>
      </div>
    );
  }

  if (!permitido) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            🔒
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            ¡Primero descubre tu ruta!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Para acceder a los laboratorios necesitas completar
            el diagnóstico vocacional y confirmar tu ruta de aprendizaje.
          </p>

          <Link
            href="/diagnostico"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Realizar diagnóstico
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
