"use client"

import { IconAtom, IconBulb, IconClock, IconHome, IconLayoutGrid, IconMenu, IconMenu2, IconMenu3, IconMenu4, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { NavLink } from "./nav-link";
import { useState } from "react";
import { Logo } from "./logo-protolab";

const secciones = [
  { href: "/inicio", label: "Inicio", icon: IconHome },
  { href: "/inicio#modulos", label: "Mis módulos", icon: IconLayoutGrid },
  { href: "/ruta", label: "Mi progreso", icon: IconClock },
]

export function Sidebar() {

  const [menuTelefonoAbierto, setMenuTelefono] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setMenuTelefono(true)}
        className="fixed left-4 top-[18px] z-50 rounded-lg bg-white p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden"
      >
        <IconMenu2 size={27} stroke={2} />
      </button>
      {
        menuTelefonoAbierto && (
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMenuTelefono(false)}
          ></div>
        )
      }

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#E7EDF5] bg-white p-6 transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${menuTelefonoAbierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">

          <Logo />

          <button
            type="button"
            onClick={() => setMenuTelefono(false)}
            className="rounded-lg p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden"
          >
            <IconX />
          </button>
        </div>

        
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

        <div className="mt-10 rounded-2xl bg-[#F0F7FF] p-4">
          <div className="mb-2 text-[#FFB547]">
            <IconBulb size={21} stroke={1.8} />
          </div>
          <h3 className="font-bold">¡Continua explorando!</h3>
          <p className="mt-1 text-sm leading-5 text-[718096]">
            ¡Cada una de las actividades es una nueva oportunidad de aprender algo!
          </p>
        </div>
      </aside>
    </div>

  )
}



