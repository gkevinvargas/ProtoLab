import {
  type CircuitComponent,
  type CircuitConnection,
  type ComponentType,
  type EditorCircuitState,
  type EditorComponentState,
  type ElectroLabPractice,
  type PracticeConversionResult,
  type PracticeLoadResult,
  type TerminalId,
  type ValidationIssue,
} from './types';
import { validatePracticeDocument } from './validation';

const EDITOR_CANVAS_HEIGHT = 1000;

function displayValue(component: CircuitComponent): string {
  if (component.type === 'interruptor') {
    return component.value === 'abierto' ? 'Abierto' : 'Cerrado';
  }
  return String(component.value);
}

/**
 * Convierte una práctica JSON ya validada al estado que espera el editor React actual.
 * La coordenada x del editor se expresa como porcentaje; la del JSON, en píxeles lógicos.
 */
export function practiceToEditorState(practice: ElectroLabPractice): EditorCircuitState {
  const components: EditorComponentState[] = practice.components.map((component) => ({
    id: component.id,
    kind: component.type,
    reference: component.reference,
    value: displayValue(component),
    unit: component.unit,
    x: (component.position.x / practice.canvas.width) * 100,
    y: (component.position.y / practice.canvas.height) * EDITOR_CANVAS_HEIGHT,
  }));

  const connections = practice.connections.map((connection) => ({
    id: connection.id,
    from: {
      componentId: connection.from.componentId,
      side: connection.from.terminalId,
    },
    to: {
      componentId: connection.to.componentId,
      side: connection.to.terminalId,
    },
  }));

  return { components, connections };
}

/** Valida un valor editable y lo convierte al tipo que almacena el contrato JSON. */
function parseEditorValue(
  component: EditorComponentState,
  path: string,
  issues: ValidationIssue[],
): number | 'abierto' | 'cerrado' | null {
  if (component.kind === 'interruptor') {
    const normalized = component.value.trim().toLocaleLowerCase('es-MX');
    if (normalized === 'abierto' || normalized === 'cerrado') return normalized;
    issues.push({
      code: 'invalid_editor_switch_state',
      path: `${path}.value`,
      message: 'El interruptor debe tener el valor Abierto o Cerrado.',
    });
    return null;
  }

  const parsed = Number(component.value.trim().replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    issues.push({
      code: 'invalid_editor_numeric_value',
      path: `${path}.value`,
      message: 'El valor debe ser un número mayor que cero. Usa punto o coma como separador decimal.',
    });
    return null;
  }
  return parsed;
}

function defaultTerminals(kind: ComponentType): CircuitComponent['terminals'] {
  switch (kind) {
    case 'bateria':
      return [
        { id: 'left', label: '+', polarity: 'positive' },
        { id: 'right', label: '−', polarity: 'negative' },
      ];
    case 'resistencia':
      return [
        { id: 'left', label: '1', polarity: 'neutral' },
        { id: 'right', label: '2', polarity: 'neutral' },
      ];
    case 'led':
      return [
        { id: 'left', label: 'A', polarity: 'positive' },
        { id: 'right', label: 'K', polarity: 'negative' },
      ];
    case 'capacitor':
    case 'interruptor':
      return [
        { id: 'left', label: '1', polarity: 'neutral' },
        { id: 'right', label: '2', polarity: 'neutral' },
      ];
  }
}

