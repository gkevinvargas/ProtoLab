"use client"

import { Icon, TablerIcon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import Link from "next/link";

interface NavLinkProps {
    href: string,
    label: string,
    icon: Icon
}

export function NavLink({ href, label, icon: IconComponent }: NavLinkProps) {
    const path = usePathname()
    const estaActivo = path === href

    return (
        <Link href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#718096] transition hover:bg-[#F5F9FF] hover:text-[#3478F6]">
            <IconComponent size={21} stroke={1.8}/>
            {label}
        </Link>
    )
}



