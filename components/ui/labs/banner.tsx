
interface BannerProps {
    nombreLaboratorio: string
    nombrePractica: string
    nivelPractica: string
    descripcionPractica: string
}

export function BannerPractica({
    nombreLaboratorio,
    nombrePractica,
    nivelPractica,
    descripcionPractica,
}: BannerProps) {
    return (
        <header className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-6 md:p-8 text-white shadow-lg shadow-blue-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {nombreLaboratorio}
                    </span>
                    {/**<span className=" bg-amber-300 text-slate-900 px-3 py-1 rounded-full font-semibold">
                        {nombrePractica}
                    </span> */}
                    <span className="bg-white text-blue-700 px-3 py-1 rounded-full font-semibold">
                        {nivelPractica}
                    </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {nombrePractica}
                </h1>
                <p className="text-blue-100 text-sm leading-relaxed">
                    {descripcionPractica}
                </p>
            </div>

            {/*
            <div className="flex items-center gap-2 self-start md:self-center">
                <button className="bg-white text-slate-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2">
                    <span>Práctica (3/5)</span>
                </button>
            </div> */}
        </header>
    )
}




