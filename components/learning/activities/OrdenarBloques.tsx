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
    <section
      className="pl-activity-card !border-blue-200/80 !bg-gradient-to-b !from-white !to-blue-50/40 shadow-md shadow-blue-900/5"
      aria-label={actividad.titulo}
    >
      <div className="pl-activity-heading border-b border-blue-100 pb-4 mb-4">
        <div>
          <p className="pl-eyebrow !text-blue-600 !font-bold tracking-wider">ROMPECABEZAS</p>
          <h3 className="text-slate-900 font-bold text-lg">{actividad.titulo}</h3>
          <p className="pl-muted text-slate-600">{actividad.instrucciones}</p>
        </div>
        <span className="pl-step-count !bg-blue-100 !text-blue-700 !border !border-blue-200 !font-semibold">
          {order.length} bloques
        </span>
      </div>

      <p className="pl-helper !bg-blue-50/70 !text-blue-800 px-3 py-2 rounded-lg border border-blue-100 text-xs">
        Ordena los bloques con los controles. También puedes usar los botones con teclado; no es necesario arrastrarlos.
      </p>

      <ol className="pl-block-list" aria-label="Bloques ordenables">
        {order.map((id, index) => {
          const block = blockById.get(id);
          if (!block) return null;
          return (
            <li
              className="pl-sort-row !bg-white !border !border-slate-200 hover:!border-blue-400 hover:!bg-blue-50/30 transition-all shadow-sm"
              key={id}
            >
              <span className="pl-sort-number !bg-blue-600 !text-white !font-bold shadow-sm">
                {index + 1}
              </span>
              <span className="pl-sort-text !text-slate-800 font-medium">{block.texto}</span>
              <span className="pl-sort-controls">
                <button
                  type="button"
                  className="pl-icon-button !border-slate-200 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-colors"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Mover ${block.texto} hacia arriba`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="pl-icon-button !border-slate-200 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 transition-colors"
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Mover ${block.texto} hacia abajo`}
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="pl-controls pt-2">
        <button
          type="button"
          className="pl-button pl-button-quiet !border-slate-300 !text-slate-700 hover:!bg-slate-100"
          onClick={reset}
        >
          Reiniciar
        </button>
        <button
          type="button"
          className="pl-button pl-button-primary !bg-blue-600 hover:!bg-blue-700 !text-white shadow-sm shadow-blue-600/20"
          onClick={verify}
        >
          Comprobar orden
        </button>
      </div>

      {attempted && (
        <div
          className={`pl-feedback ${checked ? "is-correct !bg-emerald-50 !border-emerald-300 !text-emerald-800" : "is-incorrect !bg-rose-50 !border-rose-300 !text-rose-800"}`}
          role="status"
        >
          {checked ? config.retroalimentacion.correcta : config.retroalimentacion.incorrecta}
        </div>
      )}
      {attempted && !complete && !config.permitir_reintentar && (
        <p className="pl-helper">Esta actividad no permite nuevos intentos.</p>
      )}
    </section>
  );
}