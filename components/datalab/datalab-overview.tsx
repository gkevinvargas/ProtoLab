// components/datalab/datalab-overview.tsx
"use client";

import React, { useState } from 'react';
import { DatasetTable } from './dataset-table';
import { DataChart } from './data-chart';
import { DataLabResults } from './datalab-results';
import { 
  IconChartHistogram, IconRefresh, IconDatabase, IconBolt, 
  IconTable, IconChartLine, IconChartBar, IconChartPie, 
  IconBulb, IconBrain, IconTrophy, IconArrowRight, IconDownload, IconFileDescription, IconMathFunction
} from '@tabler/icons-react';

export const DataLabOverview = () => {
  const [datasetActivo, setDatasetActivo] = useState(0);
  const [tipoGrafica, setTipoGrafica] = useState<'barras' | 'dispersion' | 'libre'>('barras');
  const [respuestaTecnica, setRespuestaTecnica] = useState('');
  const [filtroTabla, setFiltroTabla] = useState('Todo');

  // Estados de Progreso Real e Historial de XP
  const [aciertos, setAciertos] = useState(0);
  const [puntosXP, setPuntosXP] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fueExito, setFueExito] = useState(false);

  // Retos con opciones limpias (sin los números explícitos para forzar el análisis real)
  const retosPorDataset = [
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
    }
  ];

  const retoActivo = retosPorDataset[datasetActivo] || retosPorDataset[0];

  const procesarEvaluacion = () => {
    if (!respuestaTecnica) {
      alert("Por favor selecciona una opción antes de evaluar.");
      return;
    }

    const opcionSeleccionada = retoActivo.opciones.find(op => op.letra === respuestaTecnica);
    const esCorrecto = opcionSeleccionada ? opcionSeleccionada.correcta : false;

    setFueExito(esCorrecto);
    if (esCorrecto) {
      setAciertos(prev => Math.min(prev + 1, retosPorDataset.length));
      setPuntosXP(prev => prev + 100);
    }
    setModalAbierto(true);
  };

  const datasetsMock = [
    { id: 0, nombre: "Consumo Energético", desc: "kWh por franja horaria", color: "text-cyan-500" },
    { id: 1, nombre: "Rendimiento STEM", desc: "Calificaciones ProtoLab", color: "text-blue-600" },
    { id: 2, nombre: "Ventas de Makerspace", desc: "Kits de robótica & sensores", color: "text-purple-500" },
    { id: 3, nombre: "Crecimiento Local", desc: "Población tecnológica", color: "text-emerald-500" },
  ];

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
                <h1 className="text-2xl font-extrabold text-slate-900">DataLab</h1>
                <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">Simulador Activo</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Nivel Intermedio</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xl">Laboratorio interactivo de análisis, visualización y formulación de hipótesis con datos reales.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unidad Actual</span>
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <IconFileDescription size={16} stroke={1.5} className="text-blue-500" /> Práctica 4: Representación & Patrones
                </span>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
             >
               <IconRefresh size={16} stroke={1.5} /> Reiniciar
             </button>
          </div>
        </header>

        {/* CAMBIO DINÁMICO DE DATASET EN TARJETAS SUPERIORES */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="text-slate-800 font-bold text-base flex items-center gap-2">
              <IconDatabase size={20} stroke={1.5} className="text-indigo-400" /> Conjunto de datos para análisis: <span className="text-blue-600 font-extrabold">{retoActivo.tituloDataset}</span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <strong>Dataset Activo #{datasetActivo + 1}</strong></span>
              <span className="text-slate-400">Sincronizado</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {datasetsMock.map((ds) => (
              <button
                key={ds.id}
                onClick={() => {
                  setDatasetActivo(ds.id);
                  setRespuestaTecnica('');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  datasetActivo === ds.id ? 'bg-cyan-50 border-cyan-300 shadow-sm ring-2 ring-cyan-500/20' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${datasetActivo === ds.id ? 'text-cyan-700' : 'text-slate-700'}`}>
                  <IconBolt size={16} className={ds.color} stroke={2} /> {ds.nombre}
                </span>
                <span className="text-[11px] text-slate-500 pl-6">{ds.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* GRID CENTRAL: TABLA CON FILTRADO REAL Y GRÁFICA DINÁMICA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Lado Izquierdo: Tabla y Filtros */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconTable size={18} stroke={1.5} className="text-slate-400" /> Explorador de Registros
                </h3>
                <span className="text-xs text-slate-500">{retoActivo.tituloDataset}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-xs font-medium overflow-x-auto pb-1">
                {['Todo', 'Horas Pico', 'Valle nocturno'].map((filtro) => (
                  <button
                    key={filtro}
                    onClick={() => setFiltroTabla(filtro)}
                    className={`px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      filtroTabla === filtro ? 'bg-cyan-100 text-cyan-700 font-bold' : 'text-slate-500 hover:text-slate-800 bg-slate-50'
                    }`}
                  >
                    {filtro}
                  </button>
                ))}
              </div>

              <DatasetTable datasetId={datasetActivo} filtroCategoria={filtroTabla} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                   <IconMathFunction size={22} stroke={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-400">PROMEDIO DE MUESTRA</span>
                  <span className="text-lg font-black text-slate-900 leading-tight">Activo <span className="text-xs font-medium text-slate-500">v{datasetActivo + 1}</span></span>
                </div>
              </div>
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600">
                   <IconChartLine size={22} stroke={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-slate-500">ESTADO DE ANÁLISIS</span>
                  <span className="text-lg font-black text-cyan-700 leading-tight">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Gráfica Dinámica por Dataset */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                  <IconChartLine size={18} stroke={1.5} className="text-slate-400" /> Visualización Dinámica ({retoActivo.tituloDataset})
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <button onClick={() => setTipoGrafica('barras')} className={tipoGrafica === 'barras' ? 'text-blue-600 flex items-center gap-1 cursor-pointer' : 'hover:text-slate-800 flex items-center gap-1 cursor-pointer'}><IconChartBar size={16} /> Barras</button>
                  <button onClick={() => setTipoGrafica('dispersion')} className={tipoGrafica === 'dispersion' ? 'text-blue-600 flex items-center gap-1 cursor-pointer' : 'hover:text-slate-800 flex items-center gap-1 cursor-pointer'}><IconChartLine size={16} /> Líneas</button>
                  <button onClick={() => setTipoGrafica('libre')} className={tipoGrafica === 'libre' ? 'text-blue-600 flex items-center gap-1 cursor-pointer' : 'hover:text-slate-800 flex items-center gap-1 cursor-pointer'}><IconChartPie size={16} /> Proporción</button>
                </div>
              </div>
              
              <div className="w-full bg-white rounded-lg min-h-[220px]">
                <DataChart datasetId={datasetActivo} tipoGrafica={tipoGrafica} />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600 shadow-sm">
              <IconBulb size={24} stroke={1.5} className="text-blue-500 shrink-0" />
              <div>
                <strong className="text-slate-800 block mb-0.5 font-semibold">Interpretación Analítica del Dataset Activo</strong>
                Cada tarjeta superior despliega métricas y patrones únicos. Analiza la gráfica y la tabla de la izquierda para responder correctamente el desafío planteado abajo.
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: EVALUACIÓN Y HISTORIAL DE XP Y PROGRESO REAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  Desafío del Dataset {datasetActivo + 1} de 4 <span className="text-slate-700 font-semibold ml-1">Pregunta de Evaluación Práctica</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                   <IconBrain size={14} stroke={2} className="text-pink-500" /> Pensamiento Crítico
                </span>
              </div>
              
              <h3 className="text-slate-800 font-medium text-sm leading-relaxed">
                {retoActivo.pregunta}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {retoActivo.opciones.map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRespuestaTecnica(op.letra)}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                      respuestaTecnica === op.letra
                        ? 'bg-cyan-50/60 border-cyan-300 text-slate-900 shadow-sm ring-2 ring-cyan-500/20 font-semibold'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs pt-0.5 text-slate-800 w-4">{op.letra}</span>
                    <span className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-600">
                      {op.texto}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                onClick={procesarEvaluacion}
                disabled={!respuestaTecnica}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Evaluar Desafío Práctico
              </button>
            </div>
          </div>

          {/* HISTORIAL DE PUNTUACIÓN XP Y PROGRESO REAL */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TU RENDIMIENTO</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2.5 py-0.5 rounded-full font-bold animate-pulse">En tiempo real</span>
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">DataLab Master</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">Validando análisis correcto por cada conjunto de datos.</p>
              </div>
              
              <div className="flex items-center justify-between py-4 border-y border-slate-100">
                <div className="text-center">
                  <span className="text-3xl font-black text-blue-600">{aciertos}/4</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-bold uppercase">Aciertos</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-black text-emerald-500">+{puntosXP}</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-bold uppercase">Puntos XP</span>
                </div>
                <div className="text-center flex flex-col items-center">
                  <IconTrophy size={32} stroke={1.5} className="text-purple-600" />
                  <span className="text-[9px] text-purple-600 block mt-1 font-bold uppercase">Nivel {Math.floor(puntosXP / 100) + 1}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button 
                  onClick={() => {
                    if (datasetActivo < datasetsMock.length - 1) {
                      setDatasetActivo(prev => prev + 1);
                      setRespuestaTecnica('');
                    } else {
                      alert("¡Has analizado y completado los 4 datasets de DataLab con éxito!");
                    }
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Siguiente Dataset o Módulo</span> <IconArrowRight size={18} />
                </button>
                <button 
                  onClick={() => alert("Generando reporte PDF con tu portafolio de análisis...")}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition-colors border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconDownload size={16} /> Descargar informe en PDF
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      <DataLabResults 
        isOpen={modalAbierto} 
        esExito={fueExito}
        mensajeExito={retoActivo.mensajeExito}
        mensajeError={retoActivo.mensajeError}
        onReintentar={() => setModalAbierto(false)}
        onAvanzar={() => {
          setModalAbierto(false);
          setRespuestaTecnica('');
          if (datasetActivo < datasetsMock.length - 1) {
            setDatasetActivo(prev => prev + 1);
          }
        }}
      />
    </div>
  );
};