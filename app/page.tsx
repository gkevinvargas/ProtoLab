"use client"
import { useEffect, useState } from "react";
import robo01 from "@/app/robolab/clase-teorica.json";
import robo02 from "@/app/robolab/RL-CT-02.json";
import electro01 from "@/lib/electrolab/clases/EL-CT-01-fundamentos-led.json";
import electro02 from "@/lib/electrolab/clases/EL-CT-02-conexion-serie-led.json";
import electro03 from "@/lib/electrolab/clases/EL-CT-03-ley-ohm-resistencia-led.json";
import data01 from "@/lib/datalab/DL-CT-01.json";
import data02 from "@/lib/datalab/DL-CT-02.json";
import Link from "next/link";
import {
  IconUserCircle,
  IconBulb,
  IconClipboardText,
  IconRobot,
  IconChartLine,
  IconCpu,
  IconHome,
  IconLayoutGrid,
  IconClock,
} from "@tabler/icons-react";

import type { ElementType } from "react";
type Module = {
  name: string;
  description: string;
  icon: ElementType;
  color: string;
  accent: string;
  status: string;
  href: string;
};

const modules : Module[] = [
  {
    name: "Diagnóstico vocacional",
    description:
    "Descubre cuáles son tus intereses y conoce las áreas de conocimiento con las que se pueden relacionar",
    icon: IconClipboardText,
    color: "bg-[#FFF3DD]",
    accent: "text-[#D9020]",
    status: "---",
    href: "/diagnóstico",
  },
  {
    name: "Robolab",
    description:
    "Construye instrucciones y resuleve los desafíos utilizando tu lógica y la ayuda de un robot virtual.",
    icon: IconRobot,
    color: "bg-[#E8F0FF]",
    accent: "text-[#3479F6]",
    status: "---",
    href: "/robolab",

  },
  {
    name: "Datalab",
    description:
    "Explora en un conjunto de datos, interpretados en gráficas y resuelve las actividades.",
    icon: IconChartLine,
    color: "bg-[#E1F7F2]",
    accent: "text-[#159B89]",
    status: "---",
    href: "/datalab",
  },
  {
    name: "Electrolab",
    description:
    "Experimenta con modelos electrónicos y modifica circuitos virtuales.",
    icon: IconCpu,
    color: "bg-[#F0EAFE]",
    accent: "text-[#8865D8]",
    status: "---",
    href: "/electrolab",
  },
];
const laboratoriosRuta = {
  robolab: { nombre: "RoboLab", clases: [robo01, robo02] },
  electrolab: { nombre: "ElectroLab", clases: [electro01, electro02, electro03] },
  datalab: { nombre: "DataLab", clases: [data01, data02] },
};

type AreaRuta = keyof typeof laboratoriosRuta;

function esAreaRuta(valor: unknown): valor is AreaRuta {
  return valor === "robolab" || valor === "electrolab" || valor === "datalab";
}

function leerResumenRuta() {
  const guardada: unknown = JSON.parse(
    localStorage.getItem("protolab:ruta-aprendizaje") ?? "null"
  );

  if (!Array.isArray(guardada)) return null;

  const [principal, complementaria] = guardada;
  if (
    !esAreaRuta(principal) ||
    !esAreaRuta(complementaria) ||
    principal === complementaria
  ) {
    return null;
  }

  const areas = [laboratoriosRuta[principal], laboratoriosRuta[complementaria]];
  const clases = areas.flatMap(({ nombre, clases }) =>
    [...clases].sort((a, b) => a.orden - b.orden).map((clase) => ({
      id: clase.identificador,
      titulo: clase.titulo,
      laboratorio: nombre,
    }))
  );
  const avance: unknown = JSON.parse(
    localStorage.getItem(`protolab:avance-ruta:${principal}:${complementaria}`) ?? "[]"
  );
  const vistas = new Set(Array.isArray(avance) ? avance : []);
  const actividades = clases.map((clase) => ({
    ...clase,
    completada: vistas.has(clase.id),
  }));

  return {
    nombres: areas.map(({ nombre }) => nombre),
    actividades,
    siguiente: actividades.find((clase) => !clase.completada),
    completadas: actividades.filter((clase) => clase.completada).length,
    total: actividades.length,
  };
}

