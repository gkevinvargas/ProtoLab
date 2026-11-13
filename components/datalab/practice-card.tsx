import React from 'react';
import { RetoDataLab } from '@/lib/datalab/types';

interface PracticeCardProps {
  reto: RetoDataLab;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ reto }) => {
  return (
    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white">{reto.titulo}</h3>
          <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-wider">
            {reto.nivel}
          </span>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          {reto.instrucciones}
        </p>
      </div>
      
      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors mt-auto">
        Iniciar {reto.id_reto}
      </button>
    </div>
  );
};