"use client";

import { useState } from "react";
import type { CalculoGuiado as CalculoGuiadoType } from "../../../lib/content/types";

interface Props { actividad: CalculoGuiadoType }

export function CalculoGuiado({ actividad }: Props) {
  const config = actividad.configuracion;
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const step = config.pasos[stepIndex];
  const numericValue = Number(values[step.id]);
  const isCorrect = Number.isFinite(numericValue) && Math.abs(numericValue - step.respuesta_esperada) <= step.tolerancia_absoluta;
  const allCorrect = config.pasos.every((item) => verified[item.id]);

  const check = () => {
    setHasChecked(true);
    if (isCorrect) {
      setVerified((current) => ({ ...current, [step.id]: true }));
      setShowExplanation(true);
    } else setShowExplanation(false);
  };

  const next = () => {
    setStepIndex((current) => Math.min(config.pasos.length - 1, current + 1));
    setShowHint(false);
    setShowExplanation(false);
    setHasChecked(false);
  };

  const reset = () => { setStepIndex(0); setValues({}); setVerified({}); setShowHint(false); setShowExplanation(false); setHasChecked(false); };

  return (
    <section className="pl-activity-card" aria-label={actividad.titulo}>
      <div className="pl-activity-heading">
        <div><p className="pl-eyebrow">Reto de cálculo</p><h3>{actividad.titulo}</h3><p className="pl-muted">{actividad.instrucciones}</p></div>
        <span className="pl-step-count">Paso {stepIndex + 1} / {config.pasos.length}</span>
      </div>
      <div className="pl-data-grid">
  {Array.isArray(config?.datos) && config.datos.map((item: any, index: number) => (
    <div className="pl-data-tile" key={item.id || index}>
      <span>{item.etiqueta || item.variable}</span>
      <strong>{item.valor} {item.unidad}</strong>
    </div>
  ))}
</div>
      <div className="pl-formula-box"><span>Fórmula principal</span><strong>{config.formula_principal}</strong><small>{config.nota_unidades}</small></div>
      <div className="pl-step-progress" aria-label="Pasos del cálculo">
        {config.pasos.map((item, index) => <span key={item.id} className={verified[item.id] ? "is-done" : index === stepIndex ? "is-current" : ""}>{verified[item.id] ? "✓" : index + 1}</span>)}
      </div>
      <div className="pl-calculation-prompt">
        <p className="pl-eyebrow">Resuelve el paso {stepIndex + 1}</p>
        <h4>{step.consigna}</h4>
        <div className="pl-calculation-formula">{step.formula}</div>
        <label className="pl-field-label" htmlFor={`${actividad.id}-${step.id}`}>Tu respuesta ({step.unidad})</label>
        <div className="pl-answer-field">
          <input id={`${actividad.id}-${step.id}`} type="number" inputMode="decimal" step="any" value={values[step.id] ?? ""} onChange={(event) => { setValues((current) => ({ ...current, [step.id]: event.target.value })); setVerified((current) => ({ ...current, [step.id]: false })); setShowExplanation(false); setHasChecked(false); }} placeholder="Escribe un valor" aria-describedby={`${actividad.id}-${step.id}-unit`}/>
          <span id={`${actividad.id}-${step.id}-unit`}>{step.unidad}</span>
        </div>
        <div className="pl-controls pl-controls-start">
          <button type="button" className="pl-button pl-button-quiet" onClick={() => setShowHint((value) => !value)}>{showHint ? "Ocultar pista" : "Mostrar pista"}</button>
          <button type="button" className="pl-button pl-button-primary" onClick={check} disabled={values[step.id] === undefined || values[step.id].trim() === ""}>Comprobar</button>
        </div>
        {showHint && <div className="pl-hint" role="note">Pista: {step.pista}</div>}
        {showExplanation && <div className="pl-feedback is-correct" role="status">{step.explicacion}</div>}
        {hasChecked && !isCorrect && <p className="pl-inline-error" role="status">{config.retroalimentacion.incorrecta}</p>}
      </div>
      <div className="pl-controls">
        <button type="button" className="pl-button pl-button-quiet" onClick={reset}>Reiniciar cálculo</button>
        {stepIndex < config.pasos.length - 1 ? (
          <button type="button" className="pl-button pl-button-primary" onClick={next} disabled={!verified[step.id]}>Siguiente paso</button>
        ) : <span className="pl-completion" role="status">{allCorrect ? config.retroalimentacion.correcta : "Completa todos los pasos para terminar."}</span>}
      </div>
    </section>
  );
}
