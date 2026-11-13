// components/datalab/dataset-table.tsx
"use client";
import React from 'react';

interface DatasetTableProps {
  datasetId: number;
  filtroCategoria: string;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({ datasetId, filtroCategoria }) => {
  // Definimos datos dinámicos para cada dataset activo
  const datasetsMap: Record<number, { columnas: string[]; datos: Record<string, string>[] }> = {
    0: {
      columnas: ['PERIODO', 'FRANJA', 'CONSUMO', 'ESTADO'],
      datos: [
        { PERIODO: '00:00 - 04:00', FRANJA: 'Valle', CONSUMO: '140 kWh', ESTADO: 'Bajo' },
        { PERIODO: '04:00 - 08:00', FRANJA: 'Apertura', CONSUMO: '220 kWh', ESTADO: 'Normal' },
        { PERIODO: '08:00 - 12:00', FRANJA: 'Matutino', CONSUMO: '410 kWh', ESTADO: 'Medio' },
        { PERIODO: '12:00 - 16:00', FRANJA: 'Mediodia', CONSUMO: '380 kWh', ESTADO: 'Medio' },
        { PERIODO: '16:00 - 20:00', FRANJA: 'Pico', CONSUMO: '580 kWh', ESTADO: 'Critico' },
        { PERIODO: '20:00 - 24:00', FRANJA: 'Cierre', CONSUMO: '290 kWh', ESTADO: 'Descenso' },
      ]
    },
    1: {
      columnas: ['ESTUDIANTE', 'MODULO', 'CALIFICACIÓN', 'ESTADO'],
      datos: [
        { ESTUDIANTE: 'Equipo Alfa', FRANJA: 'RoboLab', CONSUMO: '95 Pts', ESTADO: 'Aprobado' },
        { ESTUDIANTE: 'Equipo Beta', FRANJA: 'DataLab', CONSUMO: '88 Pts', ESTADO: 'Normal' },
        { ESTUDIANTE: 'Equipo Gamma', FRANJA: 'ElectroLab', CONSUMO: '60 Pts', ESTADO: 'Bajo' },
        { ESTUDIANTE: 'Equipo Delta', FRANJA: 'RoboLab', CONSUMO: '100 Pts', ESTADO: 'Critico' },
      ]
    },
    2: {
      columnas: ['KIT / SENSOR', 'CATEGORÍA', 'UNIDADES', 'ESTADO'],
      datos: [
        { ESTUDIANTE: 'Kit Arduino Uno', FRANJA: 'Sensores', CONSUMO: '45 Kits', ESTADO: 'Medio' },
        { ESTUDIANTE: 'Sensor ultrasónico', FRANJA: 'Robótica', CONSUMO: '120 Unidades', ESTADO: 'Critico' },
        { ESTUDIANTE: 'Multímetro digital', FRANJA: 'ElectroLab', CONSUMO: '30 Unidades', ESTADO: 'Bajo' },
      ]
    },
    3: {
      columnas: ['MUNICIPIO', 'REGIÓN', 'POBLACIÓN', 'TASA STEM'],
      datos: [
        { ESTUDIANTE: 'Macuspana', FRANJA: 'Centro', CONSUMO: '155,000', ESTADO: 'Normal' },
        { ESTUDIANTE: 'Centro (Villahermosa)', FRANJA: 'Centro', CONSUMO: '683,000', ESTADO: 'Critico' },
        { ESTUDIANTE: 'Carメンas', FRANJA: 'Pantanos', CONSUMO: '102,000', ESTADO: 'Bajo' },
      ]
    }
  };

  const actualData = datasetsMap[datasetId] || datasetsMap[0];
  const columnas = actualData.columnas;

  // Sistema de Filtrado Real basado en el botón seleccionado
  const datosFiltrados = actualData.datos.filter(fila => {
    if (filtroCategoria === 'Todo') return true;
    const valorColumnaEstado = Object.values(fila).join(' ');
    if (filtroCategoria === 'Horas Pico' && (valorColumnaEstado.includes('Pico') || valorColumnaEstado.includes('100 Pts') || valorColumnaEstado.includes('683,000'))) return true;
    if (filtroCategoria === 'Valle nocturno' && (valorColumnaEstado.includes('Valle') || valorColumnaEstado.includes('Bajo') || valorColumnaEstado.includes('Macuspana'))) return true;
    return false;
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-[11px] text-slate-700">
        <thead className="text-[10px] uppercase text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            {columnas.map((col) => (
              <th key={col} className="pb-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datosFiltrados.length > 0 ? (
            datosFiltrados.map((fila, index) => {
              const valores = Object.values(fila);
              return (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{valores[0]}</td>
                  <td className="py-2.5 text-slate-600">{valores[1]}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{valores[2]}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded font-medium ${
                      valores[3] === 'Critico' || valores[3] === 'Aprobado' ? 'bg-red-50 text-red-600' :
                      valores[3] === 'Medio' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {valores[3]}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columnas.length} className="py-6 text-center text-slate-400 italic">
                No hay registros que coincidan con este filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};