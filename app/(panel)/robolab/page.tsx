"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ClaseTeorica from "@/components/laboratorios/ClaseTeorica";
import RoboLabScreen from "@/components/robolab/RoboLabScreen";
import ElectroLabScreen from "@/components/electrolab/electrolab-screen";
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import {
  actividadesDeRuta,
  claveAvance,
  leerAvance,
  leerRuta,
  type Ruta,
} from "@/lib/ruta/actividades";

function leerMejorNota(ruta: Ruta, id: string): number | null {
  const guardada = localStorage.getItem(`${claveAvance(ruta)}:mejor:${id}`);

  if (guardada === null || guardada.trim() === "") return null;

  const puntaje = Number(guardada);
  return Number.isFinite(puntaje) && puntaje >= 0 && puntaje <= 100
    ? puntaje
    : null;
}

export default function RutaPage() {
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [completadas, setCompletadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nota, setNota] = useState<number | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    try {
      const guardada = leerRuta();
      if (!guardada) return;

      const avance = leerAvance(guardada);
      const pendiente = actividadesDeRuta(guardada).find(
        ({ id }) => !avance.includes(id)
      );

      if (pendiente?.tipo === "practica_individual") {
        setNota(leerMejorNota(guardada, pendiente.id));
      }

      setCompletadas(avance);
      setRuta(guardada);
    } catch {
      setError("No se pudo leer la ruta guardada en este navegador.");
    } finally {
      setCargando(false);
    }
  }, []);

  if (cargando) {
    return <p className="p-6" role="status">Cargando tu ruta…</p>;
  }

  if (!ruta) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
        <h1 className="text-2xl font-bold">Tu ruta de aprendizaje</h1>
        <p>{error || "Completa el diagnóstico y guarda tu ruta para empezar."}</p>
        <Link href="/protected/diagnostico" className="text-blue-700 underline">
          Ir al diagnóstico
        </Link>
      </main>
    );
  }

  const rutaActual = ruta;
  const actividades = actividadesDeRuta(rutaActual);
  const totalCompletadas = actividades.filter(
    ({ id }) => completadas.includes(id)
  ).length;
  const actual = actividades.find(({ id }) => !completadas.includes(id));
  const laboratorios = [...new Set(actividades.map(({ laboratorio }) => laboratorio))];
  const esUltima = totalCompletadas === actividades.length - 1;

  function continuar() {
    if (!actual || (actual.tipo === "practica_individual" && nota === null)) {
      return;
    }

    try {
      const avance = [...new Set([...leerAvance(rutaActual), actual.id])];
      const siguiente = actividades.find(({ id }) => !avance.includes(id));
      const notaSiguiente =
        siguiente?.tipo === "practica_individual"
          ? leerMejorNota(rutaActual, siguiente.id)
          : null;

      localStorage.setItem(claveAvance(rutaActual), JSON.stringify(avance));
      setCompletadas(avance);
      setNota(notaSiguiente);
      setError("");
    } catch {
      setError("No se pudo guardar el avance. Intenta de nuevo.");
    }
  }

  function registrarAprobacion(puntaje: number) {
    if (actual?.tipo !== "practica_individual") return;

    try {
      const clave = `${claveAvance(rutaActual)}:mejor:${actual.id}`;
      const mejor = Math.max(leerMejorNota(rutaActual, actual.id) ?? 0, puntaje);

      localStorage.setItem(clave, String(mejor));
      setNota(mejor);
      setError("");
    } catch {
      setError("No se pudo guardar el resultado. Puedes volver a evaluar.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/70 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white md:p-8">
          <Link
            href="/"
            className="inline-block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700"
          >
            ← Volver a Inicio
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Tu ruta de aprendizaje</h1>
          <p className="mt-2 text-blue-100">{laboratorios.join(" → ")}</p>
        </header>

        <section
          aria-labelledby="avance-ruta"
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <h2 id="avance-ruta" className="font-bold">Tu avance</h2>
          <p role="status" className="mt-2 text-sm font-semibold text-blue-700">
            {totalCompletadas} de {actividades.length} actividades completadas
          </p>
          <progress
            aria-labelledby="avance-ruta"
            value={totalCompletadas}
            max={actividades.length}
            className="mt-3 h-2 w-full accent-blue-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold">
            {actual ? "Actividades de tu ruta" : "Actividades completadas"}
          </h2>
          <ol className="mt-3 space-y-2">
            {actividades.map((actividad) => {
              const completa = completadas.includes(actividad.id);
              const enCurso = actividad.id === actual?.id;

              return (
                <li
                  key={actividad.id}
                  aria-current={enCurso ? "step" : undefined}
                  className={`flex flex-wrap justify-between gap-2 rounded-xl border p-3 ${
                    completa
                      ? "border-emerald-200 bg-emerald-50"
                      : enCurso
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-medium">{actividad.titulo}</p>
                    <p className="text-sm text-slate-600">
                      {actividad.laboratorio} ·{" "}
                      {actividad.tipo === "clase_teorica"
                        ? "Clase teórica"
                        : "Práctica individual"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {completa ? "Completada" : enCurso ? "En curso" : "Pendiente"}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {actual?.tipo === "clase_teorica" && (
          <ClaseTeorica key={actual.id} clase={actual.clase} abierta />
        )}

        {actual?.tipo === "practica_individual" && (
          <section key={actual.id} aria-label={actual.titulo} className="space-y-4">
            <h2 className="text-xl font-bold">{actual.titulo}</h2>

            {actual.area === "robolab" && (
              <RoboLabScreen onApproved={registrarAprobacion} />
            )}

            {actual.area === "electrolab" && (
              <ElectroLabScreen onApproved={registrarAprobacion} />
            )}

            {actual.area === "datalab" && (
              <DataLabOverview
                key={intento}
                onApproved={registrarAprobacion}
                onReset={() => setIntento((anterior) => anterior + 1)}
              />
            )}

            <p role="status" className="text-sm font-medium">
              {nota === null
                ? "Cumple el objetivo de la práctica para continuar."
                : `Práctica aprobada · Mejor resultado: ${nota} de 100.`}
            </p>
          </section>
        )}

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        {actual ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={continuar}
              disabled={actual.tipo === "practica_individual" && nota === null}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actual.tipo === "clase_teorica"
                ? "Marcar como vista y continuar"
                : esUltima
                  ? "Terminar ruta"
                  : "Continuar a la siguiente actividad"}
            </button>
          </div>
        ) : (
          <p role="status" className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-800">
            Completaste tu ruta de aprendizaje.
          </p>
        )}
      </div>
    </main>
  );
}