// components/datalab/dataset-selector.tsx

import React from 'react';
import { DataLabConfig } from '@/lib/datalab/types';

interface DatasetSelectorProps {
  config: DataLabConfig['contenido']['configuracion_datos'];
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({ config }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-white font-bold text-sm uppercase tracking-wide">Conjunto de Datos Activo</h3>
        <p className="text-slate-400 text-xs mt-1">{config.descripcion_fuente}</p>
      </div>
      <div className="bg-slate-900 border border-slate-600 px-4 py-2 rounded text-blue-400 font-mono text-sm">
        {config.fuente_datos}
      </div>
    </div>
  );
};