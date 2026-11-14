"use client";

import { useEffect, useState } from "react";
import type { OrdenarBloques as OrdenarBloquesType } from "../../../lib/content/types";

interface Props { actividad: OrdenarBloquesType }

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function OrdenarBloques({ actividad }: Props) {
  const config = actividad.configuracion;
  const [order, setOrder] = useState(() => config.bloques.map((block) => block.id));
  const [checked, setChecked] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (config.mezclar_al_cargar) setOrder((current) => shuffle(current));
  }, [config.mezclar_al_cargar]);

  const move = (index: number, direction: -1 | 1) => {
    setOrder((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setChecked(false);
  };

  const verify = () => {
    setAttempted(true);
    setChecked(order.every((id, index) => id === config.orden_correcto[index]));
  };

  const reset = () => {
    setOrder(config.mezclar_al_cargar ? shuffle(config.bloques.map((block) => block.id)) : config.bloques.map((block) => block.id));
    setChecked(false);
    setAttempted(false);
  };

  const blockById = new Map(config.bloques.map((block) => [block.id, block]));
  const complete = order.every((id, index) => id === config.orden_correcto[index]);

  return (
    <section className="pl-activity-card" aria-label={actividad.titulo}>
      <div className="pl-activity-heading">
        <div><p className="pl-eyebrow">Rompecabezas</p><h3>{actividad.titulo}</h3><p className="pl-muted">{actividad.instrucciones}</p></div>
        <span className="pl-step-count">{order.length} bloques</span>
      </div>
      <p className="pl-helper">Ordena los bloques con los controles. También puedes usar los botones con teclado; no es necesario arrastrarlos.</p>
      <ol className="pl-block-list" aria-label="Bloques ordenables">
        {order.map((id, index) => {
          const block = blockById.get(id);
          if (!block) return null;
          return (
            <li className="pl-sort-row" key={id}>
              <span className="pl-sort-number">{index + 1}</span>
              <span className="pl-sort-text">{block.texto}</span>
              <span className="pl-sort-controls">
                <button type="button" className="pl-icon-button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${block.texto} hacia arriba`}>↑</button>
                <button type="button" className="pl-icon-button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`Mover ${block.texto} hacia abajo`}>↓</button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="pl-controls">
        <button type="button" className="pl-button pl-button-quiet" onClick={reset}>Reiniciar</button>
        <button type="button" className="pl-button pl-button-primary" onClick={verify}>Comprobar orden</button>
      </div>
      {attempted && <div className={`pl-feedback ${checked ? "is-correct" : "is-incorrect"}`} role="status">{checked ? config.retroalimentacion.correcta : config.retroalimentacion.incorrecta}</div>}
      {attempted && !complete && !config.permitir_reintentar && <p className="pl-helper">Esta actividad no permite nuevos intentos.</p>}
    </section>
  );
}