function createCircuitComponent(
  component: EditorComponentState,
  sourceComponent: CircuitComponent | undefined,
  canvasWidth: number,
  canvasHeight: number,
  index: number,
  issues: ValidationIssue[],
): CircuitComponent | null {
  const path = `editor.components[${index}]`;
  if (!component.id.trim()) {
    issues.push({ code: 'empty_component_id', path: `${path}.id`, message: 'El componente necesita un ID.' });
    return null;
  }
  if (!Number.isFinite(component.x) || component.x < 0 || component.x > 100) {
    issues.push({ code: 'invalid_editor_x', path: `${path}.x`, message: 'La posición horizontal debe estar entre 0 y 100 por ciento.' });
    return null;
  }
  if (!Number.isFinite(component.y) || component.y < 0 || component.y > EDITOR_CANVAS_HEIGHT) {
    issues.push({ code: 'invalid_editor_y', path: `${path}.y`, message: `La posición vertical del editor debe estar entre 0 y ${EDITOR_CANVAS_HEIGHT} píxeles.` });
    return null;
  }
  if (!component.reference.trim()) {
    issues.push({ code: 'empty_reference', path: `${path}.reference`, message: 'El componente necesita una referencia.' });
    return null;
  }

  const value = parseEditorValue(component, path, issues);
  if (value === null) return null;

  const terminals = sourceComponent?.type === component.kind
    ? sourceComponent.terminals
    : defaultTerminals(component.kind);
  const base = {
    id: component.id,
    type: component.kind,
    reference: component.reference.trim(),
    value,
    unit: component.unit,
    position: {
      x: (component.x / 100) * canvasWidth,
      y: (component.y / EDITOR_CANVAS_HEIGHT) * canvasHeight,
    },
    terminals,
  };

  // El estrechamiento por kind asegura el tipo físico de value y unit en el contrato.
  switch (component.kind) {
    case 'bateria':
      if (typeof value !== 'number' || component.unit !== 'V') break;
      return { ...base, type: 'bateria', value, unit: 'V', terminals: terminals as Extract<CircuitComponent, { type: 'bateria' }>['terminals'] };
    case 'resistencia':
      if (typeof value !== 'number' || !['Ω', 'kΩ', 'MΩ'].includes(component.unit)) break;
      return { ...base, type: 'resistencia', value, unit: component.unit as 'Ω' | 'kΩ' | 'MΩ', terminals: terminals as Extract<CircuitComponent, { type: 'resistencia' }>['terminals'] };
    case 'led':
      if (typeof value !== 'number' || component.unit !== 'V') break;
      return { ...base, type: 'led', value, unit: 'V', terminals: terminals as Extract<CircuitComponent, { type: 'led' }>['terminals'] };
    case 'capacitor':
      if (typeof value !== 'number' || !['pF', 'nF', 'µF'].includes(component.unit)) break;
      return { ...base, type: 'capacitor', value, unit: component.unit as 'pF' | 'nF' | 'µF', terminals };
    case 'interruptor':
      if ((value !== 'abierto' && value !== 'cerrado') || component.unit !== '') break;
      return { ...base, type: 'interruptor', value, unit: '', terminals };
  }

  issues.push({
    code: 'invalid_component_unit',
    path: `${path}.unit`,
    message: `La unidad "${component.unit}" no es válida para el componente ${component.reference}.`,
  });
  return null;
}

/**
 * Toma el estado visual del editor y produce una nueva práctica JSON.
 * Conserva metadatos y configuración de lienzo de la práctica original.
 * El resultado se vuelve a validar antes de entregarse.
 */
export function editorStateToPractice(
  sourcePractice: ElectroLabPractice,
  editorState: EditorCircuitState,
): PracticeConversionResult {
  const issues: ValidationIssue[] = [];
  const sourceById = new Map(sourcePractice.components.map((component) => [component.id, component]));
  const components: CircuitComponent[] = [];

  editorState.components.forEach((component, index) => {
    const converted = createCircuitComponent(
      component,
      sourceById.get(component.id),
      sourcePractice.canvas.width,
      sourcePractice.canvas.height,
      index,
      issues,
    );
    if (converted) components.push(converted);
  });

  const connections: CircuitConnection[] = editorState.connections.map((connection) => ({
    id: connection.id,
    from: {
      componentId: connection.from.componentId,
      terminalId: connection.from.side,
    },
    to: {
      componentId: connection.to.componentId,
      terminalId: connection.to.side,
    },
  }));

  if (issues.length > 0) return { ok: false, data: null, issues };

  const candidate: ElectroLabPractice = {
    ...sourcePractice,
    components,
    connections,
  };
  const validation = validatePracticeDocument(candidate);
  if (!validation.ok) return { ok: false, data: null, issues: validation.issues };
  return { ok: true, data: validation.data, issues: [] };
}

/**
 * Punto de entrada recomendado cuando se carga una práctica desde archivo,
 * API o almacenamiento: primero valida, después adapta al editor.
 */
export function loadPracticeIntoEditor(input: unknown): PracticeLoadResult {
  const validation = validatePracticeDocument(input);
  if (!validation.ok) {
    return { ok: false, practice: null, editorState: null, issues: validation.issues };
  }
  return {
    ok: true,
    practice: validation.data,
    editorState: practiceToEditorState(validation.data),
    issues: [],
  };
}

/** Helper explícito para documentar el rango de posición usado por el editor actual. */
export function editorPercentToCanvasX(percent: number, canvasWidth: number): number {
  return (percent / 100) * canvasWidth;
}

/** Helper inverso para futuras integraciones que necesiten convertir una coordenada. */
export function canvasXToEditorPercent(x: number, canvasWidth: number): number {
  return (x / canvasWidth) * 100;
}

/** Tipo auxiliar para acciones que reciben un terminal del editor. */
export type EditorSide = TerminalId;
