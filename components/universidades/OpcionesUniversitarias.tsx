"use client";

import { useEffect, useState } from "react";

import type { Ruta } from "@/lib/ruta/actividades";

type AreaProtoLab = "robolab" | "electrolab" | "datalab";

type ProgramaRecomendado = {
  nombre: string;
  nivel: string | null;
  modalidad: string | null;
  campoAmplio: string | null;
  areas: AreaProtoLab[];
  matricula: number | null;
};

type InstitucionRecomendada = {
  clave: string;
  nombre: string;
  escuela: string;
  municipio: string;
  sostenimiento: string | null;
  clasificacion: string | null;
  programas: ProgramaRecomendado[];
};

type RespuestaUniversidades = {
  municipio: string;
  ciclo: string;
  fuente: string;
  notaClasificacion: string;
  instituciones: InstitucionRecomendada[];
};

const nombresAreas: Record<AreaProtoLab, string> = {
  robolab: "RoboLab",
  electrolab: "ElectroLab",
  datalab: "DataLab",
};

export default function OpcionesUniversitarias({ ruta }: { ruta: Ruta }) {
  const [datos, setDatos] = useState<RespuestaUniversidades | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const areasKey = ruta.join(",");

  useEffect(() => {
    const controller = new AbortController();

    async function consultarOferta() {
      setCargando(true);
      setError("");
      setDatos(null);

      try {
        const respuesta = await fetch(
          `/api/universidades/recomendadas?areas=${encodeURIComponent(areasKey)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        const resultado = (await respuesta.json().catch(() => null)) as
          | (RespuestaUniversidades & { error?: string })
          | null;

        if (!respuesta.ok || !resultado) {
          throw new Error(
            resultado?.error ||
              "No fue posible consultar la oferta académica en este momento."
          );
        }

        setDatos(resultado);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible consultar las instituciones."
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    void consultarOferta();

    return () => controller.abort();
  }, [areasKey]);

  const candidatas = (datos?.instituciones ?? [])
    .flatMap((institucion) =>
      institucion.programas.map((programa) => ({
        institucion,
        programa,
        afinidad:
          Number(programa.areas.includes(ruta[0])) * 2 +
          Number(programa.areas.includes(ruta[1])),
      }))
    )
    .filter(({ afinidad }) => afinidad > 0)
    .sort(
      (a, b) =>
        b.afinidad - a.afinidad ||
        a.programa.nombre.localeCompare(b.programa.nombre, "es") ||
        a.institucion.nombre.localeCompare(b.institucion.nombre, "es") ||
        a.institucion.escuela.localeCompare(b.institucion.escuela, "es")
    );

  const porInstitucion = new Map<InstitucionRecomendada, ProgramaRecomendado[]>();
  const carrerasVistas = new Set<string>();

  for (const { institucion, programa } of candidatas) {
    const nombre = programa.nombre.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
    if (carrerasVistas.has(nombre)) continue;

    carrerasVistas.add(nombre);
    const programas = porInstitucion.get(institucion) ?? [];
    programas.push(programa);
    porInstitucion.set(institucion, programas);

    if (carrerasVistas.size === 3) break;
  }

  const institucionesPrincipales = Array.from(
    porInstitucion,
    ([institucion, programas]) => ({ ...institucion, programas })
  );

  return (
    <section
      aria-labelledby="opciones-universitarias"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h2 id="opciones-universitarias" className="text-xl font-bold">
        Dónde puedes seguir estudiando
      </h2>

      {cargando ? (
        <p className="mt-3 text-sm text-slate-600" role="status">
          Consultando instituciones y carreras…
        </p>
      ) : error ? (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
          role="alert"
        >
          <p className="text-sm text-amber-900">{error}</p>
          <p className="mt-1 text-xs text-amber-800">
            La oferta académica no está disponible temporalmente. Tu ruta de
            aprendizaje se conserva sin cambios.
          </p>
        </div>
      ) : datos ? (
        <>
          <p className="mt-2 text-sm text-slate-600">
            Carreras con mayor afinidad a tu ruta en {datos.municipio}, Jalisco.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Ciclo escolar consultado: {datos.ciclo}
          </p>

          {institucionesPrincipales.length > 0 ? (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {institucionesPrincipales.map((institucion) => (
                <li
                  key={`${institucion.clave}-${institucion.escuela}`}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="font-semibold text-slate-900">
                    {institucion.nombre}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {institucion.escuela} · {institucion.municipio}, Jalisco
                  </p>

                  {(institucion.sostenimiento || institucion.clasificacion) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {[institucion.sostenimiento, institucion.clasificacion]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Carreras recomendadas
                  </p>

                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {institucion.programas.map((programa) => (
                      <li
                        key={`${programa.nombre}-${programa.nivel}-${programa.modalidad}`}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <p className="font-medium">{programa.nombre}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            programa.nivel,
                            programa.modalidad,
                            programa.campoAmplio,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {programa.areas.length > 0 ? (
                          <p className="mt-2 flex flex-wrap gap-1">
                            {programa.areas.map((area) => (
                              <span
                                key={area}
                                className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                              >
                                Recomendación: {nombresAreas[area]}
                              </span>
                            ))}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">
                            Otra opción académica disponible en {datos.municipio}.
                            No tiene una relación directa identificada con los
                            laboratorios de tu ruta.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              No encontramos carreras afines para el ciclo {datos.ciclo} en {datos.municipio}.
            </p>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">{datos.fuente}</p>
            <p className="mt-1 text-xs text-slate-500">
              {datos.notaClasificacion}
            </p>
            <a
              href="https://anuario.anuies.mx/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-blue-700 underline"
            >
              Consultar el Anuario Estadístico de ANUIES
            </a>
          </div>
        </>
      ) : null}
    </section>
  );
}
