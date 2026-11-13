// components/datalab/datalab-header.tsx
"use client";

import React from 'react';
import { practicasDataLab } from '@/lib/datalab/practices';

export const DataLabHeader = () => {
  const { titulo, descripcion } = practicasDataLab.metadatos;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
            DataLab Simulator
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Laboratorio interactivo de análisis
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {titulo}
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm max-w-2xl leading-relaxed">
          {descripcion}
        </p>
      </div>
    </header>
  );
};