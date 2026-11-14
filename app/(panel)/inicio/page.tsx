
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ElementType } from "react";

import robo01 from "@/app/(panel)/robolab/clase-teorica.json";
import robo02 from "@/app/(panel)/robolab/RL-CT-02.json";
import electro01 from "@/lib/electrolab/clases/EL-CT-01-fundamentos-led.json";
import electro02 from "@/lib/electrolab/clases/EL-CT-02-conexion-serie-led.json";
import electro03 from "@/lib/electrolab/clases/EL-CT-03-ley-ohm-resistencia-led.json";
import data01 from "@/lib/datalab/DL-CT-01.json";
import data02 from "@/lib/datalab/DL-CT-02.json";

import {
  IconClipboardText,
  IconRobot,
  IconChartLine,
  IconCpu,
  IconLock,
} from "@tabler/icons-react";

type Module = {
  name: string;
  description: string;
  icon: ElementType;
  color: string;
  accent: string;
  href: string;
};

const CLAVE_RUTA = "protolab:ruta-aprendizaje";

const modules: Module[] = [
  {
    name: "Diagnóstico vocacional",
    description:
      "Descubre cuáles son tus intereses y conoce las áreas de conocimiento con las que se pueden relacionar.",
    icon: IconClipboardText,
    color: "bg-[#FFF3DD]",
<<<<<<< HEAD
    accent: "text-[#D9020]",
    status: "---",
=======
    accent: "text-[#D97706]",
>>>>>>> c691a09073efe4f7493a17bd2e741904bb7063d6
    href: "/diagnostico",
  },
  {
    name: "RoboLab",
    description:
      "Construye instrucciones y resuelve desafíos utilizando tu lógica y la ayuda de un robot virtual.",
    icon: IconRobot,
    color: "bg-[#E8F0FF]",
    accent: "text-[#3479F6]",
    href: "/robolab2",
  },
  {
    name: "DataLab",
    description:
      "Explora conjuntos de datos, interpreta gráficas y resuelve actividades.",
    icon: IconChartLine,
    color: "bg-[#E1F7F2]",
    accent: "text-[#159B89]",
    href: "/datalab",
  },
  {
    name: "ElectroLab",
    description:
      "Experimenta con modelos electrónicos y modifica circuitos virtuales.",
    icon: IconCpu,
    color: "bg-[#F0EAFE]",
    accent: "text-[#8865D8]",
    href: "/electrolab",
  },
];

const laboratoriosRuta = {
  robolab: {
    nombre: "RoboLab",
    clases: [robo01, robo02],
  },
  electrolab: {
    nombre: "ElectroLab",
    clases: [electro01, electro02, electro03],
  },
  datalab: {
    nombre: "DataLab",
    clases: [data01, data02],
  },
};

type AreaRuta = keyof typeof laboratoriosRuta;

function esAreaRuta(valor: unknown): valor is AreaRuta {
  return (
    valor === "robolab" ||
    valor === "electrolab" ||
    valor === "datalab"
  );
}

function leerRutaGuardada(): AreaRuta[] | null {
  try {
    const guardada: unknown = JSON.parse(
      localStorage.getItem(CLAVE_RUTA) ?? "null"
    );

    if (!Array.isArray(guardada) || guardada.length !== 2) {
      return null;
    }

    const [principal, complementaria] = guardada;

    if (
      !esAreaRuta(principal) ||
      !esAreaRuta(complementaria) ||
      principal === complementaria
    ) {
      return null;
    }

    return [principal, complementaria];
  } catch {
    return null;
  }
}

function leerRutaConfirmada(): boolean {
  return leerRutaGuardada() !== null;
}

function leerResumenRuta() {
  const guardada = leerRutaGuardada();

  if (!guardada) return null;

  const [principal, complementaria] = guardada;

  const areas = [
    laboratoriosRuta[principal],
    laboratoriosRuta[complementaria],
  ];

  const clases = areas.flatMap(({ nombre, clases }) =>
    [...clases]
      .sort((a, b) => a.orden - b.orden)
      .map((clase) => ({
        id: clase.identificador,
        titulo: clase.titulo,
        laboratorio: nombre,
      }))
  );

  const avance: unknown = JSON.parse(
    localStorage.getItem(
      `protolab:avance-ruta:${principal}:${complementaria}`
    ) ?? "[]"
  );

  const vistas = new Set<string>(
    Array.isArray(avance)
      ? avance.filter(
          (id): id is string => typeof id === "string"
        )
      : []
  );

  const actividades = clases.map((clase) => ({
    ...clase,
    completada: vistas.has(clase.id),
  }));

  return {
    nombres: areas.map(({ nombre }) => nombre),
    actividades,
    siguiente: actividades.find((clase) => !clase.completada),
    completadas: actividades.filter(
      (clase) => clase.completada
    ).length,
    total: actividades.length,
  };
}