export default function Home(){
  const [resumenRuta, setResumenRuta] =
  useState<ReturnType<typeof leerResumenRuta>>(null);
const [cargandoRuta, setCargandoRuta] = useState(true);

useEffect(() => {
  function actualizarRuta() {
    try {
      setResumenRuta(leerResumenRuta());
    } catch {
      setResumenRuta(null);
    } finally {
      setCargandoRuta(false);
    }
  }

  actualizarRuta();
  window.addEventListener("pageshow", actualizarRuta);
  window.addEventListener("storage", actualizarRuta);

  return () => {
    window.removeEventListener("pageshow", actualizarRuta);
    window.removeEventListener("storage", actualizarRuta);
  };
}, []);
  return(
    <div className="min-h-screen md:flex">
      {/*Menu*/}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E7EDF5] bg-white p-6 md:flex">
        <Link href="/" className = "mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3478F6] text-2xl text-white">
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Proto<span className="text-[#3478F6]">Lab</span>
            </h1>
            <p className="text-xs text-[#718096]">
              Aprende creando
            </p>

          </div>
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">
          Menú principal
        </p>

        <nav className="flex flex-col gap-2 font-semibold">
          <a 
          href = "#inicio"
          className="flex items-center gap-3 rounded-xl gb-[#EAF1FF] px-4 py-3 text-[#3478F6] transition">
            <IconHome size={21} stroke={1.8}/>
            Inicio
          </a>

          <a
          href="#modulos"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#718096] transiton hover:bg-[#F5F9FF] hover:text-[#3478F6]">
            <IconLayoutGrid size={21} stroke={1.8}/>
            Mis módulos
          </a>

          <a 
          href = "progreso"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#718096] transition hover:bg-[#F5F9FF] hover:text-[#3478F6]">
            <IconClock size={21} stroke={1.8}/>
            Mi progreso
            </a> 


        </nav>

        <div className="mt-auto rounded-2xl bg-[#F0F7FF] p-4">
          <div className="mb-2 text-[#FFB547]">
            <IconBulb size={21} stroke={1.8}/>
          </div>
          <h3 className="font-bold">¡Continúa explorando!</h3>
          <p className="mt-1 text-sm leading-5 text-[718096]">
            ¡Cada una de las actividades es una nueva oportunidad de aprender algo!
          </p>
        </div>
      </aside>

      {/* Contenido*/}
      <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12">
        <header
        id= "inicio"
        className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#718096]">
              Plataforma de aprendizaje
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font.bold"> Estudiante</p>
              <p className="text-xs text-[#718096]">
              Mi área de estudio
              </p>
            </div>

            <div className="flex h11 w-11 items-center justify-center rounded-full bg-[#DCE9FF] font-bold text-[#3478F6]">
              <IconUserCircle size={21} stroke={1.8}/>
            </div>
          </div>
        </header>

        {/* Bienvenida */}
        <section className="relative mb-10 overflow-hidden rounded-[28px] bg-[#2478F6] p-7 text-white sm:-10">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-white/20 px-3 py-3 py-1 text-xs font-semibold">
            Tu área para descubrir 
            </span>
            
            <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
              Aprende y descubre cuáles son tus talentos
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-blue-50 sm:text-base">
              Explora las diferentes áreas tecnológicas, encuentra, resuelve desafíos y desarrolla nuevas habilidades a tu propio ritmo
            </p>

            <a
            href = "#modulos"
            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3478F6] transition hover:bg-blue-50">
            Explorar módulos...  
            </a>
          </div>

          <div
          aria-hidden = "true"
          className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10"/>
          <div 
          aria-hidden="true"
          className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-[#21B8A6] opacity-80"/>
          <div className="absolute right-10 top-10 hidden text-7xl sm:block">
            ---
            
          </div>
        </section>

      {/* Resumen de progreso */}  
      <section id= "progreso" className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold">
            Tu progreso
          </h2>
          <p className="mt-1 text-sm text-[#718096]">
            Un resumen de tu actividad en la plataforma.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7EDF5] bg-white p-5">
            <p className="text-sm: text-[#718096]">
              Módulos disponibles
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[#3478F6]">
              4
            </p>
            <p className="mt-1 text-xs text-[#718096]">
              Actividades completadas
            </p>
            <p className="mt-3 text-3xl font-extrabold text-[#21B8A6]">
              {cargandoRuta ? "…" : resumenRuta?.completadas ?? 0}
            </p>
            <p className="mt-1 text-xs text-[#718096]">
              Comienza el aprendizaje
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7EDF5] bg-white p-5">
  <h3 className="font-semibold text-slate-900">Tu ruta de aprendizaje</h3>

  {cargandoRuta ? (
    <p role="status" className="mt-3 text-sm text-slate-600">
      Cargando tu ruta…
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
          Siguiente clase: <strong>{resumenRuta.siguiente.titulo}</strong>
        </p>
      )}
      <details className="mt-3 text-sm text-slate-700">
        <summary className="cursor-pointer font-medium text-blue-700">
          {resumenRuta.siguiente ? "Ver clases de la ruta" : "Ver clases completadas"}
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
              <p className="font-medium">{clase.titulo}</p>
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
      {resumenRuta.siguiente && (
        <Link
          href="/ruta"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {resumenRuta.completadas > 0 ? "Continuar ruta" : "Empezar ruta"}
        </Link>
      )}
    </>
  ) : (
    <>
      <p className="mt-2 text-sm text-slate-600">
        Completa el diagnóstico y guarda tu ruta para empezar.
      </p>
      <Link
        href="/protected/diagnostico"
        className="mt-4 inline-block text-sm font-semibold text-blue-700 underline"
      >
        Hacer diagnóstico
      </Link>
    </>
  )}
</div>
        </div>
      </section>

      {/* Modulos */}
      <section id="modulos">
        <div className="mb-5">
          <h2 className="text-xl font-extrabold">
          Explora tus módulos
          </h2>
          <p className="mt-1 text-sm text-[#718096]">
            Elige un área y comienza a descubir nuevas habilidades.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {modules.map((module) =>(
            <article
              key={module.name}
              className="group rounded-2xl border border-[#E7EDF5] bg-white p-6 transition duration-200 hover:translate-y-1 hover:border-[#C8D9F5] hover:shadow-lg hover:shadow-blue-100/50">
                <div className="mb-5 flex items-center justify-between">
                  <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${module.color}`}
                  >
                    <module.icon size={28} stroke={1.8} />
                  </div>

                  <span className="rounded-full bg-[#F3F6FA] px-3 py-1 text-xs font-semibold text-[#718096]">
                    {module.status}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold">
                  {module.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-[#718096]">
                  {module.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className={`text-sm font-bold ${module.accent}`}>
                    Explorar área
                  </span>

                  <span className="text-lg text-[#A0AEC0] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </article>
          ))}
        </div>
      </section>

      {/* Pie */}
      <footer className="mt-12 border-t border-[#E7EDF5] py-6 text-center text-xs text-[#A0AEC0]">
        ProtoLab · Aprende creando y descubre tu potencial.
      </footer>
    </main>
  </div>
);
}

