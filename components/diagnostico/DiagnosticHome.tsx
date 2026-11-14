"use client";

import { useEffect, useState } from "react";

import diagnosticPublicContent from "@/data/diagnostico/diagnostic-public.json";

import type {
  DiagnosticPublicContent,
  DiagnosticDimensionId,
  DiagnosticQuestion,
  DiagnosticAreaId,
} from "@/lib/diagnostico/diagnostic-types";

import type {
  DiagnosticAnswer,
  DiagnosticAptitudeScores,
  DiagnosticPreliminaryRanking,
} from "@/lib/diagnostico/diagnostic-engine";

const content =
  diagnosticPublicContent as unknown as DiagnosticPublicContent;

const dimensions: {
  id: DiagnosticDimensionId;
  number: string;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    id: "intereses",
    number: "01",
    title: "Intereses",
    description: "Identifica las actividades y áreas que despiertan tu interés.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "aptitudes",
    number: "02",
    title: "Aptitudes",
    description: "Reconoce tus habilidades y capacidades.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "oferta_laboral",
    number: "03",
    title: "Oferta laboral",
    description: "Conoce las oportunidades laborales disponibles en tu región.",
    color: "bg-emerald-100 text-emerald-700",
  },
];

const laboratorios = [
  ["robolab", "RoboLab"],
  ["electrolab", "ElectroLab"],
  ["datalab", "DataLab"],
] as const;

const nombresLaboratorios = Object.fromEntries(laboratorios);
const clasificaciones = ["Principal", "Complementaria", "Exploratoria"];
const pasosAprendizaje = ["Empieza en", "Complementa con"];

const CLAVE_RUTA_APRENDIZAJE = "protolab:ruta-aprendizaje";
const CLAVE_RUTA_PROVISIONAL = "protolab:ruta-aprendizaje:provisional";

type PuntajesDiagnostico = {
  aptitudes: DiagnosticAptitudeScores;
  intereses: Record<DiagnosticAreaId, number>;
  presenciaEmpresarial: Record<DiagnosticAreaId, number> | null;
  rankingPreliminar: DiagnosticPreliminaryRanking;
};

