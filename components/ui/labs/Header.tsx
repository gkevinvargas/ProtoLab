"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconChevronDown, IconChevronRight, IconChevronsDown, IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { DropdownMenuItemLogout } from '../logout-dropdown-item';

interface HeaderProps {
    nombreLaboratorio: string
    tipoContenido: string
    tipoEditor: string
}

export function Header({ nombreLaboratorio, tipoContenido, tipoEditor }: HeaderProps) {

    return (
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#E7EDF5] bg-white px-4 sm:px-7">
            <div className="flex items-center gap-3">
                <div>
                    <div className="flex items-center gap-2 text-[11px] text-[#718096]">
                        {/**
                         <span>
                            {nombreLaboratorio}
                        </span>
                        <IconChevronRight size={18} stroke={2} />
                        <span>
                            {tipoContenido}
                        </span>
                         */}
                    </div>

                    {/**
                     <h1 className="mt-1 text-[15px] font-semibold tracking-tight text-[#24324A] sm:text-base">
                        {tipoEditor}
                    </h1>
                     */}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                <span className=""></span>
            </div>

            <div className="relative flex items-center gap-2 sm:gap-3 ">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-[#E7EDF5] bg-[#F8FAFC] p-1.5 pr-3 text-sm font-medium text-[#24324A] transition-colors hover:bg-[#EDF2F7] focus:outline-none focus-visible:ring-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2478F6] text-white">
                            <IconUser size={18} stroke={2} />
                        </div>
                        <span className="hidden text-[13px] sm:inline">Usuario</span>
                        <IconChevronDown size={16} stroke={2} className="text-[#718096]" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl border border-[#E7EDF5] bg-white p-1.5 shadow-lg"
                    >
                        <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-[#718096]">
                            Mi cuenta
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className="my-1 bg-[#E7EDF5]" />

                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-[#24324A] transition-colors focus:bg-[#F5F9FF] focus:text-[#24324A]">
                            <Link href="/perfil" className="flex items-center gap-2">
                                <IconUser size={16} stroke={2} className="text-[#718096]" />
                                <span>Ver perfil</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 bg-[#E7EDF5]" />

                        <DropdownMenuItemLogout />
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    )
}





