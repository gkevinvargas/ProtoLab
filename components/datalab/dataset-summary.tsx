// components/datalab/dataset-summary.tsx

import React from 'react';

interface DatasetSummaryProps {
  totalRegistros: number;
  variablesDisponibles: number;
}

export const DatasetSummary: React.FC<DatasetSummaryProps> = ({ totalRegistros, variablesDisponibles }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-blue-500">{totalRegistros}</span>
        <span className="text-slate-400 text-xs uppercase tracking-widest mt-1">Registros (Filas)</span>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-purple-500">{variablesDisponibles}</span>
        <span className="text-slate-400 text-xs uppercase tracking-widest mt-1">Variables (Columnas)</span>
      </div>
    </div>
  );
};