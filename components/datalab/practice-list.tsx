import React from 'react';
import { practicasDataLab } from '@/lib/datalab/practices'; // Importamos el JSON
import { PracticeCard } from './practice-card'; // Importamos la tarjeta

export const PracticeList = () => {
  // Extraemos la lista de retos directamente de la configuración
  const listaDeRetos = practicasDataLab.contenido.retos;

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
        Ruta de Aprendizaje
      </h2>
      
      {/* Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listaDeRetos.map((reto) => (
          <PracticeCard key={reto.id_reto} reto={reto} />
        ))}
      </div>
    </section>
  );
};