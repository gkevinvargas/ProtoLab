import { validateClaseTeorica } from "../../lib/content/validate-class";
import { ActivityRenderer } from "../learning/ActivityRenderer";

interface SeccionTeorica {
  titulo: string;
  parrafos?: readonly string[];
  contenido?: string;
}

interface ClaseTeoricaProps {
  clase: {
    tipo_contenido: string;
    identificador: string;
    titulo: string;
    descripcion: string;
    duracion_estimada_minutos: number;
    laboratorio_id: string;
    orden: number;
    objetivos?: readonly string[];
    secciones?: readonly SeccionTeorica[];
    prepara_para?: readonly {
      practica_id: string;
      tipo_contenido: string;
      aplicacion: string;
    }[];
    actividades_interactivas?: unknown;
  };
  abierta?: boolean;
}

export default function ClaseTeorica({
  clase,
  abierta = false,
}: ClaseTeoricaProps) {
  const actividades = Array.isArray(clase?.actividades_interactivas)
    ? clase.actividades_interactivas
    : (validateClaseTeorica(clase)?.value?.actividades_interactivas ?? []);

  const objetivos = clase?.objetivos ?? [];
  const secciones = clase?.secciones ?? [];
  const preparaPara = clase?.prepara_para ?? [];

  const tituloId = `${clase.identificador}-titulo`;
  const contenidoId = `${clase.identificador}-contenido`;
  const actividadesId = `${clase.identificador}-actividades`;

  return (
    <details
      open={abierta}
      className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm sm:p-8"
    >
      <summary
        aria-controls={contenidoId}
        className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded font-bold text-blue-700 text-base marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"
      >
        <span>Clase teórica · {clase.titulo}</span>
        <span className="text-sm font-medium text-slate-500">
          {clase.duracion_estimada_minutos} min
        </span>
      </summary>

      <article
        id={contenidoId}
        aria-labelledby={tituloId}
        className="mt-6 space-y-8 border-t border-slate-200 pt-6"
      >
        <header className="space-y-3">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            {clase.laboratorio_id} · Clase {clase.orden}
            {" · "}
            {clase.identificador}
          </p>
          <h2 id={tituloId} className="text-2xl font-black sm:text-3xl text-slate-900">
            {clase.titulo}
          </h2>
          <p className="text-base leading-relaxed text-slate-600">{clase.descripcion}</p>
          <div className="flex flex-wrap gap-2.5 pt-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3.5 py-1.5 font-medium">
              Duración: {clase.duracion_estimada_minutos} min
            </span>
            {actividades.length > 0 && (
              <span className="rounded-full bg-slate-100 px-3.5 py-1.5 font-medium">
                {actividades.length}{" "}
                {actividades.length === 1 ? "actividad" : "actividades"}
              </span>
            )}
          </div>
        </header>

        {objetivos.length > 0 && (
          <section aria-labelledby={`${tituloId}-objetivos`} className="space-y-3">
            <h3
              id={`${tituloId}-objetivos`}
              className="text-lg font-bold text-slate-900"
            >
              Al finalizar podrás
            </h3>
            <ul className="list-disc space-y-2.5 pl-6 text-base text-slate-700">
              {objetivos.map((objetivo, indice) => (
                <li key={`${clase.identificador}-objetivo-${indice}`}>
                  {objetivo}
                </li>
              ))}
            </ul>
          </section>
        )}

        {secciones.length > 0 && (
          <section aria-label="Contenido teórico" className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Aprende los conceptos</h3>
            {secciones.map((seccion, indice) => {
              const seccionId = `${clase.identificador}-seccion-${indice}`;
              const parrafos =
                seccion.parrafos ?? (seccion.contenido ? [seccion.contenido] : []);

              return (
                <section
                  key={seccionId}
                  className="space-y-3 rounded-2xl bg-slate-50 p-5 sm:p-6 border border-slate-100"
                  aria-labelledby={`${seccionId}-titulo`}
                >
                  <h4
                    id={`${seccionId}-titulo`}
                    className="text-base font-bold text-slate-900"
                  >
                    {seccion.titulo}
                  </h4>
                  {parrafos.map((parrafo, indiceParrafo) => (
                    <p
                      key={`${seccionId}-parrafo-${indiceParrafo}`}
                      className="text-base leading-relaxed text-slate-700"
                    >
                      {parrafo}
                    </p>
                  ))}
                </section>
              );
            })}
          </section>
        )}

        {actividades.length > 0 && (
          <section
            aria-labelledby={actividadesId}
            className="space-y-5 border-t border-slate-200 pt-6"
          >
            <div className="space-y-1.5">
              <h3 id={actividadesId} className="text-xl font-bold text-slate-900">
                Practica lo aprendido
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                Realiza estas actividades para reforzar los conceptos antes de
                pasar a la práctica del laboratorio.
              </p>
            </div>

            <ol className="space-y-6">
              {actividades.map((actividad: any, indice: number) => (
                <li
                  key={actividad.id ?? indice}
                  className="space-y-3"
                  aria-label={`Actividad ${indice + 1}: ${actividad.titulo}`}
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-bold text-slate-700">
                      Actividad {indice + 1}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        actividad.obligatoria
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {actividad.obligatoria ? "Obligatoria" : "Opcional"}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {actividad.duracion_estimada_minutos} min
                    </span>
                  </div>

                  <ActivityRenderer actividad={actividad} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {preparaPara.length > 0 && (
          <section
            aria-labelledby={`${tituloId}-practicas`}
            className="border-t border-slate-200 pt-6 space-y-3"
          >
            <h3
              id={`${tituloId}-practicas`}
              className="text-lg font-bold text-slate-900"
            >
              Cómo aplicarás lo aprendido
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {preparaPara.map((practica) => (
                <li
                  key={`${practica.practica_id}-${practica.tipo_contenido}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2"
                >
                  <p className="font-bold text-slate-900 text-sm">
                    {practica.tipo_contenido === "practica_individual"
                      ? "Práctica individual"
                      : "Práctica complementaria"}
                    {" · "}
                    {practica.practica_id}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
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