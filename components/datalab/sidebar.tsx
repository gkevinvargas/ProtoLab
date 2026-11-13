// components/ui/sidebar.tsx
"use client";
import React, { useState } from 'react';
import { IconAtom, IconHome, IconTrendingUp, IconChevronDown, IconChevronUp, IconActivity } from '@tabler/icons-react';

export const Sidebar = () => {
  const [modulosAbiertos, setModulosAbiertos] = useState(true);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-100 bg-white min-h-screen flex flex-col pt-6 pb-4">
      {/* Logo y Título */}
      <div className="flex items-center gap-3 px-6 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
          <IconAtom size={24} stroke={2} />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 text-lg leading-tight">ProtoLab</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Aprende creando</span>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex flex-col px-4 gap-1">
        
        {/* Inicio */}
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full text-left font-medium text-sm">
          <IconHome size={20} stroke={1.5} /> Inicio
        </button>

        {/* Sección Módulos */}
        <div className="mt-4">
          <button 
            onClick={() => setModulosAbiertos(!modulosAbiertos)}
            className="flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-full text-left hover:text-slate-600 transition-colors"
          >
            <span>Mis Módulos</span>
            {modulosAbiertos ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </button>
          
          {modulosAbiertos && (
            <div className="flex flex-col mt-2 pl-6 border-l-2 border-slate-100 ml-6 gap-1 relative">
              <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors w-full text-left text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                Diagnóstico Vocacional
              </button>
              <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors w-full text-left text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                RoboLab
              </button>
              <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors w-full text-left text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                ElectroLab
              </button>
              
              {/* Opción Activa: DataLab */}
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-blue-600 text-white transition-colors w-full text-left text-sm font-bold shadow-md shadow-blue-600/20 mt-1 relative -left-4 w-[calc(100%+1rem)]">
                <span className="w-2 h-2 rounded-full bg-cyan-300 ml-4"></span>
                DataLab
              </button>
            </div>
          )}
        </div>

        {/* Mi Progreso */}
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full text-left font-medium text-sm mt-4">
          <IconTrendingUp size={20} stroke={1.5} /> Mi progreso
        </button>

      </nav>
    </aside>
  );
};