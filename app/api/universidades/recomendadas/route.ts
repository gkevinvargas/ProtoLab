import { municipioPredeterminado } from "@/lib/municipio-predeterminado";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

const DATOS_MEXICO_API = "https://api.datosmexico.org";
const ENTIDAD = municipioPredeterminado.estado.toUpperCase();
const LIMITE_POR_PAGINA = 1000;
const MAX_PAGINAS = 20;
const REVALIDAR_SEGUNDOS = 60 * 60 * 12;

type AreaProtoLab = "robolab" | "electrolab" | "datalab";

type CicloAnuies = {
  ciclo: string;
};

type RespuestaCiclos = {
  items: CicloAnuies[];
};

type ProgramaAnuies = {
  id: number;
  ciclo: string;
  entidad: string;
  municipio: string | null;
  sostenimiento: string | null;
  clasificacion: string | null;
  institucion: string;
  institucion_clave: string;
  escuela: string | null;
  nivel: string | null;
  modalidad: string | null;
  campo_amplio: string | null;
  campo_especifico: string | null;
  campo_detallado: string | null;
  campo_unitario: string | null;
  carrera: string | null;
  mat_total: number | null;
};

type RespuestaProgramas = {
  total: number;
  n: number;
  next_after: number | null;
  items: ProgramaAnuies[];
};

type ProgramaRelacionado = {
  nombre: string;
  nivel: string | null;
  modalidad: string | null;
  campoAmplio: string | null;
  areas: AreaProtoLab[];
  matricula: number | null;
};

type InstitucionAgrupada = {
  clave: string;
  nombre: string;
  escuela: string;
  municipio: string;
  sostenimiento: string | null;
  clasificacion: string | null;
  programas: Map<string, ProgramaRelacionado>;
};

function normalizar(valor: string | null | undefined): string {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function esAreaProtoLab(valor: string): valor is AreaProtoLab {
  return (
    valor === "robolab" ||
    valor === "electrolab" ||
    valor === "datalab"
  );
}

/**
 * Relación orientativa creada por ProtoLab a partir del nombre del programa
 * y de los campos de formación publicados por ANUIES. No es una clasificación
 * oficial de ANUIES.
 */
function clasificarPrograma(programa: ProgramaAnuies): AreaProtoLab[] {
  const carrera = normalizar(programa.carrera);
  const camposEspecificos = normalizar(
    [programa.campo_especifico, programa.campo_detallado, programa.campo_unitario]
      .filter(Boolean)
      .join(" ")
  );
  const texto = `${carrera} ${camposEspecificos}`;
  const campoAmplio = normalizar(programa.campo_amplio);
  const areas = new Set<AreaProtoLab>();

  if (
    /(robot|mecatron|automatiz|manufactura|mecanica|control industrial)/.test(
      texto
    )
  ) {
    areas.add("robolab");
  }

  if (
    /(electron|electri|electromec|circuit|telecomunic|energia electrica|instrumentacion)/.test(
      texto
    )
  ) {
    areas.add("electrolab");
  }

  if (
    campoAmplio === "tecnologias de la informacion y la comunicacion" ||
    /(computacion|informatica|software|ciencia de datos|analitica|estadistica|matematicas|inteligencia artificial|programacion|sistemas computacionales|analisis de datos)/.test(
      texto
    )
  ) {
    areas.add("datalab");
  }

  // La mecatrónica integra automatización, programación y electrónica.
  if (/(mecatron)/.test(texto)) {
    areas.add("robolab");
    areas.add("electrolab");
  }

  return [...areas];
}

async function consultarDatosMexico<T>(url: URL): Promise<T> {
  const respuesta = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDAR_SEGUNDOS },
  });

  if (!respuesta.ok) {
    throw new Error(
      `Datos México respondió con el estado ${respuesta.status}.`
    );
  }

  return (await respuesta.json()) as T;
}

async function obtenerCicloMasReciente(): Promise<string> {
  const url = new URL("/api/v1/anuies/ciclos", DATOS_MEXICO_API);
  const respuesta = await consultarDatosMexico<RespuestaCiclos>(url);

  const ciclos = (Array.isArray(respuesta.items) ? respuesta.items : [])
    .map((item) => item.ciclo)
    .filter(
      (ciclo): ciclo is string =>
        typeof ciclo === "string" && /^\d{4}-\d{4}$/.test(ciclo)
    )
    .sort((a, b) => b.localeCompare(a));

  if (ciclos.length === 0) {
    throw new Error("La API no informó ciclos ANUIES disponibles.");
  }

  return ciclos[0];
}

/**
 * El endpoint de programas no admite un filtro municipio. Por eso se consulta
 * el ciclo de Jalisco con paginación por cursor y se filtra el municipio aquí.
 * Las respuestas se almacenan en caché por 12 horas en el servidor.
 */
