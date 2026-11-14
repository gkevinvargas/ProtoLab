// lib/datalab/datalab-data.ts
export const secuenciaCurricula = [
  {
    id: 0,
    tituloDataset: "Consumo Energético",
    pregunta: "¿Cuál es la franja horaria que registra el pico máximo de demanda según el análisis de carga?",
    opciones: [
      { letra: "A", texto: "08:00 - 12:00 hrs (Franja matutina)", correcta: false },
      { letra: "B", texto: "16:00 - 20:00 hrs (Franja vespertina / pico)", correcta: true },
      { letra: "C", texto: "00:00 - 04:00 hrs (Franja nocturna valle)", correcta: false },
      { letra: "D", texto: "12:00 - 16:00 hrs (Franja de meseta)", correcta: false },
    ],
    mensajeExito: "¡Correcto! Analizaste la gráfica y encontraste el horario exacto de mayor demanda.",
    mensajeError: "Incorrecto. Revisa de nuevo las barras de la gráfica para ubicar el punto más alto."
  },
  {
    id: 1,
    tituloDataset: "Rendimiento STEM",
    pregunta: "¿Qué equipo evaluado obtuvo el puntaje más alto en las pruebas prácticas de ProtoLab?",
    opciones: [
      { letra: "A", texto: "Equipo Alfa", correcta: false },
      { letra: "B", texto: "Equipo Beta", correcta: false },
      { letra: "C", texto: "Equipo Gamma", correcta: false },
      { letra: "D", texto: "Equipo Delta", correcta: true },
    ],
    mensajeExito: "¡Excelente! Consultaste los registros y determinaste correctamente al equipo líder.",
    mensajeError: "Incorrecto. Compara los valores de la tabla de registros para identificar al equipo con mayor puntaje."
  },
  {
    id: 2,
    tituloDataset: "Ventas de Makerspace",
    pregunta: "De acuerdo con el inventario actual, ¿cuál componente lidera la distribución en unidades?",
    opciones: [
      { letra: "A", texto: "Sensor ultrasónico", correcta: true },
      { letra: "B", texto: "Kit Arduino Uno", correcta: false },
      { letra: "C", texto: "Multímetro digital", correcta: false },
      { letra: "D", texto: "Módulos de prototipado básico", correcta: false },
    ],
    mensajeExito: "¡Muy bien! Identificaste el componente con mayor rotación en el inventario.",
    mensajeError: "Incorrecto. Revisa el listado en la tabla del Makerspace para encontrar el componente con más unidades."
  },
  {
    id: 3,
    tituloDataset: "Crecimiento Local",
    pregunta: "¿Cuál de los puntos analizados concentra la mayor densidad poblacional registrada?",
    opciones: [
      { letra: "A", texto: "Macuspana", correcta: false },
      { letra: "B", texto: "Cárdenas", correcta: false },
      { letra: "C", texto: "Centro / Villahermosa", correcta: true },
      { letra: "D", texto: "Zona Pantanos", correcta: false },
    ],
    mensajeExito: "¡Correcto! Comprobaste los datos demográficos en el panel izquierdo.",
    mensajeError: "Incorrecto. Analiza el comparativo regional para ubicar la zona con mayor población."
  },
  {
    id: 4,
    tituloDataset: "DL-CT-01: Patrones y Frecuencias",
    pregunta: "En la práctica de distribución de frecuencias, ¿qué intervalo concentra la mayor densidad operativa?",
    opciones: [
      { letra: "A", texto: "Intervalo inicial de arranque (0-20%)", correcta: false },
      { letra: "B", texto: "Intervalo crítico de operación (40-60%)", correcta: true },
      { letra: "C", texto: "Intervalo de valle o reposo (80-100%)", correcta: false },
      { letra: "D", texto: "Intervalo intermedio sin variaciones", correcta: false },
    ],
    mensajeExito: "¡Excelente! Interpretaste correctamente el histograma de frecuencias de la práctica DL-CT-01.",
    mensajeError: "Incorrecto. Analiza la altura de las barras en el explorador para ubicar el intervalo con mayor densidad."
  },
  {
    id: 5,
    tituloDataset: "DL-CT-02: Filtrado Cruzado",
    pregunta: "Al aplicar filtros condicionales cruzados en la práctica, ¿qué tipo de tendencia se aísla con mayor precisión?",
    opciones: [
      { letra: "A", texto: "Comportamientos anómalos y picos operativos puntuales", correcta: true },
      { letra: "B", texto: "Errores generales de sintaxis en el código base", correcta: false },
      { letra: "C", texto: "Promedios globales sin segmentación", correcta: false },
      { letra: "D", texto: "Registros vacíos o nulos del sistema", correcta: false },
    ],
    mensajeExito: "¡Muy bien! Comprendiste el propósito del filtrado analítico avanzado en DL-CT-02.",
    mensajeError: "Incorrecto. Revisa los criterios de filtrado condicional en la tabla de registros."
  },
  {
    id: 6,
    tituloDataset: "DL-CT-03: Detección de Outliers",
    pregunta: "Durante el análisis de tendencias históricas de la práctica DL-CT-03, ¿cómo impacta un valor atípico (outlier)?",
    opciones: [
      { letra: "A", texto: "Estabiliza automáticamente la varianza de la muestra", correcta: false },
      { letra: "B", texto: "Desvía significativamente los cálculos promedio si no se aísla", correcta: true },
      { letra: "C", texto: "Elimina la necesidad de graficar la serie temporal", correcta: false },
      { letra: "D", texto: "Duplica la velocidad de procesamiento del servidor", correcta: false },
    ],
    mensajeExito: "¡Correcto! Identificaste cómo los outliers afectan las métricas analíticas.",
    mensajeError: "Incorrecto. Analiza cómo un punto fuera de rango altera los cálculos generales."
  }
];

export const datasetsMock = [
  { id: 0, nombre: "Consumo Energético", desc: "kWh por franja horaria", color: "text-cyan-500" },
  { id: 1, nombre: "Rendimiento STEM", desc: "Calificaciones ProtoLab", color: "text-blue-600" },
  { id: 2, nombre: "Ventas de Makerspace", desc: "Kits de robótica & sensores", color: "text-purple-500" },
  { id: 3, nombre: "Crecimiento Local", desc: "Población tecnológica", color: "text-emerald-500" },
  { id: 4, nombre: "DL-CT-01: Patrones", desc: "Distribución de frecuencias", color: "text-amber-500" },
  { id: 5, nombre: "DL-CT-02: Filtrado", desc: "Filtros condicionales cruzados", color: "text-rose-500" },
  { id: 6, nombre: "DL-CT-03: Outliers", desc: "Tendencias y valores atípicos", color: "text-indigo-500" },
];