"use client";

import { useEffect, useState } from "react";
import type { CompletarEnunciados as CompletarEnunciadosType } from "../../../lib/content/types";

interface Props { actividad: CompletarEnunciadosType }

export function CompletarEnunciados({ actividad }: Props) {
  const config = actividad.configuracion;
  const [blocks, setBlocks] = useState(config.banco_bloques);
  useEffect(() => {
    if (!config.mezclar_opciones) return;
    setBlocks((current) => {
      const next = [...current];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    });
  }, [config.mezclar_opciones]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [used, setUsed] = useState(false);

  const blanks = config.enunciados.flatMap((sentence) => sentence.segmentos.filter((segment) => segment.tipo === "espacio").map((segment) => segment as Extract<(typeof sentence.segmentos)[number], { tipo: "espacio" }>));
  const usedIds = new Set(Object.values(answers));
  const blockMap = new Map(config.banco_bloques.map((block) => [block.id, block]));
  const isComplete = blanks.every((blank) => Boolean(answers[blank.id]));

  const selectBlock = (id: string) => {
    if (usedIds.has(id) && answers[Object.keys(answers).find((key) => answers[key] === id) ?? ""] === id) {
      setAnswers((current) => {
        const next = { ...current };
        Object.keys(next).forEach((key) => { if (next[key] === id) delete next[key]; });
        return next;
      });
      setSelectedBlock(null);
    } else setSelectedBlock(id);
    setChecked(false);
    setShowFeedback(false);
  };

  const fillBlank = (blankId: string) => {
    if (!selectedBlock) {
      if (answers[blankId]) {
        setAnswers((current) => { const next = { ...current }; delete next[blankId]; return next; });
        setChecked(false);
        setShowFeedback(false);
      }
      return;
    }
    setAnswers((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => { if (next[key] === selectedBlock) delete next[key]; });
      next[blankId] = selectedBlock;
      return next;
    });
    setSelectedBlock(null);
    setChecked(false);
    setShowFeedback(false);
  };

  const verify = () => {
    setUsed(true);
    setChecked(blanks.every((blank) => answers[blank.id] === blank.respuesta));
    setShowFeedback(true);
  };

  const reset = () => { setAnswers({}); setSelectedBlock(null); setChecked(false); setShowFeedback(false); setUsed(false); };

  return (
    <section className="pl-activity-card" aria-label={actividad.titulo}>
      <div className="pl-activity-heading">
        <div><p className="pl-eyebrow">Completa la explicación</p><h3>{actividad.titulo}</h3><p className="pl-muted">{actividad.instrucciones}</p></div>
        <span className="pl-step-count">{Object.keys(answers).length}/{blanks.length}</span>
      </div>
      <p className="pl-helper">Selecciona un bloque y después el espacio donde debe colocarse. También puedes tocar un espacio ocupado para quitar su respuesta.</p>
      <div className="pl-sentence-list">
        {config.enunciados.map((sentence) => (
          <p className="pl-sentence" key={sentence.id}>
            {sentence.segmentos.map((segment, index) => segment.tipo === "texto" ? (
              <span key={`${sentence.id}-${index}`}>{segment.contenido}</span>
            ) : (
              <button type="button" key={segment.id} className={`pl-blank ${answers[segment.id] ? "is-filled" : ""} ${selectedBlock ? "can-fill" : ""}`} onClick={() => fillBlank(segment.id)} aria-label={`Espacio de respuesta ${segment.id}: ${answers[segment.id] ? blockMap.get(answers[segment.id])?.texto : "vacío"}`}>
                {answers[segment.id] ? blockMap.get(answers[segment.id])?.texto : "Elegir bloque"}
              </button>
            ))}
          </p>
        ))}
      </div>
      <h4 className="pl-subheading">Banco de bloques</h4>
      <div className="pl-word-bank">
        {blocks.map((block) => {
          const isUsed = usedIds.has(block.id);
          return <button type="button" key={block.id} className={`pl-word-chip ${selectedBlock === block.id ? "is-selected" : ""} ${isUsed ? "is-used" : ""}`} onClick={() => selectBlock(block.id)} aria-pressed={selectedBlock === block.id} disabled={isUsed && selectedBlock !== block.id}>{block.texto}</button>;
        })}
      </div>
      <div className="pl-controls">
        <button type="button" className="pl-button pl-button-quiet" onClick={reset}>Reiniciar</button>
        <button type="button" className="pl-button pl-button-primary" onClick={verify} disabled={!isComplete}>Comprobar respuestas</button>
      </div>
      {showFeedback && <div className={`pl-feedback ${checked ? "is-correct" : "is-incorrect"}`} role="status">{checked ? config.retroalimentacion.correcta : config.retroalimentacion.incorrecta}</div>}
      {showFeedback && !checked && <div className="pl-sentence-feedback">{config.enunciados.filter((sentence) => sentence.segmentos.some((segment) => segment.tipo === "espacio" && answers[segment.id] !== segment.respuesta)).map((sentence) => <p key={sentence.id}>{sentence.retroalimentacion}</p>)}</div>}
      {used && !checked && <p className="pl-helper">Corrige los espacios señalados y vuelve a comprobar.</p>}
    </section>
  );
}
