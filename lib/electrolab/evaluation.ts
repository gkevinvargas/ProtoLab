import type {
  ComponentType,
  EditorCircuitState,
  ElectroLabPractice,
  EvaluationCriterion,
  EvaluationCriterionResult,
  PracticeEvaluationResult,
} from './types';
import type { SimulationResult } from './simulation';
import type { RCTransientResult } from './transient';

export type PracticeAnalysisResult =
  | { mode: 'dc'; result: SimulationResult }
  | { mode: 'rc'; result: RCTransientResult };

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('es-MX');
}

function normalizeConnectionEndpoint(reference: string, terminalId: string) {
  return `${reference.trim().toLocaleUpperCase('es-MX')}:${terminalId}`;
}

function connectionKey(first: string, second: string) {
  return [first, second].sort().join('|');
}

function getConnectionKeys(editorState: EditorCircuitState) {
  const referenceById = new Map(editorState.components.map((component) => [component.id, component.reference]));
  return editorState.connections.map((connection) => {
    const fromReference = referenceById.get(connection.from.componentId);
    const toReference = referenceById.get(connection.to.componentId);
    if (!fromReference || !toReference) return null;
    return connectionKey(
      normalizeConnectionEndpoint(fromReference, connection.from.side),
      normalizeConnectionEndpoint(toReference, connection.to.side),
    );
  }).filter((key): key is string => key !== null);
}

function result(
  criterion: EvaluationCriterion,
  passed: boolean,
  feedback: string,
): EvaluationCriterionResult {
  return {
    id: criterion.id,
    title: criterion.title,
    description: criterion.description,
    pointsEarned: passed ? criterion.points : 0,
    pointsPossible: criterion.points,
    passed,
    feedback,
  };
}

