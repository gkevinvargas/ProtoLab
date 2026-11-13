import { IconChevronRight } from "@tabler/icons-react";

interface HeaderProps {
    nombreLaboratorio: string
    tipoContenido: string
    tipoEditor: string
}

export function Header({nombreLaboratorio, tipoContenido, tipoEditor}: HeaderProps) {
    return (
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#E7EDF5] bg-white px-4 sm:px-7">
        <div className="flex items-center gap-3">
            <div>
                <div className="flex items-center gap-2 text-[11px] text-[#718096]">
                    <span>
                        {nombreLaboratorio}
                    </span>
                    <IconChevronRight size={18} stroke={2}/>    
                    <span>
                        {tipoContenido}
                    </span>
                </div>
                
                <h1 className="mt-1 text-[15px] font-semibold tracking-tight text-[#24324A] sm:text-base">
                    {tipoEditor}
                </h1>
            </div>
        </div>
    </header>
    )
}





