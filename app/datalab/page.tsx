import { DataLabOverview } from "@/components/datalab/datalab-overview";
import { Sidebar } from "@/components/datalab/sidebar";
import RecorridoTeorico from "@/components/laboratorios/RecorridoTeorico";
import primeraClase from "@/lib/datalab/DL-CT-01.json";
import segundaClase from "@/lib/datalab/DL-CT-02.json";

const clasesDataLab = [primeraClase, segundaClase];

export default function DataLabPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            Plataforma de aprendizaje
            <span className="hidden rounded bg-indigo-50 px-2 py-0.5 text-[10px] uppercase text-indigo-600 sm:inline">
              Campus STEM
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Estudiante</span>
            <span className="h-2 w-2 rounded-full bg-teal-500" />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <RecorridoTeorico clases={clasesDataLab}>
            <DataLabOverview />
          </RecorridoTeorico>
        </main>
      </div>
    </div>
  );
}