// components/datalab/data-chart.tsx
"use client";

import React from 'react';

interface DataChartProps {
  datasetId: number;
  tipoGrafica: 'barras' | 'dispersion' | 'libre';
}

export const DataChart: React.FC<DataChartProps> = ({ datasetId, tipoGrafica }) => {
  const datasetsData = [
    {
      titulo: "Consumo Energético (kWh)",
      etiquetas: ["00-04 hrs", "04-08 hrs", "08-12 hrs", "12-16 hrs", "16-20 hrs", "20-24 hrs"],
      valores: [140, 220, 410, 380, 580, 290],
      color: "bg-cyan-500"
    },
    {
      titulo: "Rendimiento STEM (Puntaje)",
      etiquetas: ["Equipo Alfa", "Equipo Beta", "Equipo Gamma", "Equipo Delta"],
      valores: [95, 88, 60, 100],
      color: "bg-blue-600"
    },
    {
      titulo: "Ventas de Makerspace (Unidades)",
      etiquetas: ["Sensor Ultrasónico", "Kit Arduino", "Multímetro", "Módulos Básicos"],
      valores: [450, 320, 210, 180],
      color: "bg-purple-500"
    },
    {
      titulo: "Crecimiento Local (Habitantes est.)",
      etiquetas: ["Macuspana", "Cárdenas", "Centro / Villahermosa", "Zona Pantanos"],
      valores: [154000, 128000, 350000, 45000],
      color: "bg-emerald-500"
    },
    // Nuevas gráficas para las prácticas DL-CT (IDs 4, 5, 6)
    {
      titulo: "DL-CT-01: Distribución de Frecuencias (%)",
      etiquetas: ["0-20%", "20-40%", "40-60% (Crítico)", "60-80%", "80-100%"],
      valores: [15, 30, 85, 45, 20],
      color: "bg-amber-500"
    },
    {
      titulo: "DL-CT-02: Filtrado Cruzado de Tendencias",
      etiquetas: ["Filtro Base", "Segmento A", "Segmento B", "Aislado (Anómalo)"],
      valores: [300, 180, 95, 420],
      color: "bg-rose-500"
    },
    {
      titulo: "DL-CT-03: Serie Temporal con Outliers",
      etiquetas: ["Semana 1", "Semana 2", "Semana 3", "Semana 4 (Outlier)"],
      valores: [50, 55, 53, 190],
      color: "bg-indigo-500"
    }
  ];

  const actualData = datasetsData[datasetId] || datasetsData[0];
  const maxValor = Math.max(...actualData.valores);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
        <span>{actualData.titulo}</span>
        <span className="uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Modo: {tipoGrafica}</span>
      </div>

      <div className="flex items-end justify-around gap-2 h-44 pt-6 border-b border-slate-100 px-2">
        {actualData.valores.map((val, idx) => {
          const alturaPorcentaje = Math.round((val / maxValor) * 100);
          return (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {val}
              </span>
              <div 
                className={`w-full max-w-[45px] rounded-t-lg transition-all duration-500 ${actualData.color} ${tipoGrafica === 'dispersion' ? 'rounded-full w-4 h-4 mx-auto' : ''}`}
                style={{ height: tipoGrafica === 'dispersion' ? '20px' : `${Math.max(alturaPorcentaje, 15)}%` }}
              ></div>
              <span className="text-[10px] font-medium text-slate-500 text-center truncate w-full">
                {actualData.etiquetas[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};