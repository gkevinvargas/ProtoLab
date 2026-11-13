// components/datalab/data-chart.tsx
"use client";
import React, { useState } from 'react';

interface DataChartProps { 
  datasetId: number;
  tipoGrafica: string;
}

export const DataChart: React.FC<DataChartProps> = ({ datasetId, tipoGrafica }) => {
  const [escalaTemporal, setEscalaTemporal] = useState<'hrs' | 'meses' | 'anos'>('hrs');

  // Datasets con proporciones drásticamente distintas para que el cambio temporal sea evidente y analítico
  const temporalMap = {
    hrs: [
      { label: '00-04', val: 140, color: 'bg-slate-400' },
      { label: '04-08', val: 220, color: 'bg-blue-500' },
      { label: '08-12', val: 410, color: 'bg-blue-600' },
      { label: '12-16', val: 380, color: 'bg-indigo-600' },
      { label: '16-20', val: 580, color: 'bg-teal-600' }, // Pico máximo operativo
      { label: '20-24', val: 290, color: 'bg-purple-600' },
    ],
    meses: [
      { label: 'Ene-Mar', val: 1200, color: 'bg-blue-400' },
      { label: 'Abr-Jun', val: 2800, color: 'bg-blue-600' },
      { label: 'Jul-Sep', val: 8900, color: 'bg-teal-500' }, // Pico masivo por temporada de verano/climatización
      { label: 'Oct-Dic', val: 3400, color: 'bg-purple-600' },
    ],
    anos: [
      { label: '2023', val: 15000, color: 'bg-slate-400' },
      { label: '2024', val: 34000, color: 'bg-blue-500' },
      { label: '2025', val: 62000, color: 'bg-cyan-600' },
      { label: '2026', val: 98000, color: 'bg-emerald-600' }, // Crecimiento exponencial interanual
    ]
  };

  const datos = temporalMap[escalaTemporal];
  
  // Usamos un techo fijo o de referencia general según la escala para que las alturas sean impactantes y reales
  const techoMaximo = escalaTemporal === 'hrs' ? 600 : escalaTemporal === 'meses' ? 10000 : 100000;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      
      {/* Selector de Intervalo Temporal Interactivo */}
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setEscalaTemporal('hrs')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${escalaTemporal === 'hrs' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Horas (24h)
          </button>
          <button
            onClick={() => setEscalaTemporal('meses')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${escalaTemporal === 'meses' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Meses (Estacional)
          </button>
          <button
            onClick={() => setEscalaTemporal('anos')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${escalaTemporal === 'anos' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Años (Histórico)
          </button>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Análisis Temporal: <span className="text-blue-600">{escalaTemporal.toUpperCase()}</span>
        </span>
      </div>

      {/* Render Dinámico de la Gráfica */}
      {tipoGrafica === 'barras' || tipoGrafica === 'libre' ? (
        <div className="w-full flex items-end justify-center gap-6 h-40 px-4 pt-2">
          {datos.map((item, index) => {
            const alturaPorcentaje = Math.min(Math.max((item.val / techoMaximo) * 100, 10), 100);
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end max-w-[64px]">
                <span className="text-[10px] font-extrabold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shadow-2xs">
                  {item.val.toLocaleString()}
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${item.color} shadow-md`}
                  style={{ height: `${alturaPorcentaje}%` }}
                />
                <span className="text-[10px] text-slate-600 font-bold truncate w-full text-center mt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-around px-4 bg-slate-50/50 rounded-xl border border-slate-100">
          {datos.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100 shadow-sm"></div>
              <span className="text-xs font-black text-slate-800">{item.val.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};