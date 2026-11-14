'use client';

import React, { useState } from 'react';
import { practicasRoboLab, type Orientation } from "@/app/(panel)/robolab/robolab-data";import RoboLabGrid from '@/components/robolab/RoboLabGrid';
import ClaseTeorica from "@/components/laboratorios/ClaseTeorica";
import claseTeorica from "@/content/robolab/RB-CT-02-sensores-decisiones.json";
import segundaClase from "@/content/robolab/RB-CT-03-cinematica-velocidad.json";

type CommandType = 'AVANZAR' | 'IZQUIERDA' | 'DERECHA';

interface CommandItem {
  id: string;
  type: CommandType;
  label: string;
}

const ORIENTATIONS: Orientation[] = ['Norte', 'Este', 'Sur', 'Oeste'];
const clasesTeoricas = [claseTeorica, segundaClase].sort(
  (a, b) => a.orden - b.orden
);

type RoboLabScreenProps = {
  onApproved?: (score: number) => void;
};

export default function RoboLabScreen({ onApproved }: RoboLabScreenProps) {
  const practica = practicasRoboLab[0];
  const { plantilla_id, metadatos, contenido } = practica;

  const [indiceClase, setIndiceClase] = useState(0);
  const [clasesVistas, setClasesVistas] = useState<string[]>([]);

  const [robotPos, setRobotPos] = useState(contenido.initial_state);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusText, setStatusText] = useState("Listo");
  const [statusTitle, setStatusTitle] = useState("Esperando comandos");
  const [statusMessage, setStatusMessage] = useState(
    "Agrega instrucciones y presiona 'Ejecutar simulación'."
  );
  const [collisions, setCollisions] = useState(0);
  const [goalReached, setGoalReached] = useState(false);

  const claseActual = onApproved ? undefined : clasesTeoricas[indiceClase];
  const esUltimaClase = indiceClase === clasesTeoricas.length - 1;

  function terminarClase() {
    if (!claseActual) return;

    setClasesVistas((vistas) =>
      vistas.includes(claseActual.identificador)
        ? vistas
        : [...vistas, claseActual.identificador]
    );
    setIndiceClase(indiceClase + 1);
  }

  if (plantilla_id !== "robot-navigation-2d") {
    return (
      <div className="p-8 text-red-600">
        Error: Plantilla no compatible o identificador inválido.
      </div>
    );
  }

  const addCommand = (type: CommandType) => {
    if (isExecuting || commands.length >= contenido.max_moves) return;

    const labels: Record<CommandType, string> = {
      AVANZAR: 'Avanzar (+1)',
      IZQUIERDA: 'Girar Izquierda (-90°)',
      DERECHA: 'Girar Derecha (+90°)',
    };

    setCommands((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, type, label: labels[type] },
    ]);
  };

  const removeCommand = (id: string) => {
    if (isExecuting) return;
    setCommands((prev) => prev.filter((cmd) => cmd.id !== id));
  };

  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
  };

    const resetSimulation = () => {
    if (isExecuting) return;

    setRobotPos(contenido.initial_state);
    setStatusText("Listo");
    setStatusTitle("Esperando comandos");
    setStatusMessage("Agrega instrucciones y presiona 'Ejecutar simulación'.");
    setGoalReached(false);
  };

  const getOrientationDegrees = (ori: Orientation) => {
    const map: Record<Orientation, string> = {
      Norte: '90°',
      Este: '0°',
      Sur: '270°',
      Oeste: '180°',
    };
    return map[ori];
  };

    const runSimulation = async () => {
    if (isExecuting || commands.length === 0) return;

    setIsExecuting(true);
    setGoalReached(false);
    setStatusText("Ejecutando");
    setStatusTitle("Ejecutando secuencia");
    setStatusMessage("Botty está recorriendo la ruta programada...");

    let { x, y, orientation } = contenido.initial_state;
    setRobotPos({ x, y, orientation });

    for (const [indice, comando] of commands.entries()) {
      await new Promise<void>((resolve) => setTimeout(resolve, 480));

      if (comando.type === "AVANZAR") {
        const nextX = x + (orientation === "Este" ? 1 : orientation === "Oeste" ? -1 : 0);
        const nextY = y + (orientation === "Norte" ? 1 : orientation === "Sur" ? -1 : 0);

        if (
          nextX < 1 ||
          nextX > contenido.grid_dimensions.cols ||
          nextY < 1 ||
          nextY > contenido.grid_dimensions.rows
        ) {
          setCollisions((total) => total + 1);
          setStatusText("Error límite");
          setStatusTitle("¡Fuera de límites!");
          setStatusMessage("Botty salió de la cuadrícula. Ajusta la secuencia.");
          setIsExecuting(false);
          return;
        }

        if (contenido.obstacles.some((obs) => obs.x === nextX && obs.y === nextY)) {
          setCollisions((total) => total + 1);
          setStatusText("Colisión");
          setStatusTitle("¡Impacto con obstáculo!");
          setStatusMessage(`Colisión en (${nextX}, ${nextY}). Ajusta la secuencia.`);
          setIsExecuting(false);
          return;
        }

        x = nextX;
        y = nextY;
      } else {
        const posicion = ORIENTATIONS.indexOf(orientation);
        const giro = comando.type === "IZQUIERDA" ? 3 : 1;
        orientation = ORIENTATIONS[(posicion + giro) % ORIENTATIONS.length];
      }

      setRobotPos({ x, y, orientation });

      if (x === contenido.goal.x && y === contenido.goal.y) {
        const puntaje = Math.min(
          100,
          Math.round((contenido.optimal_moves / (indice + 1)) * 100)
        );

        setGoalReached(true);
        setStatusText("Completado");
        setStatusTitle("🎉 ¡MISIÓN CUMPLIDA!");
        setStatusMessage("¡Felicidades! Botty alcanzó el punto de extracción.");
        setIsExecuting(false);

        onApproved?.(puntaje);
        return;
      }
    }

    setStatusText("Detenido");
    setStatusTitle("Secuencia finalizada");
    setStatusMessage("El algoritmo terminó, pero Botty no llegó a la meta.");
    setIsExecuting(false);
  };

  const efficiency =
    commands.length === 0
      ? 100
      : Math.min(100, Math.round((contenido.optimal_moves / commands.length) * 100));

  const progressPercent = goalReached
    ? 100
    : Math.min(90, Math.round((commands.length / contenido.optimal_moves) * 100));

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 text-slate-800 relative">
      {/* MODAL / ANIMACIÓN DE FELICIDADES CUANDO LLEGA A LA META */}
      {goalReached && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-indigo-100 text-center space-y-4 animate-scaleUp relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-100 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ¡Nivel Superado!
              </span>
              <h2 className="text-2xl font-black text-slate-800 pt-2">
                ¡Felicidades, Robot Master!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Has programado a Botty a la perfección hasta la meta 🏁 con una eficiencia del <strong className="text-emerald-600">{efficiency}%</strong>. Has ganado <strong className="text-amber-500">+{metadatos.recompensa_xp} XP</strong>.
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={resetSimulation}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl transition"
              >
                Jugar de nuevo ↻
              </button>
              <button
                onClick={() => setGoalReached(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-blue-200 transition"
              >
                Ver tablero ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* BANNER SUPERIOR AZUL */}
        <header className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-6 md:p-8 text-white shadow-lg shadow-blue-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
                ROBOLAB
              </span>
              <span className="bg-amber-300 text-slate-900 px-3 py-1 rounded-full font-semibold">
                {metadatos.practica_num}
              </span>
              <span className="bg-white text-blue-700 px-3 py-1 rounded-full font-semibold">
                {metadatos.nivel}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {metadatos.titulo_banner}
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              {metadatos.descripcion_banner}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button className="bg-white text-slate-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2">
              <span>Prácticas (3/5)</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </header>
{claseActual ? (
  <section aria-label="Clases teóricas de RoboLab" className="space-y-4">
    <p aria-live="polite" className="text-sm font-semibold text-slate-700">
      Clase {indiceClase + 1} de {clasesTeoricas.length}
      {" · "}
      {clasesVistas.length} de {clasesTeoricas.length} vistas
    </p>

    <ol className="flex flex-wrap gap-2" aria-label="Avance de las clases">
      {clasesTeoricas.map((clase, indice) => {
        const vista = clasesVistas.includes(clase.identificador);

        return (
          <li key={clase.identificador}>
            <button
              type="button"
              disabled={indice !== indiceClase && !vista}
              aria-current={indice === indiceClase ? "step" : undefined}
              onClick={() => setIndiceClase(indice)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
            >
              Clase {indice + 1}
              {vista && " · Vista"}
            </button>
          </li>
        );
      })}
    </ol>

    

    <button
      type="button"
      onClick={terminarClase}
      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
    >
      {esUltimaClase
        ? "Marcar como vista e ir a la práctica"
        : "Marcar como vista y continuar"}
    </button>
  </section>
) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    #
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">
                      Matriz de Navegación 6×6
                    </h2>
                    <p className="text-xs text-slate-400">
                      Coordenadas activas X / Y con detección cinemática en tiempo real
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-lg text-xs text-slate-500">
                  Sensores ultrasónicos:{' '}
                  <strong className="text-slate-700">Activos</strong>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <RoboLabGrid
                  dimensions={contenido.grid_dimensions}
                  robotPos={robotPos}
                  goal={contenido.goal}
                  obstacles={contenido.obstacles}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Posición actual</span>
                  <span className="text-base font-bold text-blue-600">
                    ({robotPos.x}, {robotPos.y})
                  </span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Orientación</span>
                  <span className="text-base font-bold text-slate-700">
                    {robotPos.orientation} ({getOrientationDegrees(robotPos.orientation)})
                  </span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Movimientos</span>
                  <span className="text-base font-bold text-slate-700">
                    {commands.length}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {contenido.max_moves} máx
                    </span>
                  </span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Estado</span>
                  <span
                    className={`text-base font-bold flex items-center gap-1.5 ${
                      goalReached
                        ? 'text-emerald-600'
                        : statusText === 'Colisión' || statusText === 'Error límite'
                        ? 'text-rose-600'
                        : 'text-teal-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current inline-block" />
                    {statusText}
                  </span>
                </div>
              </div>
            </section>

            {/* Misión de aprendizaje */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                ✓
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600">
                    MISIÓN DE APRENDIZAJE
                  </span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    Recompensa: +{metadatos.recompensa_xp} XP
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  {metadatos.mision_titulo}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {metadatos.mision_descripcion}
                </p>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bloques de control */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Bloques de Control</h2>
                  <p className="text-xs text-slate-400">
                    Haz clic para apilar instrucciones
                  </p>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                  Modo Secuencial
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => addCommand('AVANZAR')}
                  disabled={isExecuting || commands.length >= contenido.max_moves}
                  className="bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-blue-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <span className="text-lg font-bold">↑</span>
                  <span className="text-xs font-bold">Avanzar</span>
                  <span className="text-[10px] text-blue-500">(+1 celda)</span>
                </button>

                <button
                  onClick={() => addCommand('IZQUIERDA')}
                  disabled={isExecuting || commands.length >= contenido.max_moves}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <span className="text-lg font-bold">↺</span>
                  <span className="text-xs font-bold">Girar Izq.</span>
                  <span className="text-[10px] text-slate-400">(-90°)</span>
                </button>

                <button
                  onClick={() => addCommand('DERECHA')}
                  disabled={isExecuting || commands.length >= contenido.max_moves}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition disabled:opacity-50"
                >
                  <span className="text-lg font-bold">↻</span>
                  <span className="text-xs font-bold">Girar Der.</span>
                  <span className="text-[10px] text-slate-400">(+90°)</span>
                </button>
              </div>
            </section>

            {/* Secuencia de ejecución */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 text-base">Secuencia de Ejecución</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                    {commands.length} pasos
                  </span>
                  {commands.length > 0 && (
                    <button
                      onClick={clearCommands}
                      disabled={isExecuting}
                      className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                    >
                      Borrar todo
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-[170px] max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {commands.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-4">
                    La pila está vacía. Selecciona bloques arriba para programar a Botty.
                  </div>
                ) : (
                  commands.map((cmd, idx) => (
                    <div
                      key={cmd.id}
                      className="flex items-center justify-between bg-slate-50/90 border border-slate-200/70 px-3 py-2 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-600 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700">{cmd.label}</span>
                      </div>
                      <button
                        onClick={() => removeCommand(cmd.id)}
                        disabled={isExecuting}
                        className="text-slate-400 hover:text-rose-500 px-1.5 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={runSimulation}
                  disabled={isExecuting || commands.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-sm shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>▶</span>
                  <span>{isExecuting ? 'Ejecutando...' : 'Ejecutar simulación'}</span>
                </button>

                <button
                  onClick={resetSimulation}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>↻</span>
                  <span>Reiniciar</span>
                </button>
              </div>

              {/* BANNER DE ESTADO MEJORADO CON TEXTO MÁS OSCURO Y VISIBLE */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5 shadow-sm">
                <span className="text-blue-600 font-bold text-sm mt-0.5">ℹ️</span>
                <div className="space-y-0.5">
                  <strong className="text-blue-900 block font-bold text-sm">
                    {statusTitle}
                  </strong>
                  <span className="text-slate-700 font-medium leading-relaxed block">
                    {statusMessage}
                  </span>
                </div>
              </div>
            </section>

            {/* Telemetría */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="font-bold text-slate-800 text-base">Telemetría de la Práctica</h2>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Colisiones</span>
                  <span className="text-lg font-bold text-slate-800">{collisions}</span>
                  <span className="text-[10px] text-slate-400 block">Tolerancia: 0</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Eficiencia ruta</span>
                  <span className="text-lg font-bold text-teal-600">{efficiency}%</span>
                  <span className="text-[10px] text-slate-400 block">
                    Óptimo: {contenido.optimal_moves} pasos
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Sensor de Meta</span>
                  <span
                    className={`text-sm font-bold block mt-0.5 ${
                      goalReached ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {goalReached ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Llegada a ({contenido.goal.x},{contenido.goal.y})
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-500">Progreso del algoritmo</span>
                  <span className="font-bold text-blue-600">{progressPercent}% completado</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
)}
      </div>
    </div>
  );
}