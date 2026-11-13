import "server-only";

import { getDiagnosticContent } from "./diagnostic-loader";
import diagnosticPrivateEvaluation from "./private/diagnostic-evaluation.private.json";

import type {
  DiagnosticAreaId,
  DiagnosticClassification,
  DiagnosticDimensionId,
  DiagnosticPrivateEvaluation,
  DiagnosticResult,
} from "./diagnostic-types";

export interface DiagnosticAnswer {
  identificador_pregunta: string;
  opciones_seleccionadas: string[];
}

export interface DiagnosticAnswerValidation {
  valid: boolean;
  errors: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Obtiene la configuración privada de evaluación.
 * Solo está disponible en el servidor.
 */
export function getDiagnosticEvaluationConfig() {
  return getDiagnosticPrivateEvaluation();
}

/**
 * Valida las respuestas recibidas antes de enviarlas
 * al proceso de evaluación del backend.
 */
export function validateDiagnosticAnswers(
  submittedAnswers: unknown
): DiagnosticAnswerValidation {
  const errors: string[] = [];

  if (!Array.isArray(submittedAnswers)) {
    return {
      valid: false,
      errors: ["Las respuestas deben enviarse como una lista."],
    };
  }

  const content = getDiagnosticContent();

  const questions = new Map(
    content.preguntas.map((question) => [
      question.identificador,
      question,
    ])
  );

  const answeredQuestions = new Set<string>();

  submittedAnswers.forEach((answer, index) => {
    if (!isObject(answer)) {
      errors.push(`La respuesta ${index + 1} tiene una estructura inválida.`);
      return;
    }

    const questionId = answer.identificador_pregunta;
    const selectedOptions = answer.opciones_seleccionadas;

    if (typeof questionId !== "string" || !questionId.trim()) {
      errors.push(`La respuesta ${index + 1} no identifica su pregunta.`);
      return;
    }

    if (answeredQuestions.has(questionId)) {
      errors.push(`La pregunta ${questionId} aparece más de una vez.`);
      return;
    }

    answeredQuestions.add(questionId);

    const question = questions.get(questionId);

    if (!question) {
      errors.push(`La pregunta ${questionId} no existe en el diagnóstico.`);
      return;
    }

    if (
      !Array.isArray(selectedOptions) ||
      !selectedOptions.every(
        (option): option is string =>
          typeof option === "string" && option.trim().length > 0
      )
    ) {
      errors.push(`Las opciones de la pregunta ${questionId} son inválidas.`);
      return;
    }

    if (new Set(selectedOptions).size !== selectedOptions.length) {
      errors.push(`La pregunta ${questionId} contiene opciones duplicadas.`);
    }

    if (question.obligatoria && selectedOptions.length === 0) {
      errors.push(`La pregunta ${questionId} es obligatoria.`);
    }

    // Las preguntas de selección única y escala
    // solamente pueden recibir una opción.
    if (
      question.tipo !== "seleccion_multiple" &&
      selectedOptions.length > 1
    ) {
      errors.push(
        `La pregunta ${questionId} solamente permite seleccionar una opción.`
      );
    }

    const validOptions = new Set(
      question.opciones.map((option) => option.opcion_id)
    );

    selectedOptions.forEach((optionId) => {
      if (!validOptions.has(optionId)) {
        errors.push(
          `La opción ${optionId} no pertenece a la pregunta ${questionId}.`
        );
      }
    });
  });

  // Comprueba que todas las preguntas obligatorias
  // estén presentes en las respuestas recibidas.
  content.preguntas.forEach((question) => {
    if (
      question.obligatoria &&
      !answeredQuestions.has(question.identificador)
    ) {
      errors.push(
        `No se respondió la pregunta obligatoria ${question.identificador}.`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida un resultado generado por el proceso
 * de evaluación del diagnóstico.
 */
export function validateDiagnosticEvaluationResult(
  result: unknown
) {
  return validateDiagnosticResult(result);
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

/**
 * Comprueba que una lista contenga exactamente los identificadores esperados,
 * sin elementos duplicados.
 */
function hasExpectedValues(
  received: unknown[],
  expected: string[]
): boolean {
  if (
    received.length !== expected.length ||
    !received.every((value) => typeof value === "string")
  ) {
    return false;
  }

  const receivedSet = new Set(received);

  return (
    receivedSet.size === expected.length &&
    expected.every((value) => receivedSet.has(value))
  );
}

/**
 * Obtiene y valida la configuración privada de evaluación.
 * Este módulo solo puede utilizarse desde el servidor.
 */
export function getDiagnosticPrivateEvaluation(): DiagnosticPrivateEvaluation {
  const configuration: unknown = diagnosticPrivateEvaluation;

  if (!isObject(configuration)) {
    throw new Error(
      "La configuración privada del diagnóstico tiene una estructura inválida."
    );
  }

  // Identificación y versiones.
  if (
    configuration.schema_version !== "1.0.0" ||
    configuration.evaluacion_id !== "evaluacion-diagnostico-vocacional" ||
    configuration.version_evaluacion !== "1.0.0"
  ) {
    throw new Error(
      "La versión o identificación de la evaluación privada no es válida."
    );
  }

  const evaluationConfig = configuration.configuracion;
  const privateRules = configuration.evaluacion_privada_backend;
  const laborConfig = configuration.configuracion_oferta_laboral;

  if (
    !isObject(evaluationConfig) ||
    !isObject(privateRules) ||
    !isObject(laborConfig)
  ) {
    throw new Error(
      "La configuración privada del diagnóstico está incompleta."
    );
  }

  // Escala de evaluación.
  if (
    typeof evaluationConfig.escala_minima !== "number" ||
    !Number.isFinite(evaluationConfig.escala_minima) ||
    typeof evaluationConfig.escala_maxima !== "number" ||
    !Number.isFinite(evaluationConfig.escala_maxima) ||
    evaluationConfig.escala_minima !== 1 ||
    evaluationConfig.escala_maxima !== 100
  ) {
    throw new Error(
      "La escala de evaluación debe estar definida entre 1 y 100."
    );
  }

  // Áreas evaluadas.
  if (
    !Array.isArray(evaluationConfig.areas_evaluadas) ||
    !hasExpectedValues(evaluationConfig.areas_evaluadas, VALID_AREAS)
  ) {
    throw new Error(
      "La configuración debe incluir las tres áreas válidas sin duplicados."
    );
  }

  // Dimensiones evaluadas.
  if (
    !Array.isArray(evaluationConfig.dimensiones_evaluadas) ||
    !hasExpectedValues(
      evaluationConfig.dimensiones_evaluadas,
      VALID_DIMENSIONS
    )
  ) {
    throw new Error(
      "La configuración debe incluir las tres dimensiones válidas sin duplicados."
    );
  }

  // Estructura de las reglas privadas.
  const privateArrays = [
    privateRules.respuestas_correctas,
    privateRules.ponderaciones,
    privateRules.reglas_calculo,
    privateRules.reglas_desempate,
  ];

  if (!privateArrays.every(Array.isArray)) {
    throw new Error(
      "Las reglas privadas de evaluación tienen una estructura inválida."
    );
  }

  // Configuración geográfica de la oferta laboral.
  if (
    laborConfig.alcance !== "municipal" ||
    laborConfig.estado !== "Jalisco" ||
    (laborConfig.municipio_id !== null &&
      (typeof laborConfig.municipio_id !== "string" ||
        !laborConfig.municipio_id.trim()))
  ) {
    throw new Error(
      "La configuración de oferta laboral no es válida."
    );
  }

  return configuration as unknown as DiagnosticPrivateEvaluation;
}

const VALID_CLASSIFICATIONS: DiagnosticClassification[] = [
  "principal",
  "complementaria",
  "exploratoria",
];

export interface DiagnosticResultValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Valida la estructura y consistencia de un resultado
 * antes de aceptarlo como resultado del diagnóstico.
 */
export function validateDiagnosticResult(
  submittedResult: unknown
): DiagnosticResultValidation {
  const errors: string[] = [];

  if (!isObject(submittedResult)) {
    return {
      valid: false,
      errors: ["El resultado del diagnóstico tiene una estructura inválida."],
    };
  }

  const evaluation = getDiagnosticPrivateEvaluation();
  const content = getDiagnosticContent();

  // Identificador y estado.
  if (
    typeof submittedResult.diagnostico_id !== "string" ||
    !submittedResult.diagnostico_id.trim()
  ) {
    errors.push(
      "El resultado no contiene un identificador de diagnóstico válido."
    );
  }

  if (submittedResult.estado !== "completado") {
    errors.push("El estado del diagnóstico no es válido.");
  }

  // Resultados por área.
  const resultsByArea = submittedResult.resultados;
  const validScores = new Map<DiagnosticAreaId, number>();

  if (!isObject(resultsByArea)) {
    errors.push("Las puntuaciones por área no tienen una estructura válida.");
  } else {
    VALID_AREAS.forEach((area) => {
      const areaResult = resultsByArea[area];

      if (
        !isObject(areaResult) ||
        typeof areaResult.puntuacion !== "number" ||
        !Number.isFinite(areaResult.puntuacion) ||
        areaResult.puntuacion < evaluation.configuracion.escala_minima ||
        areaResult.puntuacion > evaluation.configuracion.escala_maxima
      ) {
        errors.push(`La puntuación de ${area} no es válida.`);
      } else {
        validScores.set(area, areaResult.puntuacion);
      }
    });
  }

  // Ranking.
  const ranking = submittedResult.ranking;
  const rankingAreas = new Set<DiagnosticAreaId>();
  const rankingClassifications = new Set<DiagnosticClassification>();
  const rankingByArea = new Map<DiagnosticAreaId, DiagnosticClassification>();

  if (!Array.isArray(ranking) || ranking.length !== 3) {
    errors.push("El ranking debe contener exactamente tres áreas.");
  } else {
    ranking.forEach((item, index) => {
      if (!isObject(item)) {
        errors.push(`El elemento ${index + 1} del ranking es inválido.`);
        return;
      }

      const area = item.area_id;
      const classification = item.clasificacion;
      const score = item.puntuacion;

      if (
        typeof area !== "string" ||
        !VALID_AREAS.includes(area as DiagnosticAreaId)
      ) {
        errors.push(`El elemento ${index + 1} tiene un área inválida.`);
        return;
      }

      const areaId = area as DiagnosticAreaId;

      if (rankingAreas.has(areaId)) {
        errors.push(`El área ${areaId} está duplicada en el ranking.`);
      } else {
        rankingAreas.add(areaId);
      }

      if (
        typeof classification !== "string" ||
        !VALID_CLASSIFICATIONS.includes(
          classification as DiagnosticClassification
        )
      ) {
        errors.push(`El área ${areaId} tiene una clasificación inválida.`);
      } else {
        const validClassification =
          classification as DiagnosticClassification;

        if (rankingClassifications.has(validClassification)) {
          errors.push(
            `La clasificación ${validClassification} está repetida.`
          );
        } else {
          rankingClassifications.add(validClassification);
        }

        rankingByArea.set(areaId, validClassification);
      }

      if (
        typeof score !== "number" ||
        !Number.isFinite(score) ||
        score < evaluation.configuracion.escala_minima ||
        score > evaluation.configuracion.escala_maxima
      ) {
        errors.push(`La puntuación del área ${areaId} no es válida.`);
      } else if (
        validScores.has(areaId) &&
        validScores.get(areaId) !== score
      ) {
        errors.push(
          `La puntuación de ${areaId} no coincide con sus resultados.`
        );
      }
    });

    if (
      rankingAreas.size !== VALID_AREAS.length ||
      !VALID_AREAS.every((area) => rankingAreas.has(area))
    ) {
      errors.push("El ranking debe incluir las tres áreas sin repeticiones.");
    }

    if (
      rankingClassifications.size !== VALID_CLASSIFICATIONS.length ||
      !VALID_CLASSIFICATIONS.every((classification) =>
        rankingClassifications.has(classification)
      )
    ) {
      errors.push(
        "El ranking debe incluir las tres clasificaciones sin repeticiones."
      );
    }
  }

  // Información de desempate.
  const tie = submittedResult.empate;

  if (!isObject(tie)) {
    errors.push("La información de desempate no tiene una estructura válida.");
  } else {
    const hasTie = tie.has_tie;
    const tiedAreas = tie.tied_areas;
    const selectedArea = tie.selected_tiebreaker_area;

    if (
      typeof hasTie !== "boolean" ||
      !Array.isArray(tiedAreas) ||
      !(
        selectedArea === null ||
        typeof selectedArea === "string"
      )
    ) {
      errors.push("Los datos de desempate tienen una estructura inválida.");
    } else {
      const validTiedAreas = tiedAreas.every(
        (area): area is DiagnosticAreaId =>
          typeof area === "string" &&
          VALID_AREAS.includes(area as DiagnosticAreaId)
      );

      if (
        !validTiedAreas ||
        new Set(tiedAreas).size !== tiedAreas.length
      ) {
        errors.push("Las áreas involucradas en el empate no son válidas.");
      }

      if (!hasTie) {
        if (tiedAreas.length !== 0 || selectedArea !== null) {
          errors.push(
            "Un resultado sin empate no debe contener datos de desempate."
          );
        }
      } else {
        if (tiedAreas.length < 2) {
          errors.push("Un empate debe involucrar al menos dos áreas.");
        }

        if (selectedArea === null) {
          errors.push(
            "Debe indicarse el área seleccionada para resolver el empate."
          );
        } else if (
          !VALID_AREAS.includes(selectedArea as DiagnosticAreaId) ||
          !tiedAreas.includes(selectedArea as DiagnosticAreaId)
        ) {
          errors.push(
            "El área seleccionada para desempatar no pertenece al empate."
          );
        }

        if (validTiedAreas && tiedAreas.length >= 2) {
          const tiedScores = tiedAreas.map((area) => validScores.get(area));

          if (
            tiedScores.some((score) => score === undefined) ||
            new Set(tiedScores).size !== 1
          ) {
            errors.push(
              "Las áreas indicadas como empatadas deben tener la misma puntuación."
            );
          }

          if (rankingByArea.size === VALID_AREAS.length) {
            const tiedClassifications = tiedAreas
              .map((area) => rankingByArea.get(area))
              .filter(
                (classification): classification is DiagnosticClassification =>
                  classification !== undefined
              );

            if (
              tiedClassifications.length !== tiedAreas.length ||
              new Set(tiedClassifications).size !== 1
            ) {
              errors.push(
                "Las áreas empatadas deben compartir la misma clasificación."
              );
            }
          }
        }
      }
    }
  }

  // Intereses seleccionados.
  const selectedInterests = submittedResult.intereses_seleccionados;

  if (
    !Array.isArray(selectedInterests) ||
    !selectedInterests.every(
      (interest) =>
        typeof interest === "string" && interest.trim().length > 0
    )
  ) {
    errors.push("Los intereses seleccionados no tienen un formato válido.");
  } else {
    if (new Set(selectedInterests).size !== selectedInterests.length) {
      errors.push("Los intereses seleccionados no deben estar duplicados.");
    }

    const validInterestIds = new Set(
      content.catalogo_intereses.intereses.map(
        (interest) => interest.identificador
      )
    );

    selectedInterests.forEach((interestId) => {
      if (!validInterestIds.has(interestId)) {
        errors.push(
          `El interés ${interestId} no existe en el catálogo del diagnóstico.`
        );
      }
    });

    if (selectedInterests.length < 1 || selectedInterests.length > 3) {
      errors.push(
        "El resultado debe contener entre uno y tres intereses seleccionados."
      );
    }
  }

  // Ruta de aprendizaje.
  const learningRoute = submittedResult.ruta_aprendizaje;

  if (!isObject(learningRoute)) {
    errors.push("La ruta de aprendizaje no tiene una estructura válida.");
  } else if (Array.isArray(ranking) && ranking.length === 3) {
    const expectedRoute = {
      area_principal: ranking.find(
        (item) =>
          isObject(item) && item.clasificacion === "principal"
      )?.area_id,
      area_complementaria: ranking.find(
        (item) =>
          isObject(item) && item.clasificacion === "complementaria"
      )?.area_id,
      area_exploratoria: ranking.find(
        (item) =>
          isObject(item) && item.clasificacion === "exploratoria"
      )?.area_id,
    };

    if (
      learningRoute.area_principal !== expectedRoute.area_principal ||
      learningRoute.area_complementaria !== expectedRoute.area_complementaria ||
      learningRoute.area_exploratoria !== expectedRoute.area_exploratoria
    ) {
      errors.push(
        "La ruta de aprendizaje no coincide con las clasificaciones del ranking."
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export type DiagnosticAptitudeScores = Record<
  DiagnosticAreaId,
  { puntos: number; maximo: number }
>;

export function calculateDiagnosticAptitudeScores(
  answers: DiagnosticAnswer[]
): DiagnosticAptitudeScores {
  const scores: DiagnosticAptitudeScores = {
    robolab: { puntos: 0, maximo: 0 },
    electrolab: { puntos: 0, maximo: 0 },
    datalab: { puntos: 0, maximo: 0 },
  };

  const questions = getDiagnosticContent().preguntas.filter(
    (question) => question.dimension === "aptitudes"
  );

  if (questions.length === 0) return scores;

  const { respuestas_correctas } =
    getDiagnosticEvaluationConfig().evaluacion_privada_backend;

  const keysByQuestion = new Map<string, unknown>();

  for (const key of respuestas_correctas) {
    if (
      !isObject(key) ||
      typeof key.identificador_pregunta !== "string" ||
      keysByQuestion.has(key.identificador_pregunta)
    ) {
      throw new Error("Hay una clave de diagnóstico inválida o duplicada.");
    }

    keysByQuestion.set(key.identificador_pregunta, key.opciones_correctas);
  }

  const answersByQuestion = new Map(
    answers.map((answer) => [
      answer.identificador_pregunta,
      answer.opciones_seleccionadas,
    ])
  );

  for (const question of questions) {
    const correctOptions = keysByQuestion.get(question.identificador);
    const validOptions = new Set(
      question.opciones.map((option) => option.opcion_id)
    );

    if (
      !Array.isArray(correctOptions) ||
      correctOptions.length === 0 ||
      new Set(correctOptions).size !== correctOptions.length ||
      (question.tipo !== "seleccion_multiple" && correctOptions.length !== 1) ||
      !correctOptions.every(
        (option) => typeof option === "string" && validOptions.has(option)
      )
    ) {
      throw new Error(`Clave de evaluación inválida para ${question.identificador}.`);
    }

    const selected = new Set(answersByQuestion.get(question.identificador));
    const score = scores[question.area];
    score.maximo += question.ponderacion_maxima;

    if (
      selected.size === correctOptions.length &&
      correctOptions.every((option) => selected.has(option))
    ) {
      score.puntos += question.ponderacion_maxima;
    }
  }

  return scores;
}

export function validateDiagnosticInterests(
  selectedInterests: unknown
): DiagnosticAnswerValidation {
  const { seleccion, intereses } = getDiagnosticContent().catalogo_intereses;
  const { minimo, maximo } = seleccion;

  if (
    !Array.isArray(selectedInterests) ||
    selectedInterests.length < minimo ||
    selectedInterests.length > maximo
  ) {
    return {
      valid: false,
      errors: [`Debes seleccionar entre ${minimo} y ${maximo} intereses.`],
    };
  }

  const validIds = new Set(intereses.map(({ identificador }) => identificador));
  const seenIds = new Set<string>();
  const errors: string[] = [];

  for (const id of selectedInterests) {
    if (typeof id !== "string" || !validIds.has(id)) {
      errors.push("Uno de los intereses seleccionados no existe en el catálogo.");
    } else if (seenIds.has(id)) {
      errors.push(`El interés ${id} está repetido.`);
    } else {
      seenIds.add(id);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function calculateDiagnosticInterestScores(
  selectedInterests: readonly string[]
): Record<DiagnosticAreaId, number> {
  const scores: Record<DiagnosticAreaId, number> = {
    robolab: 0,
    electrolab: 0,
    datalab: 0,
  };

  const { seleccion, intereses } = getDiagnosticContent().catalogo_intereses;
  const interestsById = new Map(
    intereses.map((interest) => [interest.identificador, interest])
  );

  selectedInterests.forEach((id, index) => {
    const interest = interestsById.get(id);

    if (!interest || interest.areas_relacionadas.length === 0) {
      throw new Error(`El interés ${id} no tiene áreas válidas.`);
    }

    const pointsPerArea =
      (seleccion.maximo - index) / interest.areas_relacionadas.length;

    for (const area of interest.areas_relacionadas) {
      scores[area] += pointsPerArea;
    }
  });

  return scores;
}

export type DiagnosticPreliminaryRanking = Array<{
  puntuacion: number;
  areas: DiagnosticAreaId[];
}>;

export function getDiagnosticBusinessPresence(): Record<DiagnosticAreaId, number> | null {
  const configuracion: unknown =
    diagnosticPrivateEvaluation.configuracion_oferta_laboral;

  if (!isObject(configuracion) || !configuracion.municipio_id) return null;

  const presencia = configuracion.presencia_empresarial;
  if (!isObject(presencia) || !isObject(presencia.conteos)) return null;

  const { robolab, electrolab, datalab } = presencia.conteos;

  if (
    typeof robolab !== "number" || !Number.isFinite(robolab) || robolab < 0 ||
    typeof electrolab !== "number" || !Number.isFinite(electrolab) || electrolab < 0 ||
    typeof datalab !== "number" || !Number.isFinite(datalab) || datalab < 0
  ) {
    return null;
  }

  const total = robolab + electrolab + datalab;
  if (!Number.isFinite(total) || total <= 0) return null;

  return {
    robolab: (robolab / total) * 100,
    electrolab: (electrolab / total) * 100,
    datalab: (datalab / total) * 100,
  };
}

export function calculateDiagnosticPreliminaryRanking(
  aptitudes: DiagnosticAptitudeScores,
  intereses: Record<DiagnosticAreaId, number>,
  presenciaEmpresarial: Record<DiagnosticAreaId, number> | null = null
): DiagnosticPreliminaryRanking {
  const totalIntereses = VALID_AREAS.reduce(
    (total, area) => total + intereses[area],
    0
  );


  const resultados = VALID_AREAS.map((area) => {
    const { puntos, maximo } = aptitudes[area];
    const aptitudNormalizada = maximo > 0 ? (puntos / maximo) * 100 : 0;
    const interesNormalizado =
      totalIntereses > 0 ? (intereses[area] / totalIntereses) * 100 : 0;

    const combinado = presenciaEmpresarial
      ? 0.45 * aptitudNormalizada +
        0.30 * interesNormalizado +
        0.25 * presenciaEmpresarial[area]
      : 0.60 * aptitudNormalizada + 0.40 * interesNormalizado;

    return {
      area,
      puntuacion: Number((1 + 0.99 * combinado).toFixed(2)),
      aptitudNormalizada,
      interesNormalizado,
    };
  });

  resultados.sort(
    (a, b) =>
      b.puntuacion - a.puntuacion ||
      b.aptitudNormalizada - a.aptitudNormalizada ||
      b.interesNormalizado - a.interesNormalizado
  );

  const ranking: DiagnosticPreliminaryRanking = [];
  

  for (const [index, actual] of resultados.entries()) {
    const anterior = resultados[index - 1];
    const ultimoGrupo = ranking[ranking.length - 1];

    if (
      anterior &&
      ultimoGrupo &&
      anterior.puntuacion === actual.puntuacion &&
      anterior.aptitudNormalizada === actual.aptitudNormalizada &&
      anterior.interesNormalizado === actual.interesNormalizado
    ) {
      ultimoGrupo.areas.push(actual.area);
    } else {
      ranking.push({
        puntuacion: actual.puntuacion,
        areas: [actual.area],
      });
    }
  }

  return ranking;
}
