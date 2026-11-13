// components/datalab/analysis-questions.tsx
"use client";

import React, { useState } from 'react';
import { RetoDataLab } from '@/lib/datalab/types';

interface AnalysisQuestionsProps {
  retoActivo: RetoDataLab;
  onEvaluar: (respuestas: { tecnica: string; reflexion: string }) => void;
}

export const AnalysisQuestions: React.FC<AnalysisQuestionsProps> = ({ retoActivo, onEvaluar }) => {
  const [respuestaTecnica, setRespuestaTecnica] = useState('');
  const [respuestaReflexion, setRespuestaReflexion] = useState('');

  const manejarEnvio = () => {
    const numPalabras = respuestaReflexion.trim().split(/\s+/).length;
    const minPalabras = retoActivo.evaluacion.pregunta_reflexion.longitud_minima_palabras;

    if (numPalabras < minPalabras && respuestaReflexion.length > 0) {
      alert(`Tu reflexión debe tener al menos ${minPalabras} palabras. Llevas ${numPalabras}.`);
      return;
    }

    onEvaluar({
      tecnica: respuestaTecnica,
      reflexion: respuestaReflexion
    });
  };

  return (
    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mt-4 flex flex-col gap-6">
      
      <div className="pregunta-objetiva">
        <h4 className="text-white font-bold mb-2">
          {retoActivo.evaluacion.pregunta_objetiva.enunciado}
        </h4>
        
        {retoActivo.evaluacion.pregunta_objetiva.tipo === 'opcion_multiple' && (
          <div className="flex flex-col gap-3 mt-3">
            {retoActivo.evaluacion.pregunta_objetiva.opciones?.map((opcion, index) => (
              <label key={index} className="flex items-center gap-3 text-slate-300 cursor-pointer p-2 hover:bg-slate-700 rounded transition-colors">
                <input 
                  type="radio" 
                  name="respuesta-tecnica" 
                  value={opcion}
                  onChange={(e) => setRespuestaTecnica(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 focus:ring-blue-500"
                />
                {opcion}
              </label>
            ))}
          </div>
        )}

        {retoActivo.evaluacion.pregunta_objetiva.tipo === 'entrada_texto' && (
          <input 
            type="text"
            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-blue-500 outline-none"
            placeholder={retoActivo.evaluacion.pregunta_objetiva.placeholder}
            onChange={(e) => setRespuestaTecnica(e.target.value)}
          />
        )}
      </div>

      <hr className="border-slate-700" />

      <div className="pregunta-reflexion">
        <h4 className="text-yellow-400 font-bold mb-2 text-sm flex items-center gap-2">
          <span>📝</span> Para tu Portafolio:
        </h4>
        <p className="text-slate-300 text-sm mb-3">
          {retoActivo.evaluacion.pregunta_reflexion.enunciado}
        </p>
        <textarea 
          className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-yellow-500 outline-none resize-none"
          placeholder={`Escribe aquí tu análisis (Mínimo ${retoActivo.evaluacion.pregunta_reflexion.longitud_minima_palabras} palabras)...`}
          value={respuestaReflexion}
          onChange={(e) => setRespuestaReflexion(e.target.value)}
        />
      </div>

      <button 
        onClick={manejarEnvio}
        disabled={!respuestaTecnica || !respuestaReflexion}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded uppercase tracking-widest transition-colors"
      >
        Evaluar Reto
      </button>

    </div>
  );
};