async function obtenerProgramasDeJalisco(
  ciclo: string
): Promise<ProgramaAnuies[]> {
  const programas: ProgramaAnuies[] = [];
  let after: number | null = null;
  let totalEsperado = 0;

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
    const url = new URL("/api/v1/anuies/programas", DATOS_MEXICO_API);
    url.searchParams.set("entidad", ENTIDAD);
    url.searchParams.set("ciclo", ciclo);
    url.searchParams.set("limit", String(LIMITE_POR_PAGINA));

    if (after !== null) {
      url.searchParams.set("after", String(after));
    }

    const respuesta = await consultarDatosMexico<RespuestaProgramas>(url);

    if (!Array.isArray(respuesta.items)) {
      throw new Error("La API devolvió un formato de programas no válido.");
    }

    totalEsperado = respuesta.total;
    programas.push(...respuesta.items);

    if (respuesta.next_after === null || respuesta.items.length === 0) {
      return programas;
    }

    if (respuesta.next_after === after) {
      throw new Error("La paginación de ANUIES no avanzó al siguiente bloque.");
    }

    after = respuesta.next_after;
  }

  if (programas.length < totalEsperado) {
    throw new Error(
      "La consulta de ANUIES superó el límite de páginas permitido."
    );
  }

  return programas;
}

function agruparInstituciones(
  programas: ProgramaAnuies[],
  municipioBuscado: string,
  areasSolicitadas: Set<AreaProtoLab>
) {
  const grupos = new Map<string, InstitucionAgrupada>();

  for (const programa of programas) {
    if (!programa.municipio || normalizar(programa.municipio) !== municipioBuscado) {
      continue;
    }

    const areas = clasificarPrograma(programa).filter((area) =>
      areasSolicitadas.has(area)
    );
    const nombrePrograma = programa.carrera?.trim() ?? "";

    // Conserva también los programas que no coinciden con las áreas solicitadas.
    // Se mostrarán como otras opciones académicas, sin etiquetarlos como recomendación.
    if (!nombrePrograma) {
      continue;
    }

    const claveInstitucion =
      programa.institucion_clave || normalizar(programa.institucion);
    const escuela = programa.escuela?.trim() || "Plantel no especificado";
    const claveGrupo = `${claveInstitucion}::${normalizar(escuela)}`;

    let grupo = grupos.get(claveGrupo);

    if (!grupo) {
      grupo = {
        clave: claveInstitucion,
        nombre: programa.institucion,
        escuela,
        municipio: programa.municipio,
        sostenimiento: programa.sostenimiento,
        clasificacion: programa.clasificacion,
        programas: new Map<string, ProgramaRelacionado>(),
      };
      grupos.set(claveGrupo, grupo);
    }

    const clavePrograma = [
      normalizar(nombrePrograma),
      normalizar(programa.nivel),
      normalizar(programa.modalidad),
    ].join("::");

    const existente = grupo.programas.get(clavePrograma);

    if (existente) {
      existente.areas = [
        ...new Set([...existente.areas, ...areas]),
      ];
      continue;
    }

    grupo.programas.set(clavePrograma, {
      nombre: nombrePrograma,
      nivel: programa.nivel,
      modalidad: programa.modalidad,
      campoAmplio: programa.campo_amplio,
      areas,
      matricula: programa.mat_total,
    });
  }

  return [...grupos.values()]
    .map((grupo) => ({
      ...grupo,
      programas: [...grupo.programas.values()].sort(
        (a, b) =>
          Number(b.areas.length > 0) - Number(a.areas.length > 0) ||
          a.nombre.localeCompare(b.nombre, "es")
      ),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const areasSolicitadas = new Set(
      (searchParams.get("areas") ?? "")
        .split(",")
        .map((area) => area.trim())
        .filter(esAreaProtoLab)
    );

    if (areasSolicitadas.size === 0) {
      return Response.json(
        { error: "No se recibieron áreas válidas de la ruta de aprendizaje." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Inicia sesión para consultar las recomendaciones." },
        { status: 401 }
      );
    }

    const ciclo = await obtenerCicloMasReciente();
    const programasDelCiclo = await obtenerProgramasDeJalisco(ciclo);

    const instituciones = agruparInstituciones(
      programasDelCiclo,
      normalizar(municipioPredeterminado.nombre),
      areasSolicitadas
    );

    return Response.json(
      {
        municipio: municipioPredeterminado.nombre,
        entidad: municipioPredeterminado.estado,
        ciclo,
        fuente: "Datos México · Anuario Estadístico de Educación Superior de ANUIES.",
        notaClasificacion:
          "La relación entre carreras y laboratorios es una clasificación orientativa de ProtoLab basada en el nombre del programa y sus campos de formación; no es una clasificación oficial de ANUIES.",
        instituciones,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error al consultar recomendaciones universitarias:", error);

    return Response.json(
      {
        error:
          "No fue posible obtener la oferta académica de Datos México. Inténtalo nuevamente más tarde.",
      },
      { status: 502 }
    );
  }
}
