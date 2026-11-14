"use client";

import { useMemo, useState } from "react";
import type { SopaLetras as SopaLetrasType } from "../../../lib/content/types";

interface Props { actividad: SopaLetrasType }
type Cell = { row: number; col: number };

function sameCell(a: Cell, b: Cell) { return a.row === b.row && a.col === b.col; }

export function SopaLetras({ actividad }: Props) {
  const config = actividad.configuracion;
  const [firstCell, setFirstCell] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [lastMessage, setLastMessage] = useState("");
  const [showHints, setShowHints] = useState(false);
  const foundSet = useMemo(() => new Set(found), [found]);
  const allFound = found.length === config.palabras.length;
  const solutions = config.soluciones;

  const selectCell = (cell: Cell) => {
    if (!firstCell) {
      setFirstCell(cell);
      setLastMessage("Ahora selecciona la última letra de la palabra.");
      return;
    }
    if (sameCell(firstCell, cell)) {
      setFirstCell(null);
      setLastMessage("Selección cancelada.");
      return;
    }

    const solution = solutions.find((item) => {
      if (!config.direcciones_permitidas.includes(item.direccion)) return false;
      const length = item.palabra.length;
      const end = {
        row: item.fila_inicio + (item.direccion === "vertical" ? length - 1 : 0),
        col: item.columna_inicio + (item.direccion === "horizontal" ? length - 1 : 0),
      };
      const start = { row: item.fila_inicio, col: item.columna_inicio };
      return (sameCell(firstCell, start) && sameCell(cell, end)) || (sameCell(firstCell, end) && sameCell(cell, start));
    });

    if (solution && !foundSet.has(solution.palabra)) {
      setFound((current) => [...current, solution.palabra]);
      setLastMessage(`Encontraste ${solution.palabra}.`);
    } else if (solution && foundSet.has(solution.palabra)) {
      setLastMessage(`${solution.palabra} ya estaba encontrada.`);
    } else {
      setLastMessage("Esa selección no corresponde a una palabra. Prueba otra vez.");
    }
    setFirstCell(null);
  };

  const cellIsFound = (row: number, col: number) => solutions.some((solution) => {
    if (!foundSet.has(solution.palabra)) return false;
    return Array.from({ length: solution.palabra.length }).some((_, index) =>
      solution.fila_inicio + (solution.direccion === "vertical" ? index : 0) === row &&
      solution.columna_inicio + (solution.direccion === "horizontal" ? index : 0) === col,
    );
  });

  const reset = () => { setFirstCell(null); setFound([]); setLastMessage(""); setShowHints(false); };

  return (
    <section className="pl-activity-card" aria-label={actividad.titulo}>
      <div className="pl-activity-heading">
        <div><p className="pl-eyebrow">Desafío de vocabulario</p><h3>{actividad.titulo}</h3><p className="pl-muted">{actividad.instrucciones}</p></div>
        <span className="pl-step-count">{found.length}/{config.palabras.length}</span>
      </div>
      <div className="pl-wordsearch-layout">
        <div className="pl-wordsearch-grid" role="group" aria-label={`Cuadrícula de ${config.filas} filas por ${config.columnas} columnas`} style={{ gridTemplateColumns: `repeat(${config.columnas}, minmax(0, 1fr))` }}>
          {config.cuadricula.flatMap((row, rowIndex) => row.split("").map((letter, colIndex) => {
            const cell = { row: rowIndex, col: colIndex };
            const isStart = firstCell !== null && sameCell(firstCell, cell);
            const isFound = cellIsFound(rowIndex, colIndex);
            return <button type="button" key={`${rowIndex}-${colIndex}`} className={`pl-letter-cell ${isFound ? "is-found" : ""} ${isStart ? "is-selected" : ""}`} onClick={() => selectCell(cell)} aria-label={`Fila ${rowIndex + 1}, columna ${colIndex + 1}: ${letter}`} aria-pressed={isStart || isFound}>{letter}</button>;
          }))}
        </div>
        <aside className="pl-wordsearch-sidebar">
          {config.mostrar_lista_palabras && <>
            <h4>Palabras por encontrar</h4>
            <ul className="pl-word-list">
              {config.palabras.map((word) => <li key={word.texto} className={foundSet.has(word.texto) ? "is-found" : ""}><span aria-hidden="true">{foundSet.has(word.texto) ? "✓" : "○"}</span>{word.texto}</li>)}
            </ul>
          </>}
          <button type="button" className="pl-text-button" onClick={() => setShowHints((value) => !value)}>{showHints ? "Ocultar pistas" : "Ver pistas"}</button>
          {showHints && <ul className="pl-hint-list">{config.palabras.filter((word) => !foundSet.has(word.texto)).map((word) => <li key={word.texto}><strong>{word.texto}:</strong> {word.pista}</li>)}</ul>}
        </aside>
      </div>
      <p className="pl-helper" aria-live="polite">{lastMessage || "Selecciona la primera y la última letra de una palabra. Se admiten palabras horizontales y verticales."}</p>
      <div className="pl-controls">
        <button type="button" className="pl-button pl-button-quiet" onClick={reset}>Reiniciar</button>
        {allFound ? <span className="pl-completion" role="status">{config.retroalimentacion.completada}</span> : <span className="pl-step-count">{config.direcciones_permitidas.join(" y ")}</span>}
      </div>
    </section>
  );
}
