import type {
  ActividadInteractiva,
  ClaseTeorica,
} from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  value?: ClaseTeorica;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

function validateActivity(raw: unknown, index: number, errors: string[]): raw is ActividadInteractiva {
  const path = `actividades_interactivas[${index}]`;
  if (!isRecord(raw)) {
    errors.push(`${path} debe ser un objeto.`);
    return false;
  }

  for (const key of ["id", "titulo", "instrucciones"] as const) {
    if (!isString(raw[key])) errors.push(`${path}.${key} debe ser un texto no vacío.`);
  }
  if (!isNumber(raw.duracion_estimada_minutos) || raw.duracion_estimada_minutos < 1) {
    errors.push(`${path}.duracion_estimada_minutos debe ser un entero positivo.`);
  }
  if (!Number.isInteger(raw.duracion_estimada_minutos)) errors.push(`${path}.duracion_estimada_minutos debe ser entero.`);
  if (typeof raw.obligatoria !== "boolean") errors.push(`${path}.obligatoria debe ser booleano.`);
  if (!isRecord(raw.configuracion)) {
    errors.push(`${path}.configuracion debe ser un objeto.`);
    return false;
  }

  const c = raw.configuracion;
  switch (raw.tipo) {
    case "animacion_secuencial": {
      if (!isString(c.escenario)) errors.push(`${path}.configuracion.escenario es obligatorio.`);
      if (!isRecord(c.reproduccion)) errors.push(`${path}.configuracion.reproduccion debe ser un objeto.`);
      else {
        if (typeof c.reproduccion.inicio_automatico !== "boolean" || typeof c.reproduccion.repetir !== "boolean" || !isStringArray(c.reproduccion.controles)) errors.push(`${path}.configuracion.reproduccion requiere inicio_automatico, repetir y controles válidos.`);
      }
      if (!Array.isArray(c.pasos) || c.pasos.length === 0) errors.push(`${path}.configuracion.pasos debe contener al menos un paso.`);
      else {
        const orders = new Set<number>();
        c.pasos.forEach((step, stepIndex) => {
          const p = `${path}.configuracion.pasos[${stepIndex}]`;
          if (!isRecord(step)) { errors.push(`${p} debe ser un objeto.`); return; }
          if (!Number.isInteger(step.orden) || (step.orden as number) < 1) errors.push(`${p}.orden debe ser un entero positivo.`);
          if (orders.has(step.orden as number)) errors.push(`${p}.orden está duplicado.`);
          orders.add(step.orden as number);
          if (!isNumber(step.duracion_ms) || (step.duracion_ms as number) < 100) errors.push(`${p}.duracion_ms debe ser de al menos 100 ms.`);
          for (const key of ["estado_visual", "titulo", "explicacion"] as const) if (!isString(step[key])) errors.push(`${p}.${key} es obligatorio.`);
          if (!isStringArray(step.resaltar)) errors.push(`${p}.resaltar debe ser un arreglo de textos.`);
        });
      }
      return errors.every((e) => !e.startsWith(path));
    }
    case "ordenar_bloques": {
      if (!Array.isArray(c.bloques) || c.bloques.length < 2) errors.push(`${path}.configuracion.bloques debe contener al menos dos bloques.`);
      else {
        const ids = c.bloques.filter(isRecord).map((b) => b.id);
        if (ids.some((id) => !isString(id)) || new Set(ids).size !== ids.length) errors.push(`${path}.configuracion.bloques contiene IDs vacíos o duplicados.`);
        if (c.bloques.some((b) => !isRecord(b) || !isString(b.id) || !isString(b.texto))) errors.push(`${path}.configuracion.bloques requiere id y texto en cada elemento.`);
        const correctOrder = c.orden_correcto;
        if (!isStringArray(correctOrder)) errors.push(`${path}.configuracion.orden_correcto debe ser un arreglo de IDs.`);
        else if (ids.length !== correctOrder.length || new Set(correctOrder).size !== correctOrder.length || ids.some((id) => !correctOrder.includes(id as string))) errors.push(`${path}.configuracion.orden_correcto debe incluir una vez cada bloque.`);
      }
      if (typeof c.mezclar_al_cargar !== "boolean" || typeof c.permitir_reintentar !== "boolean") errors.push(`${path}.configuracion requiere mezclar_al_cargar y permitir_reintentar booleanos.`);
      if (!isRecord(c.retroalimentacion) || !isString(c.retroalimentacion.correcta) || !isString(c.retroalimentacion.incorrecta)) errors.push(`${path}.configuracion.retroalimentacion está incompleta.`);
      return errors.every((e) => !e.startsWith(path));
    }
    case "completar_enunciados": {
      if (!Array.isArray(c.banco_bloques) || c.banco_bloques.length === 0) errors.push(`${path}.configuracion.banco_bloques no puede estar vacío.`);
      const bankIds = new Set<string>();
      if (Array.isArray(c.banco_bloques)) c.banco_bloques.forEach((block, blockIndex) => {
        if (!isRecord(block) || !isString(block.id) || !isString(block.texto)) errors.push(`${path}.configuracion.banco_bloques[${blockIndex}] requiere id y texto.`);
        else if (bankIds.has(block.id)) errors.push(`${path}.configuracion.banco_bloques contiene el ID duplicado ${block.id}.`);
        else bankIds.add(block.id);
      });
      const blankIds = new Set<string>();
      if (!Array.isArray(c.enunciados) || c.enunciados.length === 0) errors.push(`${path}.configuracion.enunciados no puede estar vacío.`);
      else c.enunciados.forEach((sentence, sentenceIndex) => {
        const p = `${path}.configuracion.enunciados[${sentenceIndex}]`;
        if (!isRecord(sentence) || !Array.isArray(sentence.segmentos)) { errors.push(`${p} debe contener segmentos.`); return; }
        sentence.segmentos.forEach((segment, segmentIndex) => {
          const sp = `${p}.segmentos[${segmentIndex}]`;
          if (!isRecord(segment)) { errors.push(`${sp} debe ser un objeto.`); return; }
          if (segment.tipo === "texto" && !isString(segment.contenido)) errors.push(`${sp}.contenido es obligatorio para texto.`);
          else if (segment.tipo === "espacio") {
            if (!isString(segment.id) || !isString(segment.respuesta)) errors.push(`${sp} requiere id y respuesta.`);
            else {
              if (blankIds.has(segment.id)) errors.push(`${sp}.id está duplicado.`);
              blankIds.add(segment.id);
              if (!bankIds.has(segment.respuesta)) errors.push(`${sp}.respuesta no existe en banco_bloques.`);
            }
          } else if (segment.tipo !== "texto") errors.push(`${sp}.tipo no reconocido.`);
        });
      });
      if (!isString(c.modo_respuesta)) errors.push(`${path}.configuracion.modo_respuesta es obligatorio.`);
      if (typeof c.mezclar_opciones !== "boolean" || typeof c.permitir_reintentar !== "boolean") errors.push(`${path}.configuracion requiere mezclar_opciones y permitir_reintentar booleanos.`);
      if (!isRecord(c.retroalimentacion) || !isString(c.retroalimentacion.correcta) || !isString(c.retroalimentacion.incorrecta)) errors.push(`${path}.configuracion.retroalimentacion está incompleta.`);
      return errors.every((e) => !e.startsWith(path));
    }
    case "calculo_guiado": {
      if (!Array.isArray(c.datos) || c.datos.length === 0) errors.push(`${path}.configuracion.datos debe contener datos de entrada.`);
      else c.datos.forEach((data, dataIndex) => {
        const p = `${path}.configuracion.datos[${dataIndex}]`;
        if (!isRecord(data) || !isString(data.id) || !isString(data.etiqueta) || !isNumber(data.valor) || !isString(data.unidad)) errors.push(`${p} requiere id, etiqueta, valor numérico y unidad.`);
      });
      if (!Array.isArray(c.pasos) || c.pasos.length === 0) errors.push(`${path}.configuracion.pasos debe contener al menos un paso.`);
      if (!isString(c.formula_principal) || !isString(c.nota_unidades)) errors.push(`${path}.configuracion requiere formula_principal y nota_unidades.`);
      if (typeof c.permitir_reintentar !== "boolean") errors.push(`${path}.configuracion.permitir_reintentar debe ser booleano.`);
      if (!isRecord(c.retroalimentacion) || !isString(c.retroalimentacion.correcta) || !isString(c.retroalimentacion.incorrecta)) errors.push(`${path}.configuracion.retroalimentacion está incompleta.`);
      if (Array.isArray(c.pasos)) c.pasos.forEach((step, stepIndex) => {
        const p = `${path}.configuracion.pasos[${stepIndex}]`;
        if (!isRecord(step)) { errors.push(`${p} debe ser un objeto.`); return; }
        for (const key of ["id", "consigna", "formula", "unidad", "pista", "explicacion"] as const) if (!isString(step[key])) errors.push(`${p}.${key} es obligatorio.`);
        if (!isNumber(step.respuesta_esperada)) errors.push(`${p}.respuesta_esperada debe ser numérico.`);
        if (!isNumber(step.tolerancia_absoluta) || (step.tolerancia_absoluta as number) < 0) errors.push(`${p}.tolerancia_absoluta debe ser no negativa.`);
      });
      return errors.every((e) => !e.startsWith(path));
    }
    case "sopa_letras": {
      const rows = c.filas;
      const cols = c.columnas;
      if (!Number.isInteger(rows) || (rows as number) < 1 || !Number.isInteger(cols) || (cols as number) < 1) errors.push(`${path}.configuracion requiere filas y columnas positivas.`);
      if (!Array.isArray(c.cuadricula) || c.cuadricula.length !== rows) errors.push(`${path}.configuracion.cuadricula debe tener exactamente ${String(rows)} filas.`);
      else c.cuadricula.forEach((row, rowIndex) => {
        if (typeof row !== "string" || row.length !== cols) errors.push(`${path}.configuracion.cuadricula[${rowIndex}] debe tener ${String(cols)} caracteres.`);
      });
      if (typeof c.mostrar_lista_palabras !== "boolean" || typeof c.permitir_reintentar !== "boolean") errors.push(`${path}.configuracion requiere mostrar_lista_palabras y permitir_reintentar booleanos.`);
      if (!isRecord(c.retroalimentacion) || !isString(c.retroalimentacion.completada) || !isString(c.retroalimentacion.ayuda)) errors.push(`${path}.configuracion.retroalimentacion está incompleta.`);
      const rawWords = c.palabras;
      const rawSolutions = c.soluciones;
      if (!Array.isArray(rawWords) || !Array.isArray(rawSolutions) || rawWords.length !== rawSolutions.length) {
        errors.push(`${path}.configuracion debe definir una solución para cada palabra.`);
      } else if (Array.isArray(c.cuadricula)) {
        const grid = c.cuadricula.filter((row): row is string => typeof row === "string").map((row) => row.toUpperCase());
        const words = new Set<string>();
        for (const wordEntry of rawWords) {
          if (!isRecord(wordEntry) || !isString(wordEntry.texto) || !isString(wordEntry.pista)) errors.push(`${path}.configuracion.palabras contiene una entrada incompleta.`);
          else words.add(wordEntry.texto.toUpperCase());
        }
        const solved = new Set<string>();
        rawSolutions.forEach((solution, solutionIndex) => {
          const p = `${path}.configuracion.soluciones[${solutionIndex}]`;
          if (!isRecord(solution) || !isString(solution.palabra)) { errors.push(`${p} requiere palabra.`); return; }
          const word = solution.palabra.toUpperCase();
          if (!words.has(word)) errors.push(`${p} referencia una palabra que no está en palabras.`);
          if (solved.has(word)) errors.push(`${p} duplica la solución de ${word}.`);
          solved.add(word);
          const r = solution.fila_inicio;
          const col = solution.columna_inicio;
          const direction = solution.direccion;
          if (!Number.isInteger(r) || !Number.isInteger(col) || (r as number) < 0 || (col as number) < 0 || (direction !== "horizontal" && direction !== "vertical")) { errors.push(`${p} tiene coordenadas o dirección inválidas.`); return; }
          let extracted = "";
          for (let i = 0; i < word.length; i += 1) {
            const rr = (r as number) + (direction === "vertical" ? i : 0);
            const cc = (col as number) + (direction === "horizontal" ? i : 0);
            if (!grid[rr] || grid[rr][cc] === undefined) { errors.push(`${p} sale de los límites de la cuadrícula.`); return; }
            extracted += grid[rr][cc];
          }
          if (extracted !== word) errors.push(`${p} no coincide con la palabra ${word} en la cuadrícula (se encontró ${extracted}).`);
          if (Array.isArray(c.direcciones_permitidas) && !c.direcciones_permitidas.includes(direction)) errors.push(`${p} utiliza una dirección no permitida.`);
        });
        words.forEach((word) => { if (!solved.has(word)) errors.push(`${path} no tiene coordenadas para ${word}.`); });
      }
      if (!Array.isArray(c.direcciones_permitidas) || c.direcciones_permitidas.some((d) => d !== "horizontal" && d !== "vertical")) errors.push(`${path}.configuracion.direcciones_permitidas contiene una dirección no admitida.`);
      return errors.every((e) => !e.startsWith(path));
    }
    default:
      errors.push(`${path}.tipo no está registrado.`);
      return false;
  }
}

