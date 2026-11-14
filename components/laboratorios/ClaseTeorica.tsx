import type { ClaseTeorica as ClaseTeoricaContenido } from "../../lib/content/types";
import { ActivityRenderer } from "../learning/ActivityRenderer";

interface ClaseTeoricaProps {
  clase: ClaseTeoricaContenido;
  abierta?: boolean;
}

/**
 * Presenta el contenido teórico y las actividades interactivas definidas
 * en el mismo JSON de la clase.
 *
 * Ubicación sugerida: components/learning/ClaseTeorica.tsx
 */
export default function ClaseTeorica({
  clase,
  abierta = false,
}: ClaseTeoricaProps) {
  if (clase.tipo_contenido !== "clase_teorica") return null;

  const tituloId = `${clase.identificador}-titulo`;
  const contenidoId = `${clase.identificador}-contenido`;
  const actividadesId = `${clase.identificador}-actividades`;

  return (
    <details
      open={abierta}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm sm:p-6"
    >
      <summary
        aria-controls={contenidoId}
        className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded font-semibold text-blue-700 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"
      >
        <span>Clase teórica · {clase.titulo}</span>
        <span className="text-sm font-normal text-slate-500">
          {clase.duracion_estimada_minutos} min
        </span>
      </summary>

      <article
        id={contenidoId}
        aria-labelledby={tituloId}
        className="mt-5 space-y-7 border-t border-slate-200 pt-5"
      >
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {clase.laboratorio_id} · Clase {clase.orden}
            {" · "}
            {clase.identificador}
          </p>
          <h2 id={tituloId} className="text-xl font-bold sm:text-2xl">
            {clase.titulo}
          </h2>
          <p className="leading-relaxed text-slate-600">
            {clase.descripcion}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Duración: {clase.duracion_estimada_minutos} min
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
            {clase.actividades_interactivas?.length ?? 0} actividades
            </span>
          </div>
        </header>

        {clase.objetivos.length > 0 && (
          <section aria-labelledby={`${tituloId}-objetivos`}>
            <h3
              id={`${tituloId}-objetivos`}
              className="font-semibold text-slate-900"
            >
              Al finalizar podrás
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
              {clase.objetivos.map((objetivo, indice) => (
                <li key={`${clase.identificador}-objetivo-${indice}`}>
                  {objetivo}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Contenido teórico" className="space-y-5">
          <h3 className="font-semibold text-slate-900">Aprende los conceptos</h3>
          {clase.secciones.map((seccion, indice) => (
            <section
              key={`${clase.identificador}-seccion-${indice}`}
              className="space-y-2 rounded-xl bg-slate-50 p-4 sm:p-5"
              aria-labelledby={`${clase.identificador}-seccion-titulo-${indice}`}
            >
              <h4
                id={`${clase.identificador}-seccion-titulo-${indice}`}
                className="font-semibold text-slate-900"
              >
                {seccion.titulo}
              </h4>
              {seccion.parrafos.map((parrafo, indiceParrafo) => (
                <p
                  key={`${clase.identificador}-parrafo-${indice}-${indiceParrafo}`}
                  className="leading-relaxed text-slate-700"
                >
                  {parrafo}
                </p>
              ))}
            </section>
          ))}
        </section>

        {(clase.actividades_interactivas?.length ?? 0) > 0 && (
          <section
            aria-labelledby={actividadesId}
            className="space-y-4 border-t border-slate-200 pt-6"
          >
            <div className="space-y-1">
              <h3 id={actividadesId} className="text-lg font-bold text-slate-900">
                Practica lo aprendido
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Realiza estas actividades para reforzar los conceptos antes de
                pasar a la práctica del laboratorio.
              </p>
            </div>

            <ol className="space-y-5">
              {clase.actividades_interactivas.map((actividad, indice) => (
                <li
                  key={actividad.id}
                  className="space-y-2"
                  aria-label={`Actividad ${indice + 1}: ${actividad.titulo}`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-700">
                      Actividad {indice + 1}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        actividad.obligatoria
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {actividad.obligatoria ? "Obligatoria" : "Opcional"}
                    </span>
                    <span className="text-slate-500">
                      {actividad.duracion_estimada_minutos} min
                    </span>
                  </div>

                  {/* El renderer selecciona el componente React según actividad.tipo. */}
                  <ActivityRenderer actividad={actividad} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {clase.prepara_para.length > 0 && (
          <section
            aria-labelledby={`${tituloId}-practicas`}
            className="border-t border-slate-200 pt-6"
          >
            <h3
              id={`${tituloId}-practicas`}
              className="font-semibold text-slate-900"
            >
              Cómo aplicarás lo aprendido
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {clase.prepara_para.map((practica) => (
                <li
                  key={`${practica.practica_id}-${practica.tipo_contenido}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-medium text-slate-800">
                    {practica.tipo_contenido === "practica_individual"
                      ? "Práctica individual"
                      : "Práctica complementaria"}
                    {" · "}
                    {practica.practica_id}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {practica.aplicacion}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </details>
  );
}
