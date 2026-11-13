interface ClaseTeoricaContenido {
  identificador: string;
  tipo_contenido: string;
  titulo: string;
  descripcion: string;
  duracion_estimada_minutos: number;
  objetivos: readonly string[];
  secciones: readonly {
    titulo: string;
    parrafos: readonly string[];
  }[];
  prepara_para: readonly {
    practica_id: string;
    tipo_contenido: string;
    aplicacion: string;
  }[];
}

export default function ClaseTeorica({
  clase,
  abierta = false,
}: {
  clase: ClaseTeoricaContenido;
  abierta?: boolean;
}) {
  if (clase.tipo_contenido !== "clase_teorica") return null;

  const tituloId = `${clase.identificador}-titulo`;

  return (
    <details
      open={abierta}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 sm:p-6"
    >
      <summary className="cursor-pointer rounded font-semibold text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
        Clase teórica · {clase.titulo}
      </summary>

      <article
        aria-labelledby={tituloId}
        className="mt-5 space-y-6 border-t border-slate-200 pt-5"
      >
        <header className="space-y-2">
          <h2 id={tituloId} className="text-xl font-bold">
            {clase.titulo}
          </h2>
          <p className="text-slate-600">{clase.descripcion}</p>
          <p className="text-sm text-slate-600">
            Duración estimada · {clase.duracion_estimada_minutos} min
          </p>
        </header>

        <section>
          <h3 className="font-semibold">Objetivos</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {clase.objetivos.map((objetivo, indice) => (
              <li key={indice}>{objetivo}</li>
            ))}
          </ul>
        </section>

        {clase.secciones.map((seccion, indice) => (
          <section key={indice} className="space-y-2">
            <h3 className="font-semibold">{seccion.titulo}</h3>
            {seccion.parrafos.map((parrafo, indiceParrafo) => (
              <p key={indiceParrafo} className="leading-relaxed text-slate-700">
                {parrafo}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h3 className="font-semibold">Cómo aplicarás lo aprendido</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {clase.prepara_para.map((practica) => (
              <li key={practica.practica_id} className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium">
                  {practica.tipo_contenido === "practica_individual"
                    ? "Práctica individual"
                    : "Práctica complementaria"}
                  {" · "}
                  {practica.practica_id}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {practica.aplicacion}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </details>
  );
}