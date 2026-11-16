// components/datalab/datalab-overview.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatasetTable } from './dataset-table';
import { DataChart } from './data-chart';
import { DataLabResults } from './datalab-results';
import { 
  IconChartHistogram, IconRefresh, IconBolt, 
  IconTable, IconChartLine, IconChartBar, IconArrowRight, IconCheck, IconRotate 
} from '@tabler/icons-react';

import dlCt05 from '@/lib/datalab/DL-CT-05.json';

export const DataLabOverview = ({ onApproved }: { onApproved?: (score: number) => void }) => {
  const router = useRouter();
  const [pasoActivo, setPasoActivo] = useState(0);
  const [tipoGrafica, setTipoGrafica] = useState<'barras' | 'dispersion' | 'libre'>('barras');
  const [respuestaTecnica, setRespuestaTecnica] = useState('');
  const [filtroTabla, setFiltroTabla] = useState('Todo');

  const [aciertos, setAciertos] = useState(0);
  const [puntosXP, setPuntosXP] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fueExito, setFueExito] = useState(false);

  // Estados interactivos para la Práctica DL-CT-05 leída del JSON
  const act1Config: any = dlCt05.actividades_interactivas.find(a => a.tipo === 'ordenar_bloques')?.configuracion;
  const act2Config: any = dlCt05.actividades_interactivas.find(a => a.tipo === 'calculo_guiado')?.configuracion;

  const [bloquesUsuario, setBloquesUsuario] = useState<any[]>(
    act1Config && act1Config.bloques ? [...act1Config.bloques].sort(() => Math.random() - 0.5) : []
  );
  const [resultadoOrden, setResultadoOrden] = useState<boolean | null>(null);

  const [paso1Input, setPaso1Input] = useState('');
  const [paso2Input, setPaso2Input] = useState('');
  const [resultadoCalculo, setResultadoCalculo] = useState<boolean | null>(null);

  // Secuencia de los 8 módulos anteriores + la Práctica DL-CT-05 (Módulo 9)
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
      mensajeError: "Incorrecto. Revisa de nuevo las barras de la gráfica para ubicar el punto más alto." },
    { id: 1,
      tituloDataset: "Rendimiento STEM",
      pregunta: "¿Qué equipo evaluado obtuvo el puntaje más alto en las pruebas prácticas de ProtoLab?",
      opciones: [
        { letra: "A", texto: "Equipo Alfa", correcta: false },
        { letra: "B", texto: "Equipo Beta", correcta: false },
        { letra: "C", texto: "Equipo Gamma", correcta: false },
        { letra: "D", texto: "Equipo Delta", correcta: true },
      ],
      mensajeExito: "¡Excelente! Consultaste los registros y determinaste correctamente al equipo líder.",
      mensajeError: "Incorrecto. Compara los valores de la tabla de registros para identificar al equipo con mayor puntaje." },
    { id: 2,
      tituloDataset: "Ventas de Makerspace",
      pregunta: "De acuerdo con el inventario actual, ¿cuál componente lidera la distribución en unidades?",
      opciones: [
        { letra: "A", texto: "Sensor ultrasónico", correcta: true },
        { letra: "B", texto: "Kit Arduino Uno", correcta: false },
        { letra: "C", texto: "Multímetro digital", correcta: false },
        { letra: "D", texto: "Módulos de prototipado básico", correcta: false },
      ],
      mensajeExito: "¡Muy bien! Identificaste el componente con mayor rotación en el inventario.",
      mensajeError: "Incorrecto. Revisa el listado en la tabla del Makerspace para encontrar el componente con más unidades." },
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
    { id: 4,
      tituloDataset: "DL-CT-01: Patrones y Frecuencias",
      pregunta: "En la práctica de distribución de frecuencias, ¿qué intervalo concentra la mayor densidad operativa?",
      opciones: [
        { letra: "A", texto: "Intervalo inicial de arranque (0-20%)", correcta: false },
        { letra: "B", texto: "Intervalo crítico de operación (40-60%)", correcta: true },
        { letra: "C", texto: "Intervalo de valle o reposo (80-100%)", correcta: false },
        { letra: "D", texto: "Intervalo intermedio sin variaciones", correcta: false },
      ],
      mensajeExito: "¡Excelente! Interpretaste correctamente el histograma de frecuencias de la práctica DL-CT-01.",
      mensajeError: "Incorrecto. Analiza la altura de las barras en el explorador para ubicar el intervalo con mayor densidad." },
    {id: 5,
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
    { id: 6,
      tituloDataset: "DL-CT-03: Detección de Outliers",
      pregunta: "Durante el análisis de tendencias históricas de la práctica DL-CT-03, ¿cómo impacta un valor atípico (outlier)?",
      opciones: [
        { letra: "A", texto: "Estabiliza automáticamente la varianza de la muestra", correcta: false },
        { letra: "B", texto: "Desvía significativamente los cálculos promedio si no se aísla", correcta: true },
        { letra: "C", texto: "Elimina la necesidad de graficar la serie temporal", correcta: false },
        { letra: "D", texto: "Duplica la velocidad de procesamiento del servidor", correcta: false },
      ],
      mensajeExito: "¡Correcto! Identificaste cómo los outliers afectan las métricas analíticas.",
      mensajeError: "Incorrecto. Analiza cómo un punto fuera de rango altera los cálculos generales." },
    { id: 7,
      tituloDataset: "DL-CT-04: Modelado Predictivo",
      pregunta: "En la última fase de validación de modelos, ¿qué indicador confirma la estabilidad del conjunto analizado?",
      opciones: [
        { letra: "A", texto: "Baja dispersión y convergencia en los residuos del modelo", correcta: true },
        { letra: "B", texto: "Saturación total de la memoria RAM del servidor", correcta: false },
        { letra: "C", texto: "Eliminación de todas las variables independientes", correcta: false },
        { letra: "D", texto: "Aumento descontrolado del margen de error", correcta: false },
      ],
      mensajeExito: "¡Fantástico! Concluiste con éxito todos los módulos y prácticas de DataLab.",
      mensajeError: "Incorrecto. Revisa los parámetros de estabilidad y residuos del modelo." },
    { id: 8,
      tituloDataset: dlCt05.titulo,
      pregunta: dlCt05.descripcion
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
    { id: 8, nombre: dlCt05.identificador, desc: "Práctica interactiva JSON", color: "text-blue-600" },
  ];

  const contenidoActual = secuenciaCurricula[pasoActivo] || secuenciaCurricula[0];
  const handleNextStep = () => {
    if (pasoActivo < secuenciaCurricula.length - 1) {
      setPasoActivo(prev => prev + 1);
      setRespuestaTecnica('');
    } else {
      router.push('/electrolab');
    }
  };

  const procesarEvaluacion = () => {
    if (!respuestaTecnica) {
      alert("Por favor selecciona una opción antes de evaluar.");
      return;
    } const opcionSeleccionada = contenidoActual.opciones?.find(op => op.letra === respuestaTecnica);
    const esCorrecto = opcionSeleccionada ? opcionSeleccionada.correcta : false;
    setFueExito(esCorrecto);
    if (esCorrecto) {
      setAciertos(prev => prev + 1);
      setPuntosXP(prev => prev + 100);
    }
    setModalAbierto(true);
  };
  const moverBloque = (index: number, dir: 'arriba' | 'abajo') => {
    const arr = [...bloquesUsuario];
    const destino = dir === 'arriba' ? index - 1 : index + 1;
    if (destino < 0 || destino >= arr.length) return;
    const temp = arr[index];
    arr[index] = arr[destino];
    arr[destino] = temp;
    setBloquesUsuario(arr);
  };
  return (  <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans">
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Módulo Activo:</span>
            <span className="text-sm font-extrabold text-cyan-600">{contenidoActual.tituloDataset}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Módulo #{pasoActivo + 1} de {secuenciaCurricula.length}
            </span>
          </div>
        </div>

        {/* SELECTOR SUPERIOR DE MÓDULOS (9 TARJETAS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {datasetsMock.map((ds) => (
            <button
              key={ds.id}
              onClick={() => {
                setPasoActivo(ds.id);
                setRespuestaTecnica('');
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

        {/* VISTA CONDICIONAL: CARGADO DEL JSON DL-CT-05 - ESTADÍSTICA Y OUTLIERS) */}
        {pasoActivo === 8 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-8 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">JSON: {dlCt05.identificador}</span>
                <h2 className="text-2xl font-black text-slate-900">{dlCt05.titulo}</h2>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Teórica Interactiva / Estadística</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {dlCt05.descripcion}
            </p>
            {/* Actividad 1: Ordenar Bloques (Flujo Analítico) */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                1. {dlCt05.actividades_interactivas[0].titulo}
              </h3>
              <p className="text-xs text-slate-500">{dlCt05.actividades_interactivas[0].instrucciones}</p>
              
              <div className="flex flex-col gap-2">
                {bloquesUsuario.map((b, idx) => (
                  <div key={b.id} className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                    <span>{idx + 1}. {b.texto}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => moverBloque(idx, 'arriba')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer font-bold">▲</button>
                      <button onClick={() => moverBloque(idx, 'abajo')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer font-bold">▼</button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const esCorrecto = bloquesUsuario[0].id === 'b1' &&
                                     bloquesUsuario[1].id === 'b2' &&
                                     bloquesUsuario[2].id === 'b3' &&
                                     bloquesUsuario[3].id === 'b4';
                  setResultadoOrden(esCorrecto);
                }}
                className="self-start px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase cursor-pointer mt-1"
              >
                Comprobar Orden
              </button>
              {resultadoOrden !== null && (
                <div className={`p-3 rounded-xl text-xs font-bold ${resultadoOrden ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {resultadoOrden ? dlCt05.actividades_interactivas[0].configuracion.retroalimentacion : "El orden lógico no es correcto. Recuerda que se inicia cargando los datos y se termina validando métricas."}
                </div>
              )}
            </div>
            {/* Actividad 2: Cálculo Guiado (Impacto de Outliers) */}
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                2. {dlCt05.actividades_interactivas[1].titulo}
              </h3>
              <p className="text-xs text-slate-500">{dlCt05.actividades_interactivas[1].instrucciones}</p>
              <p className="text-xs font-mono text-cyan-700 bg-cyan-50 p-2.5 rounded-lg border border-cyan-100">
                Fórmula: {dlCt05.actividades_interactivas[1].configuracion.formula_principal}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Paso 1: Suma total (200 + 300)</label>
                  <input
                    type="text"
                    placeholder="Ej. 500"
                    value={paso1Input}
                    onChange={(e) => setPaso1Input(e.target.value)}
                    className="p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Paso 2: Promedio final (Total / 4)</label>
                  <input
                    type="text"
                    placeholder="Ej. 125"
                    value={paso2Input}
                    onChange={(e) => setPaso2Input(e.target.value)}
                    className="p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const paso1Ok = paso1Input.trim() === '500';
                  const paso2Ok = paso2Input.trim() === '125';
                  setResultadoCalculo(paso1Ok && paso2Ok);
                }}
                className="self-start px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase cursor-pointer mt-1"
              >
                Comprobar Cálculos
              </button>

              {resultadoCalculo !== null && (
                <div className={`p-3 rounded-xl text-xs font-bold ${resultadoCalculo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {resultadoCalculo ? "¡Cálculos correctos! El promedio se eleva a 125 debido al arrastre del valor atípico." : "Revisa los valores numéricos (Suma base 200 + Outlier 300 = 500; entre 4 muestras = 125)."}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => router.push('/electrolab')}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <span>Finalizar Práctica y Saltar a ElectroLab</span> <IconArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* ================= VISTA NORMAL (MÓDULOS 0 AL 7) ============= */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-slate-900 font-bold text-sm mb-4 flex items-center gap-2">
                  <IconTable size={18} /> Explorador de Registros
                </h3>
                <DatasetTable datasetId={contenidoActual.id} filtroCategoria={filtroTabla} />
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-slate-900 font-bold text-sm mb-4 flex items-center gap-2">
                  <IconChartLine size={18} /> Visualización Dinámica
                </h3>
                <div className="w-full min-h-[225px] flex items-center justify-center">
                  <DataChart datasetId={contenidoActual.id} tipoGrafica={tipoGrafica} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                <h3 className="text-slate-800 font-bold text-sm">{contenidoActual.pregunta}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contenidoActual.opciones?.map((op, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRespuestaTecnica(op.letra)}
                      className={`p-4 rounded-xl border text-left flex items-start gap-3 cursor-pointer ${
                        respuestaTecnica === op.letra ? 'bg-cyan-50 border-cyan-300 font-semibold' : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs">{op.letra}</span>
                      <span className="text-xs">{op.texto}</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={procesarEvaluacion}
                  disabled={!respuestaTecnica}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Evaluar Respuesta
                </button>
              </div>
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <h4 className="text-lg font-black text-slate-900">DataLab Master</h4>
                <button 
                  onClick={handleNextStep}
                  className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Siguiente Módulo</span> <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

      </main>
      <DataLabResults 
        isOpen={modalAbierto} 
        esExito={fueExito}
        mensajeExito={contenidoActual.mensajeExito || "¡Correcto!"}
        mensajeError={contenidoActual.mensajeError || "Incorrecto."}
        onReintentar={() => setModalAbierto(false)}
        onAvanzar={() => {
          setModalAbierto(false);
          setRespuestaTecnica('');
          handleNextStep();
        }}
      />
    </div>
  );
};