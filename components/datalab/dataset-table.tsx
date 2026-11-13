// components/datalab/dataset-table.tsx
"use client";

import React from 'react';

interface DatasetTableProps {
  datasetId: number;
  filtroCategoria: string;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ datasetId }) => {
  // Definimos las filas de la tabla para cada dataset / práctica (0 al 6)
  const tablasPorId: Record<number, Array<{ col1: string; col2: string; col3: string; col4: string }>> = {
    0: [
      { col1: "00:00 - 04:00", col2: "Valle", col3: "140 kWh", col4: "Bajo" },
      { col1: "04:00 - 08:00", col2: "Apertura", col3: "220 kWh", col4: "Normal" },
      { col1: "08:00 - 12:00", col2: "Matutino", col3: "410 kWh", col4: "Medio" },
      { col1: "12:00 - 16:00", col2: "Mediodía", col3: "380 kWh", col4: "Medio" },
      { col1: "16:00 - 20:00", col2: "Pico", col3: "580 kWh", col4: "Crítico" },
      { col1: "20:00 - 24:00", col2: "Cierre", col3: "290 kWh", col4: "Descenso" },
    ],
    1: [
      { col1: "Equipo Alfa", col2: "RoboLab", col3: "95 Pts", col4: "Aprobado" },
      { col1: "Equipo Beta", col2: "DataLab", col3: "88 Pts", col4: "Normal" },
      { col1: "Equipo Gamma", col2: "ElectroLab", col3: "60 Pts", col4: "Bajo" },
      { col1: "Equipo Delta", col2: "RoboLab", col3: "100 Pts", col4: "Crítico" },
    ],
    2: [
      { col1: "Kit Arduino Uno", col2: "Sensores", col3: "45 Kits", col4: "Medio" },
      { col1: "Sensor ultrasónico", col2: "Robótica", col3: "120 Unidades", col4: "Crítico" },
      { col1: "Multímetro digital", col2: "ElectroLab", col3: "30 Unidades", col4: "Bajo" },
    ],
    3: [
      { col1: "Macuspana", col2: "Centro", col3: "155,000 Hab.", col4: "Normal" },
      { col1: "Villahermosa", col2: "Centro", col3: "683,000 Hab.", col4: "Crítico" },
      { col1: "Cárdenas", col2: "Pantanos", col3: "102,000 Hab.", col4: "Bajo" },
    ],
    // Tablas específicas para las prácticas DL-CT (IDs 4, 5, 6)
    4: [
      { col1: "Clase 0-20%", col2: "Frecuencia baja", col3: "15%", col4: "Estable" },
      { col1: "Clase 20-40%", col2: "Frecuencia media", col3: "30%", col4: "Normal" },
      { col1: "Clase 40-60%", col2: "Densidad operativa", col3: "85%", col4: "Crítico / Pico" },
      { col1: "Clase 60-80%", col2: "Descenso de carga", col3: "45%", col4: "Regular" },
      { col1: "Clase 80-100%", col2: "Valle final", col3: "20%", col4: "Mínimo" },
    ],
    5: [
      { col1: "Filtro Base", col2: "Bruto", col3: "300 Reg.", col4: "Sin procesar" },
      { col1: "Segmento A", col2: "Condicional 1", col3: "180 Reg.", col4: "Filtrado" },
      { col1: "Segmento B", col2: "Condicional 2", col3: "95 Reg.", col4: "Segmentado" },
      { col1: "Anómalo", col2: "Aislado cruzado", col3: "420 Reg.", col4: "Crítico" },
    ],
    6: [
      { col1: "Semana 1", col2: "Histórico", col3: "50 u.", col4: "Normal" },
      { col1: "Semana 2", col2: "Histórico", col3: "55 u.", col4: "Normal" },
      { col1: "Semana 3", col2: "Histórico", col3: "53 u.", col4: "Normal" },
      { col1: "Semana 4", col2: "Outlier detectado", col3: "190 u.", col4: "Valor Atípico" },
    ]
  };

  const filas = tablasPorId[datasetId] || tablasPorId[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
            <th className="pb-2">Registro / Variable</th>
            <th className="pb-2">Categoría</th>
            <th className="pb-2">Métrica</th>
            <th className="pb-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filas.map((fila, index) => (
            <tr key={index} className="hover:bg-slate-50/50">
              <td className="py-2.5 font-medium text-slate-800">{fila.col1}</td>
              <td className="py-2.5 text-slate-600">{fila.col2}</td>
              <td className="py-2.5 text-slate-600">{fila.col3}</td>
              <td className="py-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  fila.col4.includes('Crítico') || fila.col4.includes('Atípico') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {fila.col4}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};