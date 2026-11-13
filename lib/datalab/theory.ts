// lib/datalab/theory.ts
export const claseDataLab01 = {
  schema_version: "1.0.0",
  version_contenido: "1.0.0",
  identificador: "DL-CT-01",
  laboratorio_id: "datalab",
  tipo_contenido: "clase_teorica",
  estado_publicacion: "borrador",
  titulo: "Representación y Patrones de Datos",
  descripcion: "Aprende a interpretar distribuciones de frecuencia, identificar picos de demanda y analizar correlaciones temporales.",
  orden: 1,
  duracion_estimada_minutos: 15,
  objetivos: [
    "Interpretar correctamente los valores representados en gráficas de barras y líneas.",
    "Identificar anomalías o puntos de inflexión (picos) en conjuntos de datos reales.",
    "Formular hipótesis analíticas basadas en el filtrado de registros."
  ],
  secciones: [
    {
      titulo: "Lectura de variables y frecuencias",
      parrafos: [
        "Un conjunto de datos agrupa mediciones ordenadas por categorías o intervalos temporales.",
        "Analizar una gráfica requiere comparar la altura de las barras o la tendencia de las líneas para detectar qué intervalo concentra la mayor concentración de la muestra."
      ]
    },
    {
      titulo: "Identificación de picos operativos",
      parrafos: [
        "Los puntos más altos en un histograma de consumo o rendimiento señalan sobreposiciones de cargas o eventos críticos.",
        "Por ejemplo, ubicar un pico de 580 kWh entre las 16:00 y las 20:00 hrs permite deducir el momento exacto de mayor exigencia en el sistema."
      ]
    }
  ],
  prepara_para: [
    {
      practica_id: "DL-PI-01",
      tipo_contenido: "practica_individual",
      aplicacion: "Filtrar registros en la tabla interactiva y comprobar los cálculos de promedio y picos máximos."
    },
    {
      practica_id: "DL-PC-01",
      tipo_contenido: "practica_complementaria",
      aplicacion: "Cambiar la escala temporal (Horas, Meses, Años) para evaluar variaciones estacionales y responder los desafíos del simulador."
    }
  ]
};