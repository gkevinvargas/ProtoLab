
import diagnosticContent from "@/data/diagnostico/diagnostic-public.json";

import type {
  DiagnosticAreaId,
  DiagnosticDimensionId,
  DiagnosticQuestionType,
  DiagnosticPublicContent,
} from "./diagnostic-types";

/**
 * Obtiene y valida el contenido público del diagnóstico.
 */
export function getDiagnosticContent(): DiagnosticPublicContent {
  const validation = validateDiagnosticContent(diagnosticContent);

  if (!validation.valid) {
    throw new Error(
      `Error en el contenido del diagnóstico:\n${validation.errors.join("\n")}`
    );
  }

  return diagnosticContent as DiagnosticPublicContent;
}

const VALID_AREAS: DiagnosticAreaId[] = [
  "robolab",
  "electrolab",
  "datalab",
];

const VALID_DIMENSIONS: DiagnosticDimensionId[] = [
  "intereses",
  "aptitudes",
  "oferta_laboral",
];

const VALID_QUESTION_TYPES: DiagnosticQuestionType[] = [
  "seleccion_unica",
  "seleccion_multiple",
  "escala",
];

export interface DiagnosticValidationResult {
  valid: boolean;
  errors: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Comprueba que una lista contenga exactamente los identificadores esperados.
 */
function hasAllExpectedIds(
  receivedIds: Set<string>,
  expectedIds: string[]
): boolean {
  return (
    receivedIds.size === expectedIds.length &&
    expectedIds.every((id) => receivedIds.has(id))
  );
}

/**
 * Valida la estructura y consistencia del contenido público del diagnóstico.
 */
export function validateDiagnosticContent(
  content: unknown
): DiagnosticValidationResult {
  const errors: string[] = [];

  if (!isObject(content)) {
    return {
      valid: false,
      errors: ["El contenido del diagnóstico debe ser un objeto JSON."],
    };
  }

  // Identificación y versión del contenido.
  if (content.schema_version !== "1.0.0") {
    errors.push("La versión del esquema no es válida.");
  }

  if (content.contenido_id !== "diagnostico-vocacional") {
    errors.push("El identificador del contenido no es válido.");
  }

  if (content.tipo_contenido !== "diagnostico_vocacional") {
    errors.push("El tipo de contenido no es válido.");
  }

  // Metadatos.
  if (!isObject(content.metadatos)) {
    errors.push("Faltan los metadatos del diagnóstico.");
  } else {
    if (
      typeof content.metadatos.titulo !== "string" ||
      !content.metadatos.titulo.trim()
    ) {
      errors.push("El título del diagnóstico debe ser un texto válido.");
    }

    if (
      typeof content.metadatos.descripcion !== "string" ||
      !content.metadatos.descripcion.trim()
    ) {
      errors.push("La descripción debe ser un texto válido.");
    }

    if (
      typeof content.metadatos.idioma !== "string" ||
      !content.metadatos.idioma.trim()
    ) {
      errors.push("El idioma debe estar definido.");
    }
  }

  // Dimensiones.
  if (!Array.isArray(content.dimensiones)) {
    errors.push("Las dimensiones deben estar definidas como una lista.");
  } else {
    const dimensionIds = new Set<string>();

    content.dimensiones.forEach((dimension, index) => {
      if (!isObject(dimension)) {
        errors.push(
          `La dimensión ${index + 1} no tiene una estructura válida.`
        );
        return;
      }

      if (
        typeof dimension.dimension_id !== "string" ||
        !VALID_DIMENSIONS.includes(
          dimension.dimension_id as DiagnosticDimensionId
        )
      ) {
        errors.push(
          `La dimensión ${index + 1} tiene un identificador inválido.`
        );
      } else if (dimensionIds.has(dimension.dimension_id)) {
        errors.push(`La dimensión ${dimension.dimension_id} está duplicada.`);
      } else {
        dimensionIds.add(dimension.dimension_id);
      }

      if (
        typeof dimension.nombre !== "string" ||
        !dimension.nombre.trim()
      ) {
        errors.push(`La dimensión ${index + 1} no tiene un nombre válido.`);
      }
    });

    if (!hasAllExpectedIds(dimensionIds, VALID_DIMENSIONS)) {
      errors.push(
        "El diagnóstico debe incluir las tres dimensiones: intereses, aptitudes y oferta laboral."
      );
    }
  }

  // Áreas.
  if (!Array.isArray(content.areas)) {
    errors.push("Las áreas deben estar definidas como una lista.");
  } else {
    const areaIds = new Set<string>();

    content.areas.forEach((area, index) => {
      if (!isObject(area)) {
        errors.push(`El área ${index + 1} no tiene una estructura válida.`);
        return;
      }

      if (
        typeof area.area_id !== "string" ||
        !VALID_AREAS.includes(area.area_id as DiagnosticAreaId)
      ) {
        errors.push(`El área ${index + 1} tiene un identificador inválido.`);
      } else if (areaIds.has(area.area_id)) {
        errors.push(`El área ${area.area_id} está duplicada.`);
      } else {
        areaIds.add(area.area_id);
      }

      if (typeof area.nombre !== "string" || !area.nombre.trim()) {
        errors.push(`El área ${index + 1} no tiene un nombre válido.`);
      }
    });

    if (!hasAllExpectedIds(areaIds, VALID_AREAS)) {
      errors.push(
        "El diagnóstico debe incluir las tres áreas: RoboLab, ElectroLab y DataLab."
      );
    }
  }

  // Catálogo de intereses.
  if (!isObject(content.catalogo_intereses)) {
    errors.push("No existe un catálogo de intereses válido.");
  } else {
    const selection = content.catalogo_intereses.seleccion;

    if (!isObject(selection)) {
      errors.push("La configuración de selección de intereses es inválida.");
    } else {
      if (selection.tipo !== "multiple") {
        errors.push("La selección de intereses debe ser múltiple.");
      }

      if (
        typeof selection.minimo !== "number" ||
        typeof selection.maximo !== "number" ||
        !Number.isInteger(selection.minimo) ||
        !Number.isInteger(selection.maximo) ||
        selection.minimo !== 1 ||
        selection.maximo !== 3
      ) {
        errors.push("Los límites de selección de intereses son inválidos.");
      }

      if (selection.conservar_orden !== true) {
        errors.push(
          "La configuración debe conservar el orden de selección de intereses."
        );
      }
    }

    if (!Array.isArray(content.catalogo_intereses.intereses)) {
      errors.push("La lista de intereses debe ser un arreglo.");
    } else {
      const interestIds = new Set<string>();

      content.catalogo_intereses.intereses.forEach((interest, index) => {
        if (!isObject(interest)) {
          errors.push(
            `El interés ${index + 1} no tiene una estructura válida.`
          );
          return;
        }

        if (
          typeof interest.identificador !== "string" ||
          !interest.identificador.trim()
        ) {
          errors.push(`El interés ${index + 1} no tiene un identificador.`);
        } else if (interestIds.has(interest.identificador)) {
          errors.push(`El interés ${interest.identificador} está duplicado.`);
        } else {
          interestIds.add(interest.identificador);
        }

        if (
          typeof interest.etiqueta !== "string" ||
          !interest.etiqueta.trim()
        ) {
          errors.push(
            `El interés ${index + 1} no tiene una etiqueta válida.`
          );
        }

        if (
          !Array.isArray(interest.areas_relacionadas) ||
          interest.areas_relacionadas.length === 0 ||
          !interest.areas_relacionadas.every(
            (area) =>
              typeof area === "string" &&
              VALID_AREAS.includes(area as DiagnosticAreaId)
          )
        ) {
          errors.push(
            `El interés ${index + 1} tiene áreas relacionadas inválidas.`
          );
        }
      });
    }
  }

  // Preguntas.
  if (!Array.isArray(content.preguntas)) {
    errors.push("Las preguntas deben estar definidas como una lista.");
  } else {
    const questionIds = new Set<string>();

    content.preguntas.forEach((question, index) => {
      if (!isObject(question)) {
        errors.push(
          `La pregunta ${index + 1} no tiene una estructura válida.`
        );
        return;
      }

      if (
        typeof question.identificador !== "string" ||
        !question.identificador.trim()
      ) {
        errors.push(`La pregunta ${index + 1} no tiene identificador.`);
      } else if (questionIds.has(question.identificador)) {
        errors.push(
          `La pregunta ${question.identificador} está duplicada.`
        );
      } else {
        questionIds.add(question.identificador);
      }

      if (
        typeof question.area !== "string" ||
        !VALID_AREAS.includes(question.area as DiagnosticAreaId)
      ) {
        errors.push(`La pregunta ${index + 1} tiene un área inválida.`);
      }

      if (
        typeof question.dimension !== "string" ||
        !VALID_DIMENSIONS.includes(
          question.dimension as DiagnosticDimensionId
        )
      ) {
        errors.push(`La pregunta ${index + 1} tiene una dimensión inválida.`);
      }

      if (
        typeof question.tipo !== "string" ||
        !VALID_QUESTION_TYPES.includes(
          question.tipo as DiagnosticQuestionType
        )
      ) {
        errors.push(
          `La pregunta ${index + 1} tiene un tipo inválido. Debe ser seleccion_unica, seleccion_multiple o escala.`
        );
      }

      if (
        typeof question.enunciado !== "string" ||
        !question.enunciado.trim()
      ) {
        errors.push(`La pregunta ${index + 1} no tiene enunciado.`);
      }

      if (typeof question.obligatoria !== "boolean") {
        errors.push(
          `La pregunta ${index + 1} no define si es obligatoria.`
        );
      }

      if (
        typeof question.ponderacion_maxima !== "number" ||
        !Number.isFinite(question.ponderacion_maxima) ||
        question.ponderacion_maxima < 0
      ) {
        errors.push(
          `La pregunta ${index + 1} tiene una ponderación inválida.`
        );
      }

      if (
        !Array.isArray(question.opciones) ||
        question.opciones.length === 0
      ) {
        errors.push(
          `La pregunta ${index + 1} no tiene opciones válidas.`
        );
      } else {
        const optionIds = new Set<string>();

        question.opciones.forEach((option, optionIndex) => {
          if (!isObject(option)) {
            errors.push(
              `La opción ${optionIndex + 1} de la pregunta ${index + 1} es inválida.`
            );
            return;
          }

          if (
            typeof option.opcion_id !== "string" ||
            !option.opcion_id.trim()
          ) {
            errors.push(
              `Una opción de la pregunta ${index + 1} no tiene identificador.`
            );
          } else if (optionIds.has(option.opcion_id)) {
            errors.push(
              `La opción ${option.opcion_id} está duplicada en la pregunta ${index + 1}.`
            );
          } else {
            optionIds.add(option.opcion_id);
          }

          if (
            typeof option.texto !== "string" ||
            !option.texto.trim()
          ) {
            errors.push(
              `Una opción de la pregunta ${index + 1} no tiene texto válido.`
            );
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
