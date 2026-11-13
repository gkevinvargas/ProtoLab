// app/datalab/page.tsx
import React from 'react';
import { DataLabOverview } from '../../components/datalab/datalab-overview';
import { Sidebar } from '../../components/datalab/sidebar'; // Ajusta la ruta si guardaste Sidebar en otra carpeta

export default function DataLabPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden font-sans">
      {/* Menú Lateral Fijo a la Izquierda */}
      <Sidebar />
      
      {/* Contenedor Principal (Donde va el DataLab) */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Barra superior de Plataforma (Opcional, simula la de tu diseño) */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
            Plataforma de aprendizaje <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded uppercase">Campus STEM</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="text-lg">🎓</span> Estudiante - Mi área de estudio <span className="w-2 h-2 rounded-full bg-teal-500"></span></span>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
              👤
            </div>
          </div>
        </header>

        {/* El componente DataLab que armamos antes */}
        <DataLabOverview />
        
      </div>
    </div>
  );
}