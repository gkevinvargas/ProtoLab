"use client";

import { useMemo } from "react";
import type { ClaseTeorica } from "../../lib/content/types";
import { validateClaseTeorica } from "../../lib/content/validate-class";
import { ActivityRenderer } from "./ActivityRenderer";

interface Props {
  clase: ClaseTeorica;
  mostrarIdentificador?: boolean;
}

export function InteractiveClass({ clase, mostrarIdentificador = false }: Props) {
  const validation = useMemo(() => validateClaseTeorica(clase), [clase]);

  if (!validation.valid) {
    return (
      <main className="pl-learning-shell">
        <section className="pl-validation-error" role="alert">
          <h1>No se pudo cargar la clase</h1>
          <p>El contenido JSON no cumple el contrato de clases teóricas interactivas.</p>
          <ul>{validation.errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </section>
      </main>
    );
  }

  return (
    <main className="pl-learning-shell">
      <header className="pl-learning-header">
        <div className="pl-learning-kicker">
          <span>{clase.laboratorio_id.toUpperCase()}</span>
          <span aria-hidden="true">·</span>
          <span>Clase {clase.orden}</span>
          {mostrarIdentificador && <><span aria-hidden="true">·</span><span>{clase.identificador}</span></>}
        </div>
        <h1>{clase.titulo}</h1>
        <p>{clase.descripcion}</p>
        <div className="pl-learning-meta"><span>◷ {clase.duracion_estimada_minutos} min</span><span>{clase.objetivos.length} objetivos</span><span>{clase.actividades_interactivas.length} actividades</span></div>
      </header>

      <section className="pl-theory-sections" aria-label="Contenido teórico">
        <div className="pl-section-title"><span>01</span><h2>Aprende los conceptos</h2></div>
        {clase.objetivos.length > 0 && <div className="pl-objectives"><h3>Al finalizar podrás</h3><ul>{clase.objetivos.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>}
        {clase.secciones.map((section, index) => (
          <article className="pl-theory-card" key={`${section.titulo}-${index}`}>
            <span className="pl-section-index">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{section.titulo}</h3>{section.parrafos.map((paragraph, pIndex) => <p key={pIndex}>{paragraph}</p>)}</div>
          </article>
        ))}
      </section>

      <section className="pl-interactive-section" aria-label="Actividades interactivas">
        <div className="pl-section-title"><span>02</span><h2>Practica lo aprendido</h2></div>
        <p className="pl-section-intro">Completa las actividades para reforzar los conceptos antes de realizar la práctica.</p>
        <div className="pl-activities-stack">
          {clase.actividades_interactivas.map((actividad, index) => (
            <div className="pl-activity-wrapper" key={actividad.id}>
              <div className="pl-activity-number">Actividad {index + 1}{actividad.obligatoria ? <span>Obligatoria</span> : <span>Opcional</span>}</div>
              <ActivityRenderer actividad={actividad} />
            </div>
          ))}
        </div>
      </section>

      {clase.prepara_para.length > 0 && (
        <footer className="pl-class-footer">
          <h2>¿Qué sigue?</h2>
          <p>Esta clase te prepara para aplicar lo aprendido en la siguiente práctica:</p>
          {clase.prepara_para.map((item) => <div key={`${item.practica_id}-${item.tipo_contenido}`} className="pl-related-practice"><strong>{item.practica_id}</strong><span>{item.aplicacion}</span></div>)}
        </footer>
      )}
    </main>
  );
}