type RutaProvisional = {
  version: 1;
  orden: [DiagnosticAreaId, DiagnosticAreaId, DiagnosticAreaId];
  puntajes: PuntajesDiagnostico;
  prioridadesEmpate: DiagnosticAreaId[];
  selectedInterests: string[];
  answers: DiagnosticAnswer[];
  guardadaEn: string;
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esAreaDiagnostica(valor: unknown): valor is DiagnosticAreaId {
  return valor === "robolab" || valor === "electrolab" || valor === "datalab";
}

function esRegistroDePuntajes(
  valor: unknown
): valor is Record<DiagnosticAreaId, number> {
  return (
    esObjeto(valor) &&
    ["robolab", "electrolab", "datalab"].every(
      (area) =>
        typeof valor[area] === "number" &&
        Number.isFinite(valor[area])
    )
  );
}

function esRespuestaDiagnostica(valor: unknown): valor is DiagnosticAnswer {
  return (
    esObjeto(valor) &&
    typeof valor.identificador_pregunta === "string" &&
    Array.isArray(valor.opciones_seleccionadas) &&
    valor.opciones_seleccionadas.every(
      (opcion) => typeof opcion === "string"
    )
  );
}

function esPuntajeDeAptitud(
  valor: unknown
): valor is { puntos: number; maximo: number } {
  return (
    esObjeto(valor) &&
    typeof valor.puntos === "number" &&
    Number.isFinite(valor.puntos) &&
    typeof valor.maximo === "number" &&
    Number.isFinite(valor.maximo)
  );
}

function esPuntajesDiagnostico(
  valor: unknown
): valor is PuntajesDiagnostico {
  if (!esObjeto(valor)) return false;

  const aptitudes = valor.aptitudes;

  if (!esObjeto(aptitudes)) return false;

  const areas: DiagnosticAreaId[] = [
    "robolab",
    "electrolab",
    "datalab",
  ];

  const aptitudesValidas = areas.every((area) =>
    esPuntajeDeAptitud(aptitudes[area])
  );

  const presenciaEmpresarial = valor.presenciaEmpresarial;

  const presenciaValida =
    presenciaEmpresarial === null ||
    esRegistroDePuntajes(presenciaEmpresarial);

  const ranking = valor.rankingPreliminar;

  const rankingValido =
    Array.isArray(ranking) &&
    ranking.every(
      (grupo) =>
        esObjeto(grupo) &&
        typeof grupo.puntuacion === "number" &&
        Number.isFinite(grupo.puntuacion) &&
        Array.isArray(grupo.areas) &&
        grupo.areas.length > 0 &&
        grupo.areas.every(esAreaDiagnostica)
    );

  return (
    aptitudesValidas &&
    esRegistroDePuntajes(valor.intereses) &&
    presenciaValida &&
    rankingValido
  );
}

/**
 * Recupera y valida la ruta provisional almacenada en este navegador.
 * No realiza ninguna petición al servidor, por lo que funciona sin internet.
 */
function leerRutaProvisional(): RutaProvisional | null {
  try {
    const guardada = localStorage.getItem(CLAVE_RUTA_PROVISIONAL);
    if (!guardada) return null;

    const datos: unknown = JSON.parse(guardada);

    if (!esObjeto(datos)) return null;

    const ordenValido =
      Array.isArray(datos.orden) &&
      datos.orden.length === 3 &&
      datos.orden.every(esAreaDiagnostica) &&
      new Set(datos.orden).size === 3;

    const ranking = esPuntajesDiagnostico(datos.puntajes)
      ? datos.puntajes.rankingPreliminar.flatMap((grupo) => grupo.areas)
      : [];

    const rankingValido =
      ranking.length === 3 &&
      ranking.every(esAreaDiagnostica) &&
      new Set(ranking).size === 3;

    const prioridadesValidas =
      Array.isArray(datos.prioridadesEmpate) &&
      datos.prioridadesEmpate.every(esAreaDiagnostica) &&
      new Set(datos.prioridadesEmpate).size === datos.prioridadesEmpate.length;

    const interesesValidos =
      Array.isArray(datos.selectedInterests) &&
      datos.selectedInterests.every(
        (interes) => typeof interes === "string"
      );

    const respuestasValidas =
      Array.isArray(datos.answers) &&
      datos.answers.every(esRespuestaDiagnostica);

    if (
      datos.version !== 1 ||
      !ordenValido ||
      !esPuntajesDiagnostico(datos.puntajes) ||
      !rankingValido ||
      !prioridadesValidas ||
      !interesesValidos ||
      !respuestasValidas ||
      typeof datos.guardadaEn !== "string"
    ) {
      return null;
    }

    return datos as unknown as RutaProvisional;
  } catch {
    return null;
  }
}

export default function DiagnosticHome() {
  const [step, setStep] = useState<"interests" | "questions">("interests");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);

  const [showValidation, setShowValidation] = useState(false);

  const [puntajes, setPuntajes] = useState<PuntajesDiagnostico | null>(null);

  const [mensajeRuta, setMensajeRuta] = useState("");

  const [prioridadesEmpate, setPrioridadesEmpate] = useState<DiagnosticAreaId[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [serverErrors, setServerErrors] = useState<string[]>([]);

  // Recuperar una ruta provisional al volver a abrir el diagnóstico.
  useEffect(() => {
    const provisional = leerRutaProvisional();

    if (!provisional) return;

    setStep("questions");
    setSelectedInterests(provisional.selectedInterests);
    setAnswers(provisional.answers);
    setPuntajes(provisional.puntajes);
    setPrioridadesEmpate(provisional.prioridadesEmpate);
    setMensajeRuta(
      "Recuperamos tu ruta provisional guardada en este dispositivo. Puedes confirmarla para continuar."
    );
  }, []);

  let posicionInicial = 0;
  const gruposRanking = (puntajes?.rankingPreliminar ?? []).map(({ puntuacion, areas }) => {
    const elegidas = prioridadesEmpate.filter((area) => areas.includes(area));
    const pendientes = areas.filter((area) => !elegidas.includes(area));
    const ordenadas = pendientes.length <= 1 ? [...elegidas, ...pendientes] : elegidas;
    const grupo = { puntuacion, areas, pendientes, ordenadas, posicionInicial };

    posicionInicial += areas.length;
    return grupo;
  });
  const ordenAprendizaje = gruposRanking.flatMap(({ ordenadas }) => ordenadas);
  const rutaLista = ordenAprendizaje.length === laboratorios.length;
  const ordenRutaKey = ordenAprendizaje.join("|");

  // Guardar automáticamente la ruta completa cuando se genera.
  // El almacenamiento local no requiere conexión a internet.
  useEffect(() => {
    if (!puntajes || !rutaLista) return;

    try {
      const orden = ordenRutaKey.split("|") as [
        DiagnosticAreaId,
        DiagnosticAreaId,
        DiagnosticAreaId
      ];

      const provisional: RutaProvisional = {
        version: 1,
        orden,
        puntajes,
        prioridadesEmpate,
        selectedInterests,
        answers,
        guardadaEn: new Date().toISOString(),
      };

      localStorage.setItem(
        CLAVE_RUTA_PROVISIONAL,
        JSON.stringify(provisional)
      );

      setMensajeRuta(
        "Ruta guardada provisionalmente en este dispositivo. Confírmala para activar tu ruta de aprendizaje."
      );
    } catch {
      setMensajeRuta(
        "No se pudo guardar provisionalmente la ruta. Comprueba el almacenamiento del navegador."
      );
    }
  }, [
    puntajes,
    rutaLista,
    ordenRutaKey,
    prioridadesEmpate,
    selectedInterests,
    answers,
  ]);

  function guardarRuta() {
    if (!rutaLista) return;

    try {
      // Se prefiere la copia provisional para confirmar exactamente
      // la ruta que se guardó automáticamente.
      const provisional = leerRutaProvisional();
      const orden = provisional?.orden ?? ordenAprendizaje;

      if (
        orden.length !== laboratorios.length ||
        !orden.every(esAreaDiagnostica) ||
        new Set(orden).size !== laboratorios.length
      ) {
        setMensajeRuta(
          "La ruta provisional no es válida. Vuelve a generar el diagnóstico."
        );
        return;
      }

      // Se conserva el formato de dos áreas que ya utiliza ProtoLab.
      localStorage.setItem(
        CLAVE_RUTA_APRENDIZAJE,
        JSON.stringify(orden.slice(0, 2))
      );

      // La copia provisional se elimina únicamente después de confirmar.
      localStorage.removeItem(CLAVE_RUTA_PROVISIONAL);

      setMensajeRuta(
        "¡Ruta confirmada correctamente! Ya puedes comenzar tu aprendizaje."
      );
    } catch {
      setMensajeRuta(
        "No se pudo confirmar la ruta. Inténtalo nuevamente."
      );
    }
  }

  const interests = content.catalogo_intereses.intereses;
  const questions = content.preguntas;

  const minimum = content.catalogo_intereses.seleccion.minimo;
  const maximum = content.catalogo_intereses.seleccion.maximo;

  const canContinue =
    selectedInterests.length >= minimum &&
    selectedInterests.length <= maximum &&
    questions.length > 0;

  function toggleInterest(interestId: string) {
    setSelectedInterests((current) => {
      if (current.includes(interestId)) {
        return current.filter((id) => id !== interestId);
      }

      if (current.length >= maximum) {
        return current;
      }

      return [...current, interestId];
    });

    setPuntajes(null);
    setPrioridadesEmpate([]);
    setMensajeRuta("");
    setServerErrors([]);

    try {
      localStorage.removeItem(CLAVE_RUTA_PROVISIONAL);
    } catch {
      // La validación y el guardado mostrarán el error si el almacenamiento falla.
    }
  }

  function handleContinue() {
    if (!canContinue) return;

    try {
      localStorage.removeItem(CLAVE_RUTA_PROVISIONAL);
    } catch {
      // No se interrumpe el diagnóstico si el navegador bloquea el almacenamiento.
    }

    setStep("questions");
    setShowValidation(false);
    setPuntajes(null);
    setServerErrors([]);
  }

  function getAnswer(questionId: string): DiagnosticAnswer | undefined {
    return answers.find(
      (answer) => answer.identificador_pregunta === questionId
    );
  }

  function updateAnswer(
    question: DiagnosticQuestion,
    optionId: string
  ) {
    setPuntajes(null);
    setPrioridadesEmpate([]);
    setMensajeRuta("");
    setServerErrors([]);

    try {
      localStorage.removeItem(CLAVE_RUTA_PROVISIONAL);
    } catch {
      // No se interrumpe la edición de respuestas.
    }

    setAnswers((current) => {
      const existing = current.find(
        (answer) =>
          answer.identificador_pregunta === question.identificador
      );

      let selectedOptions: string[];

      if (question.tipo === "seleccion_multiple") {
        const previousOptions = existing?.opciones_seleccionadas ?? [];

        selectedOptions = previousOptions.includes(optionId)
          ? previousOptions.filter((id) => id !== optionId)
          : [...previousOptions, optionId];
      } else {
        selectedOptions = [optionId];
      }

      const updatedAnswer: DiagnosticAnswer = {
        identificador_pregunta: question.identificador,
        opciones_seleccionadas: selectedOptions,
      };

      if (existing) {
        return current.map((answer) =>
          answer.identificador_pregunta === question.identificador
            ? updatedAnswer
            : answer
        );
      }

      return [...current, updatedAnswer];
    });
  }

  function isQuestionAnswered(question: DiagnosticQuestion) {
    const answer = getAnswer(question.identificador);

    return Boolean(answer && answer.opciones_seleccionadas.length > 0);
  }

  const unansweredRequiredQuestions = questions.filter(
    (question) => question.obligatoria && !isQuestionAnswered(question)
  );

  async function handleFinish() {
    setShowValidation(true);

    if (unansweredRequiredQuestions.length > 0 || isSubmitting) {
      setPuntajes(null);
      return;
    }

    setPrioridadesEmpate([]);
    setMensajeRuta("");
    setIsSubmitting(true);
    setPuntajes(null);
    setServerErrors([]);

    try {
      const response = await fetch("/api/diagnostico/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          selectedInterests,
        }),
      });

      const result: {
        valid?: boolean;
        errors?: unknown;
        aptitudes?: DiagnosticAptitudeScores;
        intereses?: Record<DiagnosticAreaId, number>;
        presenciaEmpresarial?: Record<DiagnosticAreaId, number> | null;
        rankingPreliminar?: DiagnosticPreliminaryRanking;
      } | null = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.valid !== true ||
        !result.aptitudes ||
        !result.intereses ||
        !Array.isArray(result.rankingPreliminar)
      ) {
        const errors = Array.isArray(result?.errors)
          ? result.errors.filter(
              (error): error is string => typeof error === "string"
            )
          : ["No fue posible validar las respuestas."];

        setServerErrors(errors);
        return;
      }

      setPuntajes({
        aptitudes: result.aptitudes,
        intereses: result.intereses,
        presenciaEmpresarial: result.presenciaEmpresarial ?? null,
        rankingPreliminar: result.rankingPreliminar,
      });
    } catch {
      setServerErrors([
        "No fue posible conectar con el servidor. Inténtalo nuevamente.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderQuestion(question: DiagnosticQuestion, index: number) {
    const answer = getAnswer(question.identificador);

    const selectedOptions = answer?.opciones_seleccionadas ?? [];

    const unanswered =
      showValidation &&
      question.obligatoria &&
      selectedOptions.length === 0;

    return (
      <article
        key={question.identificador}
        className={`rounded-xl border p-5 ${
          unanswered
            ? "border-red-300 bg-red-50/40"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Pregunta {index + 1}
          </span>

          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {question.area}
          </span>

          {question.obligatoria && (
            <span className="text-xs font-medium text-red-600">
              Obligatoria
            </span>
          )}
        </div>

        <h3 className="font-semibold leading-6 text-slate-800">
          {question.enunciado}
        </h3>

        <p className="mt-2 text-xs text-slate-500">
          {question.tipo === "seleccion_multiple"
            ? "Puedes seleccionar varias opciones."
            : "Selecciona una opción."}
        </p>

        <div className="mt-4 grid gap-3">
          {question.opciones.map((option) => {
            const selected = selectedOptions.includes(option.opcion_id);

            return (
              <button
                key={option.opcion_id}
                type="button"
                onClick={() =>
                  updateAnswer(question, option.opcion_id)
                }
                disabled={isSubmitting}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm font-medium text-slate-700">
                  {option.texto}
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${
                    question.tipo === "seleccion_multiple"
                      ? "rounded-md"
                      : "rounded-full"
                  } ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        {unanswered && (
          <p className="mt-3 text-sm text-red-600">
            Debes responder esta pregunta.
          </p>
        )}
      </article>
    );
  }

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            PROTOLAB / DIAGNÓSTICO VOCACIONAL
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Descubre tu área de mayor afinidad
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Este diagnóstico te ayudará a identificar qué área se relaciona
            mejor con tus intereses, aptitudes y las oportunidades laborales
            disponibles.
          </p>
        </header>

        {step === "interests" ? (
          <>
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                ¿Cómo funciona?
              </h2>

              <p className="mt-2 text-slate-600">
                El diagnóstico considera tres dimensiones para generar
                recomendaciones relacionadas con los laboratorios de ProtoLab.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {dimensions.map((dimension) => (
                  <article
                    key={dimension.number}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <span
                      className={`inline-flex rounded-lg px-3 py-1 text-sm font-bold ${dimension.color}`}
                    >
                      {dimension.number}
                    </span>

                    <h3 className="mt-4 font-semibold text-slate-800">
                      {dimension.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {dimension.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Selecciona tus intereses
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    Elige entre {minimum} y {maximum} intereses que representen
                    tus preferencias.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {selectedInterests.length} de {maximum} seleccionados
                </span>
              </div>

              {interests.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="font-medium text-slate-700">
                    El catálogo de intereses todavía no está disponible.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Las opciones aparecerán aquí cuando se integre el contenido
                    definitivo del diagnóstico.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {interests.map((interest) => {
                    const selected = selectedInterests.includes(
                      interest.identificador
                    );

                    const disabled =
                      !selected && selectedInterests.length >= maximum;

                    return (
                      <button
                        key={interest.identificador}
                        type="button"
                        onClick={() =>
                          toggleInterest(interest.identificador)
                        }
                        disabled={disabled}
                        aria-pressed={selected}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        } ${
                          disabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-800">
                            {interest.etiqueta}
                          </span>

                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Puedes seleccionar hasta {maximum} intereses.
                </p>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Continuar
                </button>
              </div>

              {interests.length > 0 && questions.length === 0 && (
                <p className="mt-3 text-sm text-amber-700">
                  El cuestionario todavía no está disponible porque faltan
                  integrar las preguntas.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-semibold text-slate-800">
                ¿Qué obtendrás?
              </h2>

              <p className="mt-2 text-slate-600">
                Al finalizar, recibirás un ranking de afinidad y una ruta de
                aprendizaje con áreas principal, complementaria y exploratoria.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Cuestionario vocacional
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    Responde las preguntas de las tres dimensiones.
                    Puedes revisar y modificar tus respuestas antes de finalizar.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  {answeredCount} de {questions.length} respondidas
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${
                      questions.length > 0
                        ? (answeredCount / questions.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </section>

            <div className="space-y-8">
              {dimensions.map((dimension) => {
                const dimensionQuestions = questions.filter(
                  (question) => question.dimension === dimension.id
                );

                if (dimensionQuestions.length === 0) return null;

                return (
                  <section key={dimension.id}>
                    <div className="mb-4">
                      <span
                        className={`inline-flex rounded-lg px-3 py-1 text-sm font-bold ${dimension.color}`}
                      >
                        {dimension.number}
                      </span>

                      <h2 className="mt-3 text-2xl font-bold text-slate-800">
                        {dimension.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {dimension.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {dimensionQuestions.map((question, index) =>
                        renderQuestion(question, index)
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {showValidation && unansweredRequiredQuestions.length > 0 && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  Hay preguntas obligatorias sin responder.
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Te faltan {unansweredRequiredQuestions.length} preguntas
                  obligatorias.
                </p>
              </div>
            )}

            {serverErrors.length > 0 && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  No fue posible validar las respuestas.
                </p>

                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-600">
                  {serverErrors.map((error, index) => (
                    <li key={`${index}-${error}`}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {puntajes && (
              <section
                aria-live="polite"
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <h2 className="font-semibold text-emerald-900">
                  Puntajes por laboratorio
                </h2>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {laboratorios.map(([area, nombre]) => (
                    <div key={area} className="rounded-lg bg-white p-3">
                      <h3 className="font-semibold text-slate-800">{nombre}</h3>
                      <p className="mt-1 text-sm text-slate-700">
                        Aptitudes: {puntajes.aptitudes[area].puntos} de{" "}
                        {puntajes.aptitudes[area].maximo}
                      </p>
                      <p className="text-sm text-slate-700">
                        Intereses:{" "}
                        {puntajes.intereses[area].toLocaleString("es-MX", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        puntos
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {puntajes && (
              <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="font-semibold text-slate-900">
                  {puntajes.presenciaEmpresarial
                    ? "Ranking vocacional"
                    : "Ranking vocacional preliminar"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {puntajes.presenciaEmpresarial
                    ? "30 % intereses, 45 % aptitudes y 25 % presencia empresarial. Fuente: INEGI · DENUE, Zapopan, mayo de 2026."
                    : "40 % intereses y 60 % aptitudes. Presencia empresarial pendiente."}
                </p>

                <ol className="mt-3 space-y-3">
                  {gruposRanking.flatMap(({ puntuacion, areas, pendientes, ordenadas, posicionInicial }) => {
                    const filas = ordenadas.map((area, posicion) => (
                      <li key={area} className="rounded-lg bg-slate-50 p-3">
                        <p className="font-medium text-slate-900">
                          {clasificaciones[posicionInicial + posicion]}
                          {" · "}
                          {nombresLaboratorios[area]}
                        </p>
                        <p className="text-sm text-slate-700">
                          {puntuacion.toFixed(2)} de 100
                        </p>
                      </li>
                    ));

                    if (pendientes.length > 1) {
                      filas.push(
                        <li key={`empate-${areas.join("-")}`} className="rounded-lg bg-amber-50 p-3">
                          <p className="text-sm font-medium text-slate-900">
                            Empate con {puntuacion.toFixed(2)} puntos. Elige qué
                            laboratorio quieres priorizar.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pendientes.map((area) => (
                              <button
                                key={area}
                                type="button"
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                onClick={() =>
                                  setPrioridadesEmpate((actuales) =>
                                    actuales.includes(area) ? actuales : [...actuales, area]
                                  )
                                }
                              >
                                {nombresLaboratorios[area]}
                              </button>
                            ))}
                          </div>
                        </li>
                      );
                    }

                    return filas;
                  })}
                </ol>
              </section>
            )}

            {puntajes && (
              <section
                aria-labelledby="ruta-aprendizaje"
                className="mt-6 rounded-xl border border-slate-200 bg-white p-4"
              >
                <h2 id="ruta-aprendizaje" className="font-semibold text-slate-900">
                  Ruta de aprendizaje recomendada
                </h2>
                {rutaLista ? (
                  <>
                    <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                      {ordenAprendizaje.slice(0, 2).map((area, posicion) => (
                        <li key={area} className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm text-slate-600">
                            {pasosAprendizaje[posicion]}
                          </p>
                          <p className="font-medium text-slate-900">
                            {nombresLaboratorios[area]}
                          </p>
                        </li>
                      ))}
                    </ol>

                    <p className="mt-3 text-sm text-slate-600">
                      Área exploratoria · {nombresLaboratorios[ordenAprendizaje[2]]}.
                      Disponible en Mis módulos, fuera del avance de la ruta.
                    </p>
                    <button
                      type="button"
                      onClick={guardarRuta}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Confirmar ruta de aprendizaje
                    </button>
                    <p role="status" className="mt-2 text-sm text-slate-600">
                      {mensajeRuta}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    Resuelve el empate del ranking para ver tu ruta.
                  </p>
                )}
              </section>
            )}

            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStep("interests");
                  setShowValidation(false);
                  setPuntajes(null);
                  setServerErrors([]);
                }}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Volver a intereses
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting
                  ? "Calculando puntaje..."
                  : "Calcular puntaje"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
