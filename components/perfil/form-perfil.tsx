"use client"

import { IconCalendar, IconCalendarEvent, IconCheck, IconEdit, IconMapPin, IconUsb, IconUser } from "@tabler/icons-react"
import { Button } from "../ui/button"
import { actualizarPerfil } from "@/actions/perfil"
import { useState } from "react"


interface FormPerfilProps {
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    municipio: string
    semestre: string
    correo?: string
}

export function FormPerfil({ nombre, apellido_paterno, apellido_materno, municipio, semestre, correo }: FormPerfilProps) {
    
    return (
        <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-s font-bold text-slate-900 tracking-wider flex items-center gap-2">
                    <IconUser size={18} className="text-indigo-500" />Datos
                </h3>

                {/*
                <div className="flex items-center gap-3">
                    <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                        <IconEdit size={14} />modificar
                    </button>
                    <button className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-1">
                        <IconCheck size={14} />aplicar
                    </button>
                    <button className="text-xs text-rose-500 font-semibold hover:underline">
                        salir
                    </button>
                </div>
                */}

            </div>

            <form action={actualizarPerfil} className="sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Nombre(s)</span>
                        <input
                            type="text"
                            defaultValue={nombre}
                            name="nombre"
                            placeholder="Escribe tu(s) nombres"
                            required
                            className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Apellido paterno</span>
                        <input
                            type="text"
                            defaultValue={apellido_paterno}
                            name="apellidoPaterno"
                            placeholder="Escribe tu apellido"
                            required
                            className="mt-1 bg-white border border-slate-200 rounded p-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Apellido materno</span>
                        <input
                            type="text"
                            defaultValue={apellido_materno}
                            name="apellidoMaterno"
                            placeholder="Escribe tu apellido"
                            required
                            className="mt-1 bg-white border border-slate-200 rounded p-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Municipio</span>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                                <IconMapPin size={14} className="text-blue-500" /> 
                            </span>
                            <input
                                type="text"
                                defaultValue={municipio}
                                name="municipio"
                                placeholder=""
                                className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Semestre</span>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                                <IconCalendar size={14} className="text-blue-500" /> 
                            </span>
                            <select key={semestre} name="semestre" defaultValue={semestre}
                                className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            >
                                <option>Selecciona una opción</option>
                                <option value="1">1ro</option>
                                <option value="2">2do</option>
                                <option value="3">3ro</option>
                                <option value="4">4to</option>
                                <option value="5">5to</option>
                                <option value="6">6to</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[13px] font-bold text-slate-400">Correo electrónico</span>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                                <IconMapPin size={14} className="text-blue-500" /> 
                            </span>
                            <input
                                type="text"
                                value={correo}
                                name="municipio"
                                placeholder=""
                                disabled
                                className="w-full mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <Button type="submit" className="mt-4 font-bold">Guardar</Button>

            </form>
        </div>
    )
}





