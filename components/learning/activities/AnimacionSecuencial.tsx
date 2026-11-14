"use client";

import { useEffect, useState } from "react";
import type { AnimacionSecuencial as AnimacionSecuencialType } from "../../../lib/content/types";

interface Props { actividad: AnimacionSecuencialType }

export function AnimacionSecuencial({ actividad }: Props) {
  const { configuracion } = actividad;
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = configuracion.pasos[stepIndex];
  const isLast = stepIndex === configuracion.pasos.length - 1;

  useEffect(() => {
    if (configuracion.reproduccion.inicio_automatico) setPlaying(true);
  }, [configuracion.reproduccion.inicio_automatico]);

  useEffect(() => {
    if (!playing || !step) return;
    const timer = window.setTimeout(() => {
      if (isLast) {
        if (configuracion.reproduccion.repetir) setStepIndex(0);
        else setPlaying(false);
      } else setStepIndex((current) => current + 1);
    }, step.duracion_ms);
    return () => window.clearTimeout(timer);
  }, [playing, step, stepIndex, isLast, configuracion.reproduccion.repetir]);

  const hasControl = (name: string) => configuracion.reproduccion.controles.includes(name);

  const goTo = (index: number) => {
    setPlaying(false);
    setStepIndex(Math.max(0, Math.min(configuracion.pasos.length - 1, index)));
  };

  return (
    <section className="pl-activity-card" aria-label={actividad.titulo}>
      <div className="pl-activity-heading">
        <div>
          <p className="pl-eyebrow">Exploración visual</p>
          <h3>{actividad.titulo}</h3>
          <p className="pl-muted">{actividad.instrucciones}</p>
        </div>
        <span className="pl-step-count">{stepIndex + 1} / {configuracion.pasos.length}</span>
      </div>

      <div className="pl-animation-stage" aria-label={`Escena: ${step.titulo}`}>
        {configuracion.escenario === "led_emision_luz" ? (
          <LedEmissionScene state={step.estado_visual} />
        ) : configuracion.escenario === "circuito_led_serie" ? (
          <LedCircuitScene state={step.estado_visual} />
        ) : (
          <div className="pl-scene-fallback">
            <span aria-hidden="true">✦</span>
            <strong>{step.estado_visual.replaceAll("_", " ")}</strong>
            <small>Escenario visual pendiente de registrar en la aplicación.</small>
          </div>
        )}
      </div>

      <div className="pl-animation-copy" aria-live="polite" aria-atomic="true">
        <span className="pl-step-label">Paso {step.orden}</span>
        <h4>{step.titulo}</h4>
        <p>{step.explicacion}</p>
      </div>

      <div className="pl-progress" role="progressbar" aria-label="Progreso de la animación" aria-valuemin={1} aria-valuemax={configuracion.pasos.length} aria-valuenow={stepIndex + 1}>
        <span style={{ width: `${((stepIndex + 1) / configuracion.pasos.length) * 100}%` }} />
      </div>
      <div className="pl-controls">
        {hasControl("reiniciar") && <button type="button" className="pl-button pl-button-quiet" onClick={() => { goTo(0); }}>Reiniciar</button>}
        <div className="pl-control-group">
          {hasControl("anterior") && <button type="button" className="pl-button pl-button-quiet" onClick={() => goTo(stepIndex - 1)} disabled={stepIndex === 0} aria-label="Paso anterior">Anterior</button>}
          {playing && hasControl("pausar") ? (
            <button type="button" className="pl-button pl-button-primary" onClick={() => setPlaying(false)}>Pausar</button>
          ) : hasControl("reproducir") ? (
            <button type="button" className="pl-button pl-button-primary" onClick={() => { if (isLast) setStepIndex(0); setPlaying(true); }}>{isLast ? "Repetir" : "Reproducir"}</button>
          ) : null}
          {hasControl("siguiente") && <button type="button" className="pl-button pl-button-quiet" onClick={() => goTo(stepIndex + 1)} disabled={isLast} aria-label="Paso siguiente">Siguiente</button>}
        </div>
      </div>
    </section>
  );
}

