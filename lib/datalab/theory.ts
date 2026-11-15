// lib/datalab/theory.ts
import clase1 from './DL-CT-01.json';
import clase2 from './DL-CT-02.json';
import clase3 from './DL-CT-03.json';
import clase4 from './DL-CT-04.json';

// Si algún componente externo sigue buscando 'claseDataLab01' individualmente:
export const claseDataLab01 = clase1;

// Si algún componente busca individualmente la clase 2:
export const claseDataLab02 = clase2;

// Arreglo concentrado en orden para que RecorridoTeorico muestre todas las clases
export const listadoClasesDataLab = [
  clase1,
  clase2,
  clase3,
  clase4
];