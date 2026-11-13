// components/datalab/chart-selector.tsx

import React from 'react';

interface ChartSelectorProps {
  graficasPermitidas: string[];
  graficaActiva: string;
  onCambiarGrafica: (tipo: string) => void;
}

export const ChartSelector: React.FC<ChartSelectorProps> = ({ graficasPermitidas, graficaActiva, onCambiarGrafica }) => {
  return (
    <div className="flex gap-2 bg-slate-900 p-1 rounded-lg w-fit border border-slate-700 mb-4">
      {graficasPermitidas.map((tipo) => (
        <button
          key={tipo}
          onClick={() => onCambiarGrafica(tipo)}
          className={`px-4 py-2 text-sm font-bold rounded capitalize transition-all ${
            graficaActiva === tipo 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {tipo}
        </button>
      ))}
    </div>
  );
};