function evaluateCriterion(
  criterion: EvaluationCriterion,
  editorState: EditorCircuitState,
  analysis: PracticeAnalysisResult,
): EvaluationCriterionResult {
  switch (criterion.type) {
    case 'component-count': {
      const expectedEntries = Object.entries(criterion.expectedCounts) as [ComponentType, number][];
      const checks = expectedEntries.map(([type, expected]) => {
        const actual = editorState.components.filter((component) => component.kind === type).length;
        return { type, expected, actual, passed: actual === expected };
      });
      const countsMatch = checks.every((check) => check.passed);
      const expectedTotal = checks.reduce((sum, check) => sum + check.expected, 0);
      const exactMatch = !criterion.exact || editorState.components.length === expectedTotal;
      const passed = countsMatch && exactMatch;
      const detail = checks.map((check) => `${check.type}: ${check.actual}/${check.expected}`).join(', ');
      return result(
        criterion,
        passed,
        passed
          ? `Se encontraron las cantidades esperadas (${detail}).`
          : `Cantidades encontradas: ${detail}.${criterion.exact && !exactMatch ? ` Hay ${editorState.components.length - expectedTotal} componente(s) adicional(es) o faltante(s).` : ''}`,
      );
    }

    case 'component-value': {
      const component = editorState.components.find(
        (item) => normalizeText(item.reference) === normalizeText(criterion.reference),
      );
      if (!component) {
        return result(criterion, false, `No se encontró el componente ${criterion.reference}.`);
      }
      const actualValue = Number(component.value.trim().replace(',', '.'));
      const tolerance = criterion.tolerance ?? 0.01;
      const passed = Number.isFinite(actualValue)
        && component.unit === criterion.unit
        && Math.abs(actualValue - criterion.expectedValue) <= tolerance;
      return result(
        criterion,
        passed,
        passed
          ? `${criterion.reference} tiene el valor esperado de ${criterion.expectedValue} ${criterion.unit}.`
          : `${criterion.reference}: se esperaba ${criterion.expectedValue} ${criterion.unit} (±${tolerance}), pero se encontró ${component.value} ${component.unit}.`,
      );
    }

    case 'connection-topology': {
      const actualKeys = getConnectionKeys(editorState);
      const expectedKeys = criterion.expectedConnections.map((connection) => connectionKey(
        normalizeConnectionEndpoint(connection.from.reference, connection.from.terminalId),
        normalizeConnectionEndpoint(connection.to.reference, connection.to.terminalId),
      ));
      const actualSet = new Set(actualKeys);
      const expectedSet = new Set(expectedKeys);
      const allExpectedExist = expectedKeys.every((key) => actualSet.has(key));
      const exactMatch = !criterion.exact || (actualSet.size === expectedSet.size && actualKeys.length === expectedKeys.length);
      const passed = allExpectedExist && exactMatch;
      return result(
        criterion,
        passed,
        passed
          ? `Las ${expectedKeys.length} conexiones coinciden con la topología solicitada.`
          : `Se encontraron ${actualKeys.length} conexiones; se requieren ${expectedKeys.length} conexiones específicas. Revisa los terminales indicados en las instrucciones.`,
      );
    }

    case 'analysis-status': {
      const status = analysis.result.status;
      const passed = status !== 'error';
      return result(
        criterion,
        passed,
        passed
          ? `El análisis ${analysis.mode.toUpperCase()} terminó sin errores bloqueantes${status === 'warning' ? '; consulta las advertencias de la simulación.' : '.'}`
          : 'La simulación terminó con errores y no puede considerarse válida para esta práctica.',
      );
    }

    case 'dc-state': {
      if (analysis.mode !== 'dc') {
        return result(criterion, false, 'Este criterio requiere una simulación de corriente continua (DC).');
      }
      const measurement = analysis.result.measurements.find(
        (item) => normalizeText(item.reference) === normalizeText(criterion.reference),
      );
      const passed = !!measurement?.state
        && normalizeText(measurement.state) === normalizeText(criterion.expectedState);
      return result(
        criterion,
        passed,
        passed
          ? `${criterion.reference} presenta el estado esperado: ${criterion.expectedState}.`
          : `${criterion.reference}: se esperaba el estado "${criterion.expectedState}" y se obtuvo "${measurement?.state ?? 'sin estado determinado'}".`,
      );
    }

    case 'dc-measurement-range': {
      if (analysis.mode !== 'dc') {
        return result(criterion, false, 'Este criterio requiere una simulación de corriente continua (DC).');
      }
      const measurement = analysis.result.measurements.find(
        (item) => normalizeText(item.reference) === normalizeText(criterion.reference),
      );
      const value = measurement?.[criterion.metric] ?? null;
      const passed = typeof value === 'number' && Number.isFinite(value)
        && value >= criterion.min && value <= criterion.max;
      const unit = criterion.metric === 'currentA' ? 'A' : criterion.metric === 'voltageV' ? 'V' : 'W';
      return result(
        criterion,
        passed,
        passed
          ? `${criterion.reference}: ${value!.toPrecision(4)} ${unit}, dentro del intervalo esperado.`
          : `${criterion.reference}: se esperaba ${criterion.min} a ${criterion.max} ${unit}; se obtuvo ${value === null ? 'un valor no determinado' : `${value} ${unit}`}.`,
      );
    }

    case 'rc-mode': {
      if (analysis.mode !== 'rc') {
        return result(criterion, false, 'Este criterio requiere un análisis transitorio RC.');
      }
      const passed = analysis.result.mode === criterion.expectedMode;
      return result(
        criterion,
        passed,
        passed
          ? `Se seleccionó el modo ${criterion.expectedMode === 'charge' ? 'carga' : 'descarga'} solicitado.`
          : `Se esperaba ${criterion.expectedMode === 'charge' ? 'carga' : 'descarga'}, pero se ejecutó ${analysis.result.mode === 'charge' ? 'carga' : 'descarga'}.`,
      );
    }

    case 'rc-measurement-range': {
      if (analysis.mode !== 'rc') {
        return result(criterion, false, 'Este criterio requiere un análisis transitorio RC.');
      }
      const value = criterion.metric === 'timeConstantSeconds'
        ? analysis.result.timeConstantSeconds
        : analysis.result.finalVoltageV;
      const passed = typeof value === 'number' && Number.isFinite(value)
        && value >= criterion.min && value <= criterion.max;
      const unit = criterion.metric === 'timeConstantSeconds' ? 's' : 'V';
      const label = criterion.metric === 'timeConstantSeconds' ? 'constante de tiempo' : 'voltaje final';
      return result(
        criterion,
        passed,
        passed
          ? `La ${label} calculada (${value!.toPrecision(4)} ${unit}) está dentro del intervalo esperado.`
          : `La ${label} debía estar entre ${criterion.min} y ${criterion.max} ${unit}; se obtuvo ${value === null ? 'un valor no determinado' : `${value} ${unit}`}.`,
      );
    }
  }
}

/**
 * Compara el circuito construido y sus resultados con la rúbrica declarada en el JSON.
 * Es una evaluación educativa local: no registra calificaciones en el servidor.
 */
export function evaluatePractice(
  practice: ElectroLabPractice,
  editorState: EditorCircuitState,
  analysis: PracticeAnalysisResult,
): PracticeEvaluationResult {
  const evaluation = practice.practice.evaluation;
  if (!evaluation) {
    throw new Error('Esta práctica no define criterios de evaluación.');
  }
  if (analysis.mode !== evaluation.requiredAnalysis) {
    throw new Error(`Esta práctica requiere un análisis ${evaluation.requiredAnalysis.toUpperCase()}.`);
  }

  const criteria = evaluation.criteria.map((criterion) => evaluateCriterion(criterion, editorState, analysis));
  const pointsEarned = criteria.reduce((sum, criterion) => sum + criterion.pointsEarned, 0);
  const pointsPossible = criteria.reduce((sum, criterion) => sum + criterion.pointsPossible, 0);
  const score = pointsPossible > 0 ? Math.round((pointsEarned / pointsPossible) * 100) : 0;
  const passed = score >= evaluation.passingScore;

  return {
    practiceId: practice.practice.id,
    practiceTitle: practice.practice.title,
    analysisMode: analysis.mode,
    pointsEarned,
    pointsPossible,
    score,
    passingScore: evaluation.passingScore,
    passed,
    criteria,
    summary: passed
      ? `Práctica aprobada. Obtuviste ${score}/100 puntos.`
      : `Práctica no aprobada. Obtuviste ${score}/100 puntos; necesitas al menos ${evaluation.passingScore}.`,
  };
}