export default function Home() {
  const [rutaConfirmada, setRutaConfirmada] = useState(false);

  const [resumenRuta, setResumenRuta] =
    useState<ReturnType<typeof leerResumenRuta>>(null);

  const [cargandoRuta, setCargandoRuta] = useState(true);

  useEffect(() => {
    function actualizarRuta() {
      try {
        const confirmada = leerRutaConfirmada();

        setRutaConfirmada(confirmada);
        setResumenRuta(
          confirmada ? leerResumenRuta() : null
        );
      } catch {
        setRutaConfirmada(false);
        setResumenRuta(null);
      } finally {
        setCargandoRuta(false);
      }
    }

    actualizarRuta();

    window.addEventListener("pageshow", actualizarRuta);
    window.addEventListener("storage", actualizarRuta);
    window.addEventListener("focus", actualizarRuta);

    return () => {
      window.removeEventListener("pageshow", actualizarRuta);
      window.removeEventListener("storage", actualizarRuta);
      window.removeEventListener("focus", actualizarRuta);
    };
  }, []);

<<<<<<< HEAD
    <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-7">
      <section className="relative mb-10 overflow-hidden rounded-[28px] bg-[#2478F6] p-7 text-white sm:-10">
=======
  return (
    <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">

      {/* ENCABEZADO */}
      <section className="relative mb-10 overflow-hidden rounded-[28px] bg-[#2478F6] p-7 text-white sm:p-10">
>>>>>>> c691a09073efe4f7493a17bd2e741904bb7063d6
        <div className="relative z-10 max-w-xl">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            Tu área para descubrir
          </span>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            Aprende y descubre cuáles son tus talentos
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-6 text-blue-50 sm:text-base">
            Explora las diferentes áreas tecnológicas, encuentra,
            resuelve desafíos y desarrolla nuevas habilidades a tu
            propio ritmo.
          </p>

          <a
            href="#modulos"
            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3478F6] transition hover:bg-blue-50"
          >
            Explorar módulos...
          </a>
        </div>

        <div
          aria-hidden="true"
          className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-[#21B8A6] opacity-80"
        />

        <div className="absolute right-10 top-10 hidden text-7xl sm:block">
          ---
        </div>
      </section>

      {/* AVANCE GENERAL */}
      <section id="progreso" className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold">
            Tu progreso
          </h2>

          <p className="mt-1 text-sm text-[#718096]">
            Un resumen de tu actividad en la plataforma.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-[#E7EDF5] bg-white p-5">
            <p className="text-sm text-[#718096]">
              Módulos disponibles
            </p>

            <p className="mt-3 text-3xl font-extrabold text-[#3478F6]">
              {cargandoRuta ? "..." : rutaConfirmada ? 4 : 1}
            </p>

            <p className="mt-1 text-xs text-[#718096]">
              {rutaConfirmada
                ? "Diagnóstico y laboratorios habilitados"
                : "Diagnóstico vocacional disponible"}
            </p>

            <p className="mt-5 text-sm text-[#718096]">
              Actividades completadas
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#21B8A6]">
              {cargandoRuta ? "..." : resumenRuta?.completadas ?? 0}
            </p>
          </div>

          {/* RESUMEN DE LA RUTA */}
          <div className="rounded-2xl border border-[#E7EDF5] bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Tu ruta de aprendizaje
            </h3>

            {cargandoRuta ? (
              <p role="status" className="mt-3 text-sm text-slate-600">
                Cargando tu ruta...
              </p>
            ) : resumenRuta ? (
              <>
                <p className="mt-2 text-sm text-slate-700">
                  {resumenRuta.nombres.join(" → ")}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {resumenRuta.completadas} de {resumenRuta.total} actividades completadas
                </p>

                <progress
                  aria-label="Avance de tu ruta"
                  value={resumenRuta.completadas}
                  max={resumenRuta.total}
                  className="mt-3 block h-2 w-full accent-blue-600"
                />

                {resumenRuta.siguiente && (
                  <p className="mt-3 text-sm text-slate-700">
                    Siguiente clase:{" "}
                    <strong>{resumenRuta.siguiente.titulo}</strong>
                  </p>
                )}

                <details className="mt-3 text-sm text-slate-700">
                  <summary className="cursor-pointer font-medium text-blue-700">
                    {resumenRuta.siguiente
                      ? "Ver clases de la ruta"
                      : "Ver clases completadas"}
                  </summary>

                  <ol className="mt-2 space-y-2">
                    {resumenRuta.actividades.map((clase) => (
                      <li
                        key={clase.id}
                        className={`rounded-lg border p-2 ${
                          clase.completada
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : clase.id === resumenRuta.siguiente?.id
                              ? "border-blue-200 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className="font-medium">
                          {clase.titulo}
                        </p>

                        <p className="text-xs text-slate-600">
                          {clase.laboratorio} ·{" "}
                          {clase.completada
                            ? "Completada"
                            : clase.id === resumenRuta.siguiente?.id
                              ? "Siguiente"
                              : "Pendiente"}
                        </p>
                      </li>
                    ))}
                  </ol>
                </details>

                <Link
                  href="/ruta"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {resumenRuta.siguiente
                    ? "Continuar ruta"
                    : "Ver ruta completada"}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Completa el diagnóstico y confirma tu ruta de
                  aprendizaje para desbloquear los laboratorios.
                </p>

                <Link
                  href="/diagnostico"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Hacer diagnóstico
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* MODULOS */}
      <section id="modulos">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold">
            Explora tus módulos
          </h2>

          <p className="mt-1 text-sm text-[#718096]">
            {rutaConfirmada
              ? "Elige un área y comienza a descubrir nuevas habilidades."
              : "Completa el diagnóstico vocacional para desbloquear los laboratorios."}
          </p>
        </div>

<<<<<<< HEAD
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {modules.map((module) => (

            <Link key={module.name} href={module.href}>
              <article
              key={module.name}
              className="group rounded-2xl border border-[#E7EDF5] bg-white p-6 transition duration-200 hover:translate-y-1 hover:border-[#C8D9F5] hover:shadow-lg hover:shadow-blue-100/50">
              <div className="mb-5 flex items-center justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${module.color}`}
                >
                  <module.icon size={28} stroke={1.8} />
=======
        {!rutaConfirmada && !cargandoRuta && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Laboratorios bloqueados.</strong>{" "}
            Primero debes realizar y confirmar tu diagnóstico vocacional.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">

          {modules.map((module) => {
            const esDiagnostico = module.href === "/diagnostico";
            const disponible = esDiagnostico || rutaConfirmada;
            const Icono = module.icon;

            return (
              <article
                key={module.name}
                aria-disabled={!disponible}
                className={`rounded-2xl border border-[#E7EDF5] bg-white p-6 transition duration-200 ${
                  disponible
                    ? "group hover:translate-y-1 hover:border-[#C8D9F5] hover:shadow-lg hover:shadow-blue-100/50"
                    : "cursor-not-allowed opacity-65"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${module.color}`}
                  >
                    <Icono size={28} stroke={1.8} />
                  </div>

                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      disponible
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {!disponible && <IconLock size={13} />}
                    {disponible ? "Disponible" : "Bloqueado"}
                  </span>
>>>>>>> c691a09073efe4f7493a17bd2e741904bb7063d6
                </div>

                <h3 className="text-lg font-extrabold">
                  {module.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-[#718096]">
                  {module.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  {disponible ? (
                    <Link
                      href={module.href}
                      className={`text-sm font-bold ${module.accent}`}
                    >
                      {esDiagnostico
                        ? "Realizar diagnóstico"
                        : "Explorar área"}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">
                      Confirma tu diagnóstico para acceder
                    </span>
                  )}

<<<<<<< HEAD
              <div className="mt-5 flex items-center justify-between">
                <span className={`text-sm font-bold ${module.accent}`}>
                  Explorar área
                </span>

                <span className="text-lg text-[#A0AEC0] transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </article>
            </Link>

          ))}
=======
                  {disponible ? (
                    <span className="text-lg text-[#A0AEC0] transition group-hover:translate-x-1">
                      →
                    </span>
                  ) : (
                    <IconLock size={20} className="text-slate-400" />
                  )}
                </div>
              </article>
            );
          })}
>>>>>>> c691a09073efe4f7493a17bd2e741904bb7063d6
        </div>
      </section>

      {/* PIE */}
      <footer className="mt-12 border-t border-[#E7EDF5] py-6 text-center text-xs text-[#A0AEC0]">
        ProtoLab · Aprende creando y descubre tu potencial.
      </footer>
    </div>
  );
}
