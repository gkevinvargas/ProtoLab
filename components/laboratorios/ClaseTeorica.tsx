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
      className="rounded-3xl border-2 border-blue-100 bg-white p-6 text-slate-800 shadow-lg shadow-blue-900/5 sm:p-8 transition-all"
    >
      <summary
        aria-controls={contenidoId}
        className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-xl font-bold text-blue-700 text-base marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"
      >
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          Clase teórica · {clase.titulo}
        </span>
        <span className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          {clase.duracion_estimada_minutos} min
        </span>
      </summary>

      <article
        id={contenidoId}
        aria-labelledby={tituloId}
        className="mt-6 space-y-8 border-t border-blue-100 pt-6"
      >
        <header className="space-y-3 bg-gradient-to-r from-blue-50/50 to-transparent p-5 rounded-2xl border border-blue-100/60">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            {clase.laboratorio_id} · Clase {clase.orden}
            {" · "}
            {clase.identificador}
          </p>
          <h2 id={tituloId} className="text-2xl font-black sm:text-3xl text-slate-900">
            {clase.titulo}
          </h2>
          <p className="text-base leading-relaxed text-slate-600">{clase.descripcion}</p>
          <div className="flex flex-wrap gap-2.5 pt-2 text-sm text-slate-600">
            <span className="rounded-full bg-blue-100/70 text-blue-800 px-3.5 py-1.5 font-semibold border border-blue-200">
              Duración: {clase.duracion_estimada_minutos} min
            </span>
            {actividades.length > 0 && (
              <span className="rounded-full bg-teal-50 text-teal-800 px-3.5 py-1.5 font-semibold border border-teal-200">
                {actividades.length}{" "}
                {actividades.length === 1 ? "actividad" : "actividades"}
              </span>
            )}
          </div>
        </header>

        {objetivos.length > 0 && (
          <section aria-labelledby={`${tituloId}-objetivos`} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3
              id={`${tituloId}-objetivos`}
              className="text-lg font-bold text-slate-900 flex items-center gap-2.5"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
              Al finalizar podrás
            </h3>
            <ul className="space-y-2.5 pl-2 text-base text-slate-700">
              {objetivos.map((objetivo, indice) => (
                <li key={`${clase.identificador}-objetivo-${indice}`} className="flex items-start gap-2.5">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span>{objetivo}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {secciones.length > 0 && (
          <section aria-label="Contenido teórico" className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Aprende los conceptos</h3>
            {secciones.map((seccion, indice) => {
              const seccionId = `${clase.identificador}-seccion-${indice}`;
              const parrafos =
                seccion.parrafos ?? (seccion.contenido ? [seccion.contenido] : []);

              return (
                <section
                  key={seccionId}
                  className="space-y-3 rounded-2xl bg-gradient-to-b from-white to-blue-50/30 p-6 sm:p-7 border border-blue-100 shadow-sm hover:border-blue-300 transition-all"
                  aria-labelledby={`${seccionId}-titulo`}
                >
                  <h4
                    id={`${seccionId}-titulo`}
                    className="text-lg font-bold text-blue-900"
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
            className="space-y-5 border-t border-blue-100 pt-6"
          >
            <div className="space-y-1.5">
              <h3 id={actividadesId} className="text-xl font-bold text-slate-900">
                Practica lo aprendido
              </h3>
              <p className="text-base leading-relaxed text-slate-600">
                Realiza estas actividades para reforzar los conceptos antes de pasar a la práctica del laboratorio.
              </p>
            </div>

            <ol className="space-y-6">
              {actividades.map((actividad: any, indice: number) => (
                <li
                  key={actividad.id ?? indice}
                  className="space-y-3 rounded-2xl border border-blue-200 bg-white pt-5 sm:p-6 shadow-sm"
                  aria-label={`Actividad ${indice + 1}: ${actividad.titulo}`}
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm ml-3 mr-3 md:ml-0 md:mr-0 lg:ml-0 lg:mr-0">
                    <span className="font-bold bg-blue-600 text-white px-3 py-1 rounded-lg shadow-sm">
                      Actividad {indice + 1}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        actividad.obligatoria
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {actividad.obligatoria ? "Obligatoria" : "Opcional"}
                    </span>
                    <span className="text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
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
            className="border-t border-blue-100 pt-6 space-y-3"
          >
            <h3
              id={`${tituloId}-practicas`}
              className="text-lg font-bold text-slate-900"
            >
              Como aplicarás lo aprendido
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {preparaPara.map((practica) => (
                <li
                  key={`${practica.practica_id}-${practica.tipo_contenido}`}
                  className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 space-y-2 shadow-sm"
                >
                  <p className="font-bold text-blue-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {practica.tipo_contenido === "practica_individual"
                      ? "Práctica individual"
                      : "Práctica complementaria"}
                    {" · "}
                    <span className="text-blue-700">{practica.practica_id}</span>
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