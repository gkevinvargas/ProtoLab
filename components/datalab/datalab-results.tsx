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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border-2 transform transition-all scale-100 ${
          esExito ? 'bg-slate-900 border-green-500' : 'bg-slate-900 border-red-500'
        }`}
      >
        {/* 1. Icono visual de estado */}
        <div className="flex justify-center mb-6">
          {esExito ? (
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              <span className="text-white text-5xl font-bold">✓</span>
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <span className="text-white text-5xl font-bold">✕</span>
            </div>
          )}
        </div>

        {/* 2. Título de Retroalimentación */}
        <h3 className={`text-3xl font-bold text-center mb-4 ${esExito ? 'text-green-400' : 'text-red-400'}`}>
          {esExito ? '¡Reto Completado!' : 'Hay un detalle...'}
        </h3>

        {/* 3. Mensaje dinámico sacado de tu JSON */}
        <p className="text-slate-300 text-center text-lg mb-8 leading-relaxed">
          {esExito ? mensajeExito : mensajeError}
        </p>

        {/* 4. Bifurcación (Tu diagrama de flujo en código) */}
        <div className="flex flex-col gap-3">
          {esExito ? (
            <button
              onClick={onAvanzar}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
            >
              Guardar en Portafolio <span>→</span>
            </button>
          ) : (
            <button
              onClick={onReintentar}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
            >
              <span>↺</span> Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};