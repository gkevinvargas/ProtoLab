import React from 'react';
import { Coord, Orientation } from '@/app/robolab/robolab-data';

interface RoboLabGridProps {
  dimensions: { rows: number; cols: number };
  robotPos: { x: number; y: number; orientation: Orientation };
  goal: Coord;
  obstacles: Coord[];
}

export default function RoboLabGrid({
  dimensions,
  robotPos,
  goal,
  obstacles,
}: RoboLabGridProps) {
  const rowsArray = Array.from({ length: dimensions.rows }, (_, i) => dimensions.rows - i);
  const colsArray = Array.from({ length: dimensions.cols }, (_, i) => i + 1);

  const getRotationClass = (orientation: Orientation) => {
    switch (orientation) {
      case 'Norte':
        return 'rotate-0';
      case 'Este':
        return 'rotate-90';
      case 'Sur':
        return 'rotate-180';
      case 'Oeste':
        return '-rotate-90';
    }
  };

  return (
    <div className="w-full">
      {/* Encabezado de columnas X1 .. X6 */}
      <div className="grid grid-cols-[32px_repeat(6,minmax(0,1fr))] gap-2 mb-2 text-center">
        <div />
        {colsArray.map((col) => (
          <span key={`x-${col}`} className="text-xs font-medium text-slate-400">
            X{col}
          </span>
        ))}
      </div>

      {/* Cuadrícula Y6 .. Y1 */}
      <div className="space-y-2 relative">
        {rowsArray.map((row) => (
          <div
            key={`row-${row}`}
            className="grid grid-cols-[32px_repeat(6,minmax(0,1fr))] gap-2 items-center"
          >
            <span className="text-xs font-medium text-slate-400 text-center">Y{row}</span>

            {colsArray.map((col) => {
              const esRobot = robotPos.x === col && robotPos.y === row;
              const esMeta = goal.x === col && goal.y === row;
              const esObstaculo = obstacles.some((obs) => obs.x === col && obs.y === row);

              let cellStyle =
                'bg-slate-50/90 border border-slate-100 hover:border-slate-200';
              if (esObstaculo) {
                cellStyle = 'bg-rose-50 border border-rose-200';
              } else if (esMeta) {
                cellStyle = 'bg-emerald-50/70 border border-emerald-200';
              }

              return (
                <div
                  key={`${col}-${row}`}
                  className={`aspect-square rounded-xl flex items-center justify-center relative transition-colors duration-300 ${cellStyle}`}
                >
                  {/* Robot Botty en SVG Animado estilo Videojuego */}
                  {esRobot && (
                    <div
                      className="absolute inset-1 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 ring-4 ring-blue-100 flex items-center justify-center transition-all duration-300 ease-in-out z-10 animate-bounce"
                      title={`Botty (${robotPos.orientation})`}
                    >
                      <div
                        className={`w-9 h-9 flex items-center justify-center transition-transform duration-300 ease-in-out ${getRotationClass(
                          robotPos.orientation
                        )}`}
                      >
                        <svg
                          viewBox="0 0 64 64"
                          className="w-8 h-8 drop-shadow-sm"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Antena */}
                          <line x1="32" y1="14" x2="32" y2="6" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
                          <circle cx="32" cy="4" r="3" fill="#38BDF8" />
                          
                          {/* Cabeza */}
                          <rect x="18" y="14" width="28" height="18" rx="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
                          
                          {/* Ojos */}
                          <circle cx="25" cy="21" r="3.5" fill="#FFFFFF" />
                          <circle cx="25" cy="21" r="1.5" fill="#0F172A" />
                          <circle cx="39" cy="21" r="3.5" fill="#FFFFFF" />
                          <circle cx="39" cy="21" r="1.5" fill="#0F172A" />
                          
                          {/* Boca / Pantalla frontal */}
                          <rect x="27" y="26" width="10" height="3" rx="1.5" fill="#0284C7" />

                          {/* Cuerpo / Torso */}
                          <rect x="20" y="34" width="24" height="20" rx="4" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
                          
                          {/* Panel de control en el pecho */}
                          <rect x="25" y="39" width="14" height="10" rx="2" fill="#E0F2FE" />
                          <circle cx="29" cy="44" r="1.5" fill="#EF4444" />
                          <circle cx="35" cy="44" r="1.5" fill="#10B981" />

                          {/* Brazos */}
                          <rect x="13" y="37" width="5" height="12" rx="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                          <rect x="46" y="37" width="5" height="12" rx="2.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {!esRobot && esObstaculo && (
                    <span title="Obstáculo" className="text-xl select-none">
                      🧱
                    </span>
                  )}

                  {!esRobot && esMeta && (
                    <span title={`Meta (${goal.x},${goal.y})`} className="text-xl select-none">
                      🏁
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Leyenda inferior */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
          <span>Inicio (1,1)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🧱</span>
          <span>Obstáculo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏁</span>
          <span>
            Meta ({goal.x},{goal.y})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-sky-300 rounded-full" />
          </div>
          <span>Robot "Botty"</span>
        </div>
      </div>
    </div>
  );
}