export function validateClaseTeorica(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ["La clase debe ser un objeto JSON."] };

  const requiredStrings = ["version_contenido", "identificador", "titulo", "descripcion"] as const;
  requiredStrings.forEach((key) => { if (typeof input[key] !== "string" || (key !== "descripcion" && !(input[key] as string).trim())) errors.push(`${key} debe ser un texto${key === "descripcion" ? "" : " no vacío"}.`); });
  if (input.schema_version !== "1.1.0") errors.push("schema_version debe ser 1.1.0.");
  if (!["robolab", "electrolab", "datalab"].includes(String(input.laboratorio_id))) errors.push("laboratorio_id debe ser robolab, electrolab o datalab.");
  if (input.tipo_contenido !== "clase_teorica") errors.push("tipo_contenido debe ser clase_teorica.");
  if (!["borrador", "publicado", "archivado"].includes(String(input.estado_publicacion))) errors.push("estado_publicacion no es válido.");
  if (!Number.isInteger(input.orden) || (input.orden as number) < 1) errors.push("orden debe ser un entero positivo.");
  if (!Number.isInteger(input.duracion_estimada_minutos) || (input.duracion_estimada_minutos as number) < 1) errors.push("duracion_estimada_minutos debe ser un entero positivo.");
  if (!isStringArray(input.objetivos) || input.objetivos.length === 0) errors.push("objetivos debe contener al menos un texto.");
  if (!Array.isArray(input.secciones) || input.secciones.length === 0) errors.push("secciones debe contener al menos una sección.");
  else input.secciones.forEach((section, index) => {
    if (!isRecord(section) || !isString(section.titulo) || !isStringArray(section.parrafos) || section.parrafos.length === 0) errors.push(`secciones[${index}] requiere título y al menos un párrafo.`);
  });
  if (!Array.isArray(input.actividades_interactivas) || input.actividades_interactivas.length === 0) errors.push("actividades_interactivas debe contener al menos una actividad.");
  else {
    const ids = new Set<string>();
    input.actividades_interactivas.forEach((activity, index) => {
      validateActivity(activity, index, errors);
      if (isRecord(activity) && isString(activity.id)) {
        if (ids.has(activity.id)) errors.push(`El ID de actividad ${activity.id} está duplicado.`);
        ids.add(activity.id);
      }
    });
  }
  if (!Array.isArray(input.prepara_para)) errors.push("prepara_para debe ser un arreglo.");
  else input.prepara_para.forEach((item, index) => {
    if (!isRecord(item) || !isString(item.practica_id) || !isString(item.aplicacion) || !["practica_individual", "practica_complementaria"].includes(String(item.tipo_contenido))) errors.push(`prepara_para[${index}] está incompleto.`);
  });

  if (errors.length) return { valid: false, errors };
  return { valid: true, errors: [], value: input as unknown as ClaseTeorica };
}

export function parseAndValidateClaseTeorica(jsonText: string): ValidationResult {
  try {
    return validateClaseTeorica(JSON.parse(jsonText) as unknown);
  } catch (error) {
    return { valid: false, errors: [error instanceof Error ? `JSON inválido: ${error.message}` : "El archivo no contiene JSON válido."] };
  }
}
