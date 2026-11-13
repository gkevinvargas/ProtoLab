"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import ClaseTeorica from "./ClaseTeorica";

type Clase = ComponentProps<typeof ClaseTeorica>["clase"] & {
  orden: number;
};

export default function RecorridoTeorico({
  clases,
  children,
}: {
  clases: readonly Clase[];
  children: ReactNode;
}) {
  const [indice, setIndice] = useState(0);
  const [vistas, setVistas] = useState<string[]>([]);

  const ordenadas = [...clases].sort((a, b) => a.orden - b.orden);
  const claseActual = ordenadas[indice];

  if (!claseActual) return <>{children}</>;

  const esUltima = indice === ordenadas.length - 1;

  function terminarClase() {
    const id = claseActual.identificador;

    setVistas((actuales) =>
      actuales.includes(id) ? actuales : [...actuales, id]
    );
    setIndice(indice + 1);
  }

  return (
    <section aria-label="Clases teóricas" className="space-y-4">
      <p aria-live="polite" className="text-sm font-semibold text-slate-700">
        Clase {indice + 1} de {ordenadas.length} · {vistas.length} de{" "}
        {ordenadas.length} vistas
      </p>

      <ol aria-label="Avance de las clases" className="flex flex-wrap gap-2">
        {ordenadas.map((clase, posicion) => {
          const vista = vistas.includes(clase.identificador);

          return (
            <li key={clase.identificador}>
              <button
                type="button"
                disabled={posicion !== indice && !vista}
                aria-current={posicion === indice ? "step" : undefined}
                onClick={() => setIndice(posicion)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
              >
                Clase {posicion + 1}
                {vista && " · Vista"}
              </button>
            </li>
          );
        })}
      </ol>

      <ClaseTeorica key={claseActual.identificador} clase={claseActual} abierta />

      <button
        type="button"
        onClick={terminarClase}
        className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        {esUltima
          ? "Marcar como vista e ir a la práctica"
          : "Marcar como vista y continuar"}
      </button>
    </section>
  );
}