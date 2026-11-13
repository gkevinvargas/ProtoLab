// lib/datalab/chart-data.ts

// Función que simula el motor de análisis: limpia y prepara datos
export const prepararDatosGrafica = (datosCrudos: any[], filtrosConfig: any[]) => {
  if (!filtrosConfig || filtrosConfig.length === 0) return datosCrudos;

  return datosCrudos.filter(fila => {
    return filtrosConfig.every(filtro => {
      const valorFila = fila[filtro.variable];
      
      // Aplica el motor lógico según la condición del JSON
      if (filtro.condicion === 'mayor_que') return valorFila > filtro.valor;
      if (filtro.condicion === 'menor_que') return valorFila < filtro.valor;
      if (filtro.condicion === 'igual') return valorFila === filtro.valor;
      
      // Si solo es un valor por defecto (como en el reto 1)
      if (filtro.valor_defecto) return valorFila === filtro.valor_defecto;
      
      return true;
    });
  });
};