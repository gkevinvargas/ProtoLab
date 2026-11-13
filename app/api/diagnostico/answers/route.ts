import {
  calculateDiagnosticAptitudeScores,
  calculateDiagnosticInterestScores,
  calculateDiagnosticPreliminaryRanking,
  getDiagnosticBusinessPresence,
  validateDiagnosticAnswers,
  validateDiagnosticInterests,
  type DiagnosticAnswer,
} from "@/lib/diagnostico/diagnostic-engine";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        valid: false,
        errors: ["El cuerpo de la solicitud no contiene JSON válido."],
      },
      { status: 400 }
    );
  }

  const payload =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const { answers, selectedInterests } = payload;

  try {
    const answerValidation = validateDiagnosticAnswers(answers);
    const interestValidation = validateDiagnosticInterests(selectedInterests);

    if (!answerValidation.valid || !interestValidation.valid) {
      return Response.json(
        {
          valid: false,
          errors: [...answerValidation.errors, ...interestValidation.errors],
        },
        { status: 400 }
      );
    }

    const aptitudes = calculateDiagnosticAptitudeScores(
      answers as DiagnosticAnswer[]
    );
    const intereses = calculateDiagnosticInterestScores(
      selectedInterests as string[]
    );
    const presenciaEmpresarial = getDiagnosticBusinessPresence();
    const rankingPreliminar = calculateDiagnosticPreliminaryRanking(
      aptitudes,
      intereses,
      presenciaEmpresarial
    );

    return Response.json(
      {
        valid: true,
        message: "Las respuestas y los intereses se validaron correctamente.",
        aptitudes,
        intereses,
        presenciaEmpresarial,
        rankingPreliminar,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al procesar las respuestas del diagnóstico:", error);

    return Response.json(
      {
        valid: false,
        errors: ["No fue posible procesar el diagnóstico."],
      },
      { status: 500 }
    );
  }
}