function LedEmissionScene({ state }: { state: string }) {
  const powered = state !== "sin_polarizacion";
  const emitting = state === "emision_fotones";
  const recombining = state === "recombinacion" || emitting;
  return (
    <svg viewBox="0 0 620 250" className="pl-scene-svg" role="img" aria-label="Representación de una unión semiconductora dentro de un LED">
      <defs>
        <linearGradient id="led-pn" x1="0" x2="1"><stop offset="0" stopColor="#93c5fd"/><stop offset="1" stopColor="#c4b5fd"/></linearGradient>
        <filter id="led-glow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <text x="150" y="34" textAnchor="middle" className="pl-svg-label">Región tipo P</text>
      <text x="470" y="34" textAnchor="middle" className="pl-svg-label">Región tipo N</text>
      <rect x="74" y="58" width="472" height="142" rx="18" fill="url(#led-pn)" opacity=".34" stroke="#64748b" strokeWidth="1.5"/>
      <rect x="294" y="58" width="32" height="142" fill="#fbbf24" opacity=".35"/>
      {Array.from({ length: 5 }).map((_, i) => <g key={`hole-${i}`}><circle cx={130 + i * 32} cy={102 + (i % 2) * 42} r="9" fill="#fff" stroke="#2563eb" strokeWidth="2"/><text x={130 + i * 32} y={106 + (i % 2) * 42} textAnchor="middle" fontSize="10" fill="#1d4ed8">+</text></g>)}
      {Array.from({ length: 5 }).map((_, i) => <g key={`electron-${i}`}><circle cx={365 + i * 32} cy={102 + (i % 2) * 42} r="9" fill="#1e40af"/><text x={365 + i * 32} y={106 + (i % 2) * 42} textAnchor="middle" fontSize="10" fill="white">−</text></g>)}
      {powered && <g className="pl-electron-flow"><path d="M 245 132 L 285 132" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 5"/><path d="M 276 124 L 286 132 L 276 140" fill="none" stroke="#2563eb" strokeWidth="3"/></g>}
      {recombining && <g><circle cx="310" cy="130" r="21" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/><text x="310" y="135" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400e">e⁻ + h⁺</text></g>}
      {emitting && <g className="pl-photon-rays" filter="url(#led-glow)" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"><path d="M310 56 V20"/><path d="M285 66 L264 36"/><path d="M335 66 L356 36"/><path d="M310 202 V232"/><path d="M280 190 L257 215"/><path d="M340 190 L363 215"/></g>}
      <text x="310" y="222" textAnchor="middle" className="pl-svg-caption">{emitting ? "Energía liberada en forma de luz" : recombining ? "Unión semiconductora" : powered ? "Se establece el paso de corriente" : "Sin corriente"}</text>
    </svg>
  );
}

function LedCircuitScene({ state }: { state: string }) {
  const closed = state !== "circuito_abierto";
  const flowing = state === "corriente_convencional";
  return (
    <svg viewBox="0 0 620 260" className="pl-scene-svg" role="img" aria-label="Circuito en serie con batería, resistencia y LED">
      <g fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 100 115 V 76 H 155"/><path d="M 175 76 H 205"/><path d="M 295 76 H 420"/>
        <path d="M 475 76 H 520 V 195 H 100 V 150"/>
        {closed && <path d="M 155 76 H 175"/>}
      </g>
      <g stroke="#334155" strokeWidth="4" strokeLinecap="round"><path d="M 77 115 H 123"/><path d="M 87 150 H 113"/></g>
      <text x="145" y="113" className="pl-svg-caption">+</text><text x="130" y="154" className="pl-svg-caption">−</text>
      <text x="100" y="220" textAnchor="middle" className="pl-svg-caption">Batería</text>
      <rect x="205" y="57" width="90" height="38" rx="5" fill="#fef3c7" stroke="#b45309" strokeWidth="3"/>
      <path d="M 213 76 L 225 64 L 237 88 L 249 64 L 261 88 L 273 64 L 285 76" fill="none" stroke="#b45309" strokeWidth="2"/>
      <text x="250" y="43" textAnchor="middle" className="pl-svg-caption">Resistencia</text>
      <path d="M 420 55 L 475 76 L 420 97 Z" fill={flowing ? "#ef4444" : "#fecaca"} stroke="#b91c1c" strokeWidth="3"/>
      <path d="M 475 55 V 97" stroke="#b91c1c" strokeWidth="4"/>
      <text x="450" y="43" textAnchor="middle" className="pl-svg-caption">LED</text>
      {flowing && <g className="pl-current-dots"><circle r="5" fill="#0d9488"><animateMotion dur="3s" repeatCount="indefinite" path="M 100 115 V 76 H 205 H 295 H 420 H 520 V 195 H 100 V 150"/></circle><circle r="5" fill="#0d9488"><animateMotion dur="3s" begin="-1.5s" repeatCount="indefinite" path="M 100 115 V 76 H 205 H 295 H 420 H 520 V 195 H 100 V 150"/></circle></g>}
      <path d="M 440 40 L 465 17 M 455 48 L 480 25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity={flowing ? 1 : 0}/>
      <text x="310" y="232" textAnchor="middle" className="pl-svg-caption">{flowing ? "Recorrido de la corriente convencional" : closed ? "Circuito cerrado: existe un camino completo" : "Circuito abierto: la corriente no circula"}</text>
    </svg>
  );
}
