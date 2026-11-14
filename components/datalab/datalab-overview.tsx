// components/datalab/datalab-overview.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DatasetTable } from "./dataset-table";
import { DataChart } from "./data-chart";
import { DataLabResults } from "./datalab-results";
import {
  IconChartHistogram,
  IconRefresh,
  IconBolt,
  IconTable,
  IconChartLine,
  IconChartBar,
  IconArrowRight,
  IconDatabase,
  IconTerminal,
} from "@tabler/icons-react";

interface DataLabOverviewProps {
  onApproved?: (puntaje: number) => void;
  onReset?: () => void;
}

export const DataLabOverview: React.FC<DataLabOverviewProps> = ({
  onApproved,
  onReset,
}) => {
  const router = useRouter();

  const [pasoActivo, setPasoActivo] = useState(0);
  const [tipoGrafica, setTipoGrafica] = useState<
    "barras" | "dispersion" | "libre"
  >("barras");
  const [respuestaTecnica, setRespuestaTecnica] = useState("");
  const [filtroTabla, setFiltroTabla] = useState("Todo");

  const [aciertos, setAciertos] = useState(0);
  const [practicasCompletadas, setPracticasCompletadas] = useState<number[]>([]);
  const [puntosXP, setPuntosXP] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fueExito, setFueExito] = useState(false);

  // Alterna entre las prácticas de DataLab y Database Studio.
  const [vistaActual, setVistaActual] = useState<
    "datalab" | "database_lab"
  >("datalab");
  const [querySql, setQuerySql] = useState(
    "SELECT * FROM fact_consumo_energetico WHERE zona = 'Centro' LIMIT 5;"
  );
  const [resultadoQuery, setResultadoQuery] = useState(false);

  // Secuencia de los 8 módulos normales
  const secuenciaCurricula = [
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
    },
    {
      id: 7,
      tituloDataset: "DL-CT-04: Modelado Predictivo",
      pregunta: "En la última fase de validación de modelos, ¿qué indicador confirma la estabilidad del conjunto analizado?",
      opciones: [
        { letra: "A", texto: "Baja dispersión y convergencia en los residuos del modelo", correcta: true },
        { letra: "B", texto: "Saturación total de la memoria RAM del servidor", correcta: false },
        { letra: "C", texto: "Eliminación de todas las variables independientes", correcta: false },
        { letra: "D", texto: "Aumento descontrolado del margen de error", correcta: false },
      ],
      mensajeExito: "¡Fantástico! Concluiste con éxito todos los módulos y prácticas de DataLab.",
      mensajeError: "Incorrecto. Revisa los parámetros de estabilidad y residuos del modelo."
    }
  ];

  const datasetsMock = [
    { id: 0, nombre: "Consumo Energético", desc: "kWh por franja horaria", color: "text-cyan-500" },
    { id: 1, nombre: "Rendimiento STEM", desc: "Calificaciones ProtoLab", color: "text-blue-600" },
    { id: 2, nombre: "Ventas de Makerspace", desc: "Kits de robótica & sensores", color: "text-purple-500" },
    { id: 3, nombre: "Crecimiento Local", desc: "Población tecnológica", color: "text-emerald-500" },
    { id: 4, nombre: "DL-CT-01: Patrones", desc: "Distribución de frecuencias", color: "text-amber-500" },
    { id: 5, nombre: "DL-CT-02: Filtrado", desc: "Filtros condicionales cruzados", color: "text-rose-500" },
    { id: 6, nombre: "DL-CT-03: Outliers", desc: "Tendencias y valores atípicos", color: "text-indigo-500" },
    { id: 7, nombre: "DL-CT-04: Modelado", desc: "Validación y estabilidad", color: "text-teal-500" },
  ];

  const contenidoActual = secuenciaCurricula[pasoActivo] || secuenciaCurricula[0];

  // Avanza únicamente después de aprobar la práctica actual.
  const handleNextStep = () => {
    if (!fueExito) return;

    // Incluye la práctica actual para evitar depender de una actualización
    // de estado que pudiera seguir pendiente.
    const completadas = new Set(practicasCompletadas);
    completadas.add(pasoActivo);

    const nuevasCompletadas = Array.from(completadas);
    setPracticasCompletadas(nuevasCompletadas);

    // Si el usuario seleccionó los módulos en otro orden, busca el siguiente
    // que todavía no haya aprobado.
    const siguientePendiente = secuenciaCurricula.find(
      ({ id }) => !completadas.has(id)
    );

    setRespuestaTecnica("");
    setFueExito(false);
    setModalAbierto(false);

    if (siguientePendiente) {
      setPasoActivo(siguientePendiente.id);
      return;
    }

    // Database Studio solo se abre después de aprobar las ocho prácticas.
    setVistaActual("database_lab");
  };

  // Evalúa la respuesta seleccionada y registra cada práctica una sola vez.
  const procesarEvaluacion = () => {
    if (!respuestaTecnica) {
      alert("Por favor selecciona una opción antes de evaluar.");
      return;
    }

    const opcionSeleccionada = contenidoActual.opciones.find(
      (op) => op.letra === respuestaTecnica
    );
    const esCorrecto = opcionSeleccionada?.correcta ?? false;

    setFueExito(esCorrecto);
    setModalAbierto(true);

    if (
      esCorrecto &&
      !practicasCompletadas.includes(pasoActivo)
    ) {
      setPracticasCompletadas((actuales) =>
        actuales.includes(pasoActivo)
          ? actuales
          : [...actuales, pasoActivo]
      );
      setAciertos((prev) => prev + 1);
      setPuntosXP((prev) => prev + 100);
    }
  };

  // Reinicia DataLab. Si el componente padre administra el avance,
  // delega el reinicio para mantener sincronizada la ruta.
  const reiniciar = () => {
    if (onReset) {
      onReset();
      return;
    }

    setPasoActivo(0);
    setTipoGrafica("barras");
    setRespuestaTecnica("");
    setFiltroTabla("Todo");
    setAciertos(0);
    setPracticasCompletadas([]);
    setPuntosXP(0);
    setModalAbierto(false);
    setFueExito(false);
    setVistaActual("datalab");
    setQuerySql(
      "SELECT * FROM fact_consumo_energetico WHERE zona = 'Centro' LIMIT 5;"
    );
    setResultadoQuery(false);
  };

  // Registra la aprobación final únicamente después de completar
  // las ocho prácticas y ejecutar la consulta de Database Studio.
  const finalizarPractica = () => {
    if (practicasCompletadas.length !== secuenciaCurricula.length) {
      alert("Debes aprobar las ocho prácticas antes de continuar.");
      return;
    }

    if (!resultadoQuery) {
      alert("Primero ejecuta la consulta SQL.");
      return;
    }

    const puntaje = Math.round(
      (practicasCompletadas.length / secuenciaCurricula.length) * 100
    );

    if (onApproved) {
      onApproved(puntaje);
      return;
    }

    router.push("/electrolab");
  };

  // =========================================================================
  // RENDERIZADO CONDICIONAL: SI ESTAMOS EN MODO BASE DE DATOS (INTERFAZ DISTINTA)
  // =========================================================================
  if (vistaActual === 'database_lab') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-10 flex flex-col gap-6 font-sans">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <IconDatabase size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Módulo de Práctica Avanzada</span>
              <h1 className="text-xl font-black text-white">Database Studio: Consultas y Esquema FactConsumo</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">PostgreSQL / SQL Activo</span>
            <button
              onClick={() => setVistaActual('datalab')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-700"
            >
              ← Regresar a DataLab
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel izquierdo: Editor de Queries */}
          <div className="lg:col-span-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <IconTerminal size={18} /> Consola SQL Interactiva
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escribe y ejecuta consultas SQL directamente sobre el esquema relacional de consumo energético para validar la integridad de los datos almacenados:
            </p>
            <textarea
              rows={6}
              value={querySql}
              onChange={(e) => setQuerySql(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-emerald-300 outline-none focus:border-emerald-500 shadow-inner"
            />
            <button
              onClick={() => setResultadoQuery(true)}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <span>Ejecutar Consulta SQL</span> <IconArrowRight size={16} />
            </button>
          </div>

          {/* Panel derecho: Resultados y Salto a ElectroLab */}
          <div className="lg:col-span-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <IconTable size={18} /> Salida del Servidor de Base de Datos
            </h3>

            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto min-h-[160px] flex flex-col justify-center">
              {resultadoQuery ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-cyan-400 text-[11px]">
                      <th className="pb-2">id_transaccion</th>
                      <th className="pb-2">zona_operativa</th>
                      <th className="pb-2">kwh_registrados</th>
                      <th className="pb-2">estado</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px]">
                    <tr className="border-b border-slate-800/50"><td className="py-2">501</td><td>Centro / Villahermosa</td><td>450.2 kWh</td><td className="text-emerald-400">Normal</td></tr>
                    <tr className="border-b border-slate-800/50"><td className="py-2">502</td><td>Centro / Villahermosa</td><td>683.0 kWh</td><td className="text-amber-400">Pico</td></tr>
                    <tr><td className="py-2">503</td><td>Macuspana</td><td>310.8 kWh</td><td className="text-emerald-400">Normal</td></tr>
                  </tbody>
                </table>
              ) : (
                <span className="text-slate-500 text-center italic">Presiona "Ejecutar Consulta SQL" para desplegar los registros...</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex flex-col gap-3">
              <span className="text-[11px] text-slate-400">¿Has completado la validación de la base de datos?</span>
              <button
                type="button"
                onClick={finalizarPractica}
                disabled={
                  !resultadoQuery ||
                  practicasCompletadas.length !== secuenciaCurricula.length
                }
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                <span>Finalizar práctica y continuar</span>
                <IconArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA NORMAL DE DATALAB (La interfaz de las 8 tarjetas, tablas y gráficas)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans">
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">

        {/* ENCABEZADO */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Conjunto de datos para análisis:</span>
            <span className="text-sm font-extrabold text-cyan-600">{contenidoActual.tituloDataset}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Módulo #{pasoActivo + 1} de {secuenciaCurricula.length}
            </span>
            <span className="text-cyan-600 font-semibold bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">Sincronizado</span>
            <button
              type="button"
              onClick={reiniciar}
              className="text-slate-500 hover:text-slate-800 font-semibold transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                <IconRefresh size={15} />
                Reiniciar
              </span>
            </button>
          </div>
        </div>

        {/* SELECTOR SUPERIOR DE MÓDULOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {datasetsMock.map((ds) => (
            <button
              key={ds.id}
              type="button"
              onClick={() => {
                setPasoActivo(ds.id);
                setRespuestaTecnica("");
                setFueExito(false);
                setModalAbierto(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                pasoActivo === ds.id
                  ? 'bg-cyan-50/80 border-cyan-300 shadow-sm ring-2 ring-cyan-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-bold flex items-center gap-1.5 mb-1 truncate ${pasoActivo === ds.id ? 'text-cyan-700' : 'text-slate-700'}`}>
                <IconBolt size={14} className={ds.color} /> {ds.nombre}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">{ds.desc}</span>
            </button>
          ))}
        </div>

        {/* SECCIÓN PRINCIPAL: TABLA Y GRÁFICA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconTable size={18} stroke={1.5} className="text-slate-400" /> Explorador de Registros
                </h3>
                <span className="text-xs text-slate-500 font-medium">{contenidoActual.tituloDataset}</span>
              </div>
              <DatasetTable datasetId={contenidoActual.id} filtroCategoria={filtroTabla} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <span className="text-xs font-black">fx</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Promedio Muestra</span>
                  <span className="text-xs font-extrabold text-slate-800">Activo v{pasoActivo + 1}</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                  <IconRefresh size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado Análisis</span>
                  <span className="text-xs font-extrabold text-cyan-600">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconChartLine size={18} stroke={1.5} className="text-slate-400" /> Visualización Dinámica ({contenidoActual.tituloDataset})
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <button onClick={() => setTipoGrafica('barras')} className={tipoGrafica === 'barras' ? 'text-cyan-600 flex items-center gap-1 cursor-pointer font-bold' : 'hover:text-slate-800 flex items-center gap-1 cursor-pointer'}><IconChartBar size={16} /> Barras</button>
                  <button onClick={() => setTipoGrafica('dispersion')} className={tipoGrafica === 'dispersion' ? 'text-cyan-600 flex items-center gap-1 cursor-pointer font-bold' : 'hover:text-slate-800 flex items-center gap-1 cursor-pointer'}><IconChartLine size={16} /> Líneas</button>
                </div>
              </div>
              <div className="w-full bg-white rounded-lg min-h-[225px] flex items-center justify-center">
                <DataChart datasetId={contenidoActual.id} tipoGrafica={tipoGrafica} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 text-xs text-slate-500">
              <span className="text-indigo-500"><IconChartHistogram size={20} /></span>
              <p><strong>Interpretación Analítica:</strong> Analiza la gráfica y la tabla para resolver el desafío planteado abajo.</p>
            </div>
          </div>

        </div>

        {/* SECCIÓN INFERIOR: DESAFÍO Y PROGRESO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8">

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                Desafío {pasoActivo + 1} de {secuenciaCurricula.length}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Evaluación Técnica</span>
            </div>

            <h3 className="text-slate-800 font-bold text-sm leading-relaxed">
              {contenidoActual.pregunta}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contenidoActual.opciones.map((op, idx) => (
                <button
                  key={idx}
                  onClick={() => setRespuestaTecnica(op.letra)}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    respuestaTecnica === op.letra
                      ? 'bg-cyan-50 border-cyan-300 font-semibold text-cyan-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`font-bold text-xs w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${respuestaTecnica === op.letra ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {op.letra}
                  </span>
                  <span className="text-xs font-medium leading-tight pt-0.5">{op.texto}</span>
                </button>
              ))}
            </div>

            <button
              onClick={procesarEvaluacion}
              disabled={!respuestaTecnica}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              Evaluar Respuesta
            </button>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu Rendimiento</span>
              <span className="text-[10px] font-bold text-slate-500">En tiempo real</span>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-black text-slate-900">DataLab Master</h4>
              <p className="text-xs text-slate-500">Al completar el último módulo abrirás el Database Studio.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 text-center">
              <div>
                <span className="text-xl font-black text-cyan-600 block">{aciertos}/{secuenciaCurricula.length}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Aciertos</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-xl font-black text-emerald-500 block">+{puntosXP}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Puntos XP</span>
              </div>
              <div>
                <span className="text-xl font-black text-indigo-600 block">Nivel 5</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Rango</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!fueExito}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Siguiente Dataset o Módulo</span> <IconArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </main>

      <DataLabResults
        isOpen={modalAbierto}
        esExito={fueExito}
        mensajeExito={contenidoActual.mensajeExito}
        mensajeError={contenidoActual.mensajeError}
        onReintentar={() => {
          setModalAbierto(false);
          setFueExito(false);
          setRespuestaTecnica("");
        }}
        onAvanzar={() => {
          setModalAbierto(false);
          setRespuestaTecnica("");
          handleNextStep();
        }}
      />
    </div>
  );
};
