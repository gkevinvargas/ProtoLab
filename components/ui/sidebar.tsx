"use client"

import { IconAtom, IconBulb, IconClock, IconHome, IconLayoutGrid, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { NavLink } from "./nav-link";
import { useState } from "react";

const secciones = [
  { href: "/inicio", label: "Inicio", icon: IconHome },
  { href: "#modulos", label: "Mis módulos", icon: IconLayoutGrid },
  { href: "/progreso", label: "Mi progreso", icon: IconClock },
]

export function Sidebar() {
  const [menuTelefono, setMenuTelefono] = useState(false)
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E7EDF5] bg-white p-6 md:flex">
      <Link href="/inicio" className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3478F6] text-2xl text-white">
          <IconAtom size={27} stroke={2} />
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
      <button type="button" onClick={() => setMenuTelefono(false)} className="ml-auto rounded-lg p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden" aria-label="Cerrar menú">
        <IconX name="close" />
      </button>


      <div className="">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">
        Menu principal
      </p>
      </div>


      
      <nav className="flex flex-col gap-2 font-semibold">
        {secciones.map((seccion) => (
          <NavLink key={seccion.href} href={seccion.href} label={seccion.label} icon={seccion.icon} />
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-[#F0F7FF] p-4">
        <div className="mb-2 text-[#FFB547]">
          <IconBulb size={21} stroke={1.8} />
        </div>
        <h3 className="font-bold">¡Continua explorando!</h3>
        <p className="mt-1 text-sm leading-5 text-[718096]">
          ¡Cada una de las actividades es una nueva oportunidad de aprender algo!
        </p>
      </div>
    </aside>



    /*<aside className="hidden w-64 shrink-0 flex-col border-r border-[#E7EDF5] bg-white p-6 md:flex">
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
          Menu principal
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
            Mis modulos
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
          <h3 className="font-bold">¡Continua explorando!</h3>
          <p className="mt-1 text-sm leading-5 text-[718096]">
            ¡Cada una de las actividades es una nueva oportunidad de aprender algo!
          </p>
        </div>
    </aside>*/
  )
}



