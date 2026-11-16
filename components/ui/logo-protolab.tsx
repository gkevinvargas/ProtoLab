import { IconAtom } from "@tabler/icons-react";
import Link from "next/link";



export function Logo({ className = '' }) {
    return (
        <Link href="/inicio" className={`flex items-center gap-2.5 ${className}`}>
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
    )
}



