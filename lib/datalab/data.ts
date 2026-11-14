// lib/datalab/data.ts

export interface RegistroDataset {
  id: string | number;
  variable: string;
  categoria: string;
  metrica: string;
  estado: string;
}

export const datasetsData: Record<number, RegistroDataset[]> = {
  // Dataset 0: Consumo Energético
  0: [
    { id: 1, variable: "Macuspana - Matutino", categoria: "Valle", metrica: "310.8 kWh", estado: "Normal" },
    { id: 2, variable: "Villahermosa - Pico", categoria: "Centro", metrica: "683.0 kWh", estado: "Crítico" },
    { id: 3, variable: "Cárdenas - Vespertino", categoria: "Pantanos", metrica: "450.2 kWh", estado: "Normal" },
    { id: 4, variable: "Zona Industrial", categoria: "Norte", metrica: "512.0 kWh", estado: "Estable" },
  ],
  // Dataset 1: Rendimiento STEM
  1: [
    { id: 1, variable: "Equipo Alfa", categoria: "Robótica", metrica: "88 pts", estado: "Aprobado" },
    { id: 2, variable: "Equipo Beta", categoria: "IoT", metrica: "92 pts", estado: "Sobresaliente" },
    { id: 3, variable: "Equipo Gamma", categoria: "Automatización", metrica: "79 pts", estado: "Regular" },
    { id: 4, variable: "Equipo Delta", categoria: "Sistemas", metrica: "96 pts", estado: "Líder" },
  ],
  // Dataset 2: Ventas de Makerspace
  2: [
    { id: 1, variable: "Sensor Ultrasónico", categoria: "Sensores", metrica: "142 Unidades", estado: "Alto" },
    { id: 2, variable: "Kit Arduino Uno", categoria: "Microcontroladores", metrica: "95 Unidades", estado: "Normal" },
    { id: 3, variable: "Multímetro Digital", categoria: "Herramientas", metrica: "60 Unidades", estado: "Bajo" },
    { id: 4, variable: "Protoboard 830", categoria: "Accesorios", metrica: "120 Unidades", estado: "Normal" },
  ],
  // Dataset 3: Crecimiento Local
  3: [
    { id: 1, variable: "Macuspana", categoria: "Centro", metrica: "155,000 Hab.", estado: "Normal" },
    { id: 2, variable: "Villahermosa", categoria: "Centro", metrica: "683,000 Hab.", estado: "Crítico" },
    { id: 3, variable: "Cárdenas", categoria: "Pantanos", metrica: "102,000 Hab.", estado: "Bajo" },
    { id: 4, variable: "Zona Pantanos", categoria: "Humedal", metrica: "45,000 Hab.", estado: "Estable" },
  ]
};