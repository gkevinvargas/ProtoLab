// components/datalab/datalab-results.tsx

import React from 'react';

interface DataLabResultsProps {
  isOpen: boolean;
  esExito: boolean; // true si sacó >= 7.0, false si falló (< 7.0)
  mensajeExito: string;
  mensajeError: string;
  onReintentar: () => void; // Cierra el modal y deja todo como estaba
  onAvanzar: () => void; // Desbloquea el siguiente nivel
}

export const DataLabResults: React.FC<DataLabResultsProps> = ({
  isOpen,
  esExito,
  mensajeExito,
  mensajeError,
  onReintentar,
  onAvanzar
}) => {
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">

        {/* 1. Icono visual de estado acorde al tema claro */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${
          esExito
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          <span className="text-2xl font-black">{esExito ? '✓' : '✕'}</span>
        </div>

        {/* 2. Título y Mensaje de Retroalimentación */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-black text-slate-900">
            {esExito ? '¡Reto Completado!' : 'Hay un detalle...'}
          </h3>

          <p className="text-slate-600 text-xs leading-relaxed px-2">
            {esExito ? mensajeExito : mensajeError}
          </p>
        </div>

        {/* 3. Botones de acción con el estilo corporativo de ProtoLab */}
        <div className="w-full pt-2">
          {esExito ? (
            <button
              onClick={onAvanzar}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex justify-center items-center gap-2 shadow-sm"
            >
              <span>Guardar en Portafolio</span> <span>→</span>
            </button>
          ) : (
            <button
              onClick={onReintentar}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex justify-center items-center gap-2 shadow-sm"
            >
              <span>↺ Reintentar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};