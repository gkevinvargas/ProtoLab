
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

  // Secuencia de las siete prácticas interactivas.
  const secuenciaCurricula = [
    {
      id: 0,
      tituloDataset: "Consumo Energético",
      pregunta:
        "¿Cuál es la franja horaria que registra el pico máximo de demanda según el análisis de carga?",
      opciones: [
        { letra: "A", texto: "08:00 - 12:00 hrs (Franja matutina)", correcta: false },
        { letra: "B", texto: "16:00 - 20:00 hrs (Franja vespertina / pico)", correcta: true },
        { letra: "C", texto: "00:00 - 04:00 hrs (Franja nocturna valle)", correcta: false },
        { letra: "D", texto: "12:00 - 16:00 hrs (Franja de meseta)", correcta: false },
      ],
      mensajeExito:
        "¡Correcto! Analizaste la gráfica y encontraste el horario exacto de mayor demanda.",
      mensajeError:
        "Incorrecto. Revisa de nuevo las barras de la gráfica para ubicar el punto más alto.",
    },
    {
      id: 1,
      tituloDataset: "Rendimiento STEM",
      pregunta:
        "¿Qué equipo evaluado obtuvo el puntaje más alto en las pruebas prácticas de ProtoLab?",
      opciones: [
        { letra: "A", texto: "Equipo Alfa", correcta: false },
        { letra: "B", texto: "Equipo Beta", correcta: false },
        { letra: "C", texto: "Equipo Gamma", correcta: false },
        { letra: "D", texto: "Equipo Delta", correcta: true },
      ],
      mensajeExito:
        "¡Excelente! Consultaste los registros y determinaste correctamente al equipo líder.",
      mensajeError:
        "Incorrecto. Compara los valores de la tabla de registros para identificar al equipo con mayor puntaje.",
    },
    {
      id: 2,
      tituloDataset: "Ventas de Makerspace",
      pregunta:
        "De acuerdo con el inventario actual, ¿cuál componente lidera la distribución en unidades?",
      opciones: [
        { letra: "A", texto: "Sensor ultrasónico", correcta: true },
        { letra: "B", texto: "Kit Arduino Uno", correcta: false },
        { letra: "C", texto: "Multímetro digital", correcta: false },
        { letra: "D", texto: "Módulos de prototipado básico", correcta: false },
      ],
      mensajeExito:
        "¡Muy bien! Identificaste el componente con mayor rotación en el inventario.",
      mensajeError:
        "Incorrecto. Revisa el listado en la tabla del Makerspace para encontrar el componente con más unidades.",
    },
    {
      id: 3,
      tituloDataset: "Crecimiento Local",
      pregunta:
        "¿Cuál de los puntos analizados concentra la mayor densidad poblacional registrada?",
      opciones: [
        { letra: "A", texto: "Macuspana", correcta: false },
        { letra: "B", texto: "Cárdenas", correcta: false },
        { letra: "C", texto: "Centro / Villahermosa", correcta: true },
        { letra: "D", texto: "Zona Pantanos", correcta: false },
      ],
      mensajeExito:
        "¡Correcto! Comprobaste los datos demográficos en el panel izquierdo.",
      mensajeError:
        "Incorrecto. Analiza el comparativo regional para ubicar la zona con mayor población.",
    },
    {
      id: 4,
      tituloDataset: "DL-CT-01: Patrones y Frecuencias",
      pregunta:
        "En la práctica de distribución de frecuencias, ¿qué intervalo concentra la mayor densidad operativa?",
      opciones: [
        { letra: "A", texto: "Intervalo inicial de arranque (0-20%)", correcta: false },
        { letra: "B", texto: "Intervalo crítico de operación (40-60%)", correcta: true },
        { letra: "C", texto: "Intervalo de valle o reposo (80-100%)", correcta: false },
        { letra: "D", texto: "Intervalo intermedio sin variaciones", correcta: false },
      ],
      mensajeExito:
        "¡Excelente! Interpretaste correctamente el histograma de frecuencias de la práctica DL-CT-01.",
      mensajeError:
        "Incorrecto. Analiza la altura de las barras en el explorador para ubicar el intervalo con mayor densidad.",
    },
    {
      id: 5,
      tituloDataset: "DL-CT-02: Filtrado Cruzado",
      pregunta:
        "Al aplicar filtros condicionales cruzados en la práctica, ¿qué tipo de tendencia se aísla con mayor precisión?",
      opciones: [
        { letra: "A", texto: "Comportamientos anómalos y picos operativos puntuales", correcta: true },
        { letra: "B", texto: "Errores generales de sintaxis en el código base", correcta: false },
        { letra: "C", texto: "Promedios globales sin segmentación", correcta: false },
        { letra: "D", texto: "Registros vacíos o nulos del sistema", correcta: false },
      ],
      mensajeExito:
        "¡Muy bien! Comprendiste el propósito del filtrado analítico avanzado en DL-CT-02.",
      mensajeError:
        "Incorrecto. Revisa los criterios de filtrado condicional en la tabla de registros.",
    },
    {
      id: 6,
      tituloDataset: "DL-CT-03: Detección de Outliers",
      pregunta:
        "Durante el análisis de tendencias históricas de la práctica DL-CT-03, ¿cómo impacta un valor atípico (outlier)?",
      opciones: [
        { letra: "A", texto: "Estabiliza automáticamente la varianza de la muestra", correcta: false },
        { letra: "B", texto: "Desvía significativamente los cálculos promedio si no se aísla", correcta: true },
        { letra: "C", texto: "Elimina la necesidad de graficar la serie temporal", correcta: false },
        { letra: "D", texto: "Duplica la velocidad de procesamiento del servidor", correcta: false },
      ],
      mensajeExito:
        "¡Correcto! Identificaste cómo los outliers afectan las métricas analíticas.",
      mensajeError:
        "Incorrecto. Analiza cómo un punto fuera de rango altera los cálculos generales.",
    },
  ];

  // Tarjetas del selector de prácticas.
  const datasetsMock = [
    { id: 0, nombre: "Consumo Energético", desc: "kWh por franja horaria", color: "text-cyan-500" },
    { id: 1, nombre: "Rendimiento STEM", desc: "Calificaciones ProtoLab", color: "text-blue-600" },
    { id: 2, nombre: "Ventas de Makerspace", desc: "Kits de robótica & sensores", color: "text-purple-500" },
    { id: 3, nombre: "Crecimiento Local", desc: "Población tecnológica", color: "text-emerald-500" },
    { id: 4, nombre: "DL-CT-01: Patrones", desc: "Distribución de frecuencias", color: "text-amber-500" },
    { id: 5, nombre: "DL-CT-02: Filtrado", desc: "Filtros condicionales cruzados", color: "text-rose-500" },
    { id: 6, nombre: "DL-CT-03: Outliers", desc: "Tendencias y valores atípicos", color: "text-indigo-500" },
  ];

  const contenidoActual =
    secuenciaCurricula[pasoActivo] || secuenciaCurricula[0];

  // Avanzar o finalizar DataLab.
  const handleNextStep = () => {
    if (!fueExito) return;

    if (pasoActivo < secuenciaCurricula.length - 1) {
      setPasoActivo((prev) => prev + 1);
      setRespuestaTecnica("");
      setFueExito(false);
      return;
    }

    // Comprobar que todas las prácticas estén aprobadas.
    if (practicasCompletadas.length < secuenciaCurricula.length) {
      const siguientePendiente = secuenciaCurricula.find(
        ({ id }) => !practicasCompletadas.includes(id)
      );

      if (siguientePendiente) {
        setPasoActivo(siguientePendiente.id);
        setRespuestaTecnica("");
        setFueExito(false);

        alert(
          "Todavía tienes prácticas pendientes. Completa todas para continuar."
        );
        return;
      }
    }

    const puntaje = Math.round(
      (practicasCompletadas.length / secuenciaCurricula.length) * 100
    );

    if (onApproved) {
      onApproved(puntaje);
      return;
    }

    alert(
      "¡Felicidades! Has completado todas las prácticas interactivas de DataLab con éxito. Pasando a ElectroLab..."
    );

    router.push("/electrolab");
  };

  // Evaluar la respuesta seleccionada.
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

    // Evitar sumar puntos más de una vez por práctica.
    if (esCorrecto && !practicasCompletadas.includes(pasoActivo)) {
      setAciertos((prev) => prev + 1);
      setPuntosXP((prev) => prev + 100);

      setPracticasCompletadas((actuales) =>
        actuales.includes(pasoActivo)
          ? actuales
          : [...actuales, pasoActivo]
      );
    }
  };

  // Reiniciar DataLab.
  const reiniciar = () => {
    if (onReset) {
      onReset();
      return;
    }

    setPasoActivo(0);
    setRespuestaTecnica("");
    setAciertos(0);
    setPuntosXP(0);
    setPracticasCompletadas([]);
    setModalAbierto(false);
    setFueExito(false);
    setFiltroTabla("Todo");
    setTipoGrafica("barras");
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <main className="max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">

        {/* ENCABEZADO */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-indigo-500 shadow-sm border border-slate-200">
              <IconChartHistogram size={26} stroke={1.5} />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  DataLab Master
                </h1>

                <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
                  Práctica {pasoActivo + 1} de {secuenciaCurricula.length}
                </span>
              </div>

              <p className="text-sm text-slate-500 max-w-xl">
                Laboratorio interactivo de análisis, visualización y resolución de prácticas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reiniciar}
            className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <IconRefresh size={16} stroke={1.5} />
            Reiniciar
          </button>
        </header>

        {/* SELECTOR SUPERIOR DE PRÁCTICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
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
                  ? "bg-cyan-50 border-cyan-300 shadow-sm ring-2 ring-cyan-500/20"
                  : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                  pasoActivo === ds.id ? "text-cyan-700" : "text-slate-700"
                }`}
              >
                <IconBolt size={14} className={ds.color} />
                {ds.nombre}
              </span>

              <span className="text-[10px] text-slate-500 truncate block">
                {ds.desc}
              </span>
            </button>
          ))}
        </div>

        {/* INTERFAZ INTERACTIVA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* EXPLORADOR DE REGISTROS */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconTable size={18} stroke={1.5} className="text-slate-400" />
                  Explorador de Registros
                </h3>

                <span className="text-xs text-slate-500">
                  {contenidoActual.tituloDataset}
                </span>
              </div>

              <DatasetTable
                datasetId={contenidoActual.id}
                filtroCategoria={filtroTabla}
              />
            </div>
          </div>

          {/* GRÁFICAS Y EVALUACIÓN */}
          <div className="lg:col-span-7 flex flex-col gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconChartLine size={18} stroke={1.5} className="text-slate-400" />
                  Visualización Dinámica ({contenidoActual.tituloDataset})
                </h3>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setTipoGrafica("barras")}
                    className={
                      tipoGrafica === "barras"
                        ? "text-blue-600 flex items-center gap-1 cursor-pointer"
                        : "hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    }
                  >
                    <IconChartBar size={16} />
                    Barras
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoGrafica("dispersion")}
                    className={
                      tipoGrafica === "dispersion"
                        ? "text-blue-600 flex items-center gap-1 cursor-pointer"
                        : "hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    }
                  >
                    <IconChartLine size={16} />
                    Líneas
                  </button>
                </div>
              </div>

              <div className="w-full bg-white rounded-lg min-h-[220px]">
                <DataChart
                  datasetId={contenidoActual.id}
                  tipoGrafica={tipoGrafica}
                />
              </div>
            </div>

            {/* DESAFÍO */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <h3 className="text-slate-800 font-medium text-sm leading-relaxed">
                {contenidoActual.pregunta}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contenidoActual.opciones.map((op, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRespuestaTecnica(op.letra)}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      respuestaTecnica === op.letra
                        ? "bg-cyan-50 border-cyan-300 font-semibold"
                        : "bg-white border-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="font-bold text-xs pt-0.5 text-slate-800 w-4">
                      {op.letra}
                    </span>

                    <span className="text-xs font-medium text-slate-600">
                      {op.texto}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={procesarEvaluacion}
                  disabled={!respuestaTecnica}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Evaluar Práctica
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!fueExito}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Siguiente Práctica</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE RESULTADOS */}
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
