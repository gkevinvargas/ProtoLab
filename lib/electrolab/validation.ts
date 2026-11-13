import {
  COMPONENT_TYPES,
  type ComponentType,
  type ElectroLabPractice,
  type PracticeValidationResult,
  type ValidationIssue,
  type TerminalId,
} from './types';

const COMPONENT_TYPE_SET = new Set<string>(COMPONENT_TYPES);
const TERMINAL_IDS = new Set<string>(['left', 'right']);
const POLARITIES = new Set<string>(['positive', 'negative', 'neutral']);
const DIFFICULTIES = new Set<string>(['principiante', 'intermedio', 'avanzado']);
const ROOT_KEYS = ['schemaVersion', 'practice', 'canvas', 'components', 'connections'];
const PRACTICE_KEYS = [
  'id', 'title', 'description', 'subject', 'difficulty',
  'estimatedDurationMinutes', 'learningObjectives', 'instructions',
  'allowedComponentTypes', 'evaluation',
];
const CANVAS_KEYS = ['width', 'height', 'unit', 'origin', 'componentAnchor'];
const COMPONENT_KEYS = ['id', 'type', 'reference', 'value', 'unit', 'position', 'terminals'];
const TERMINAL_KEYS = ['id', 'label', 'polarity'];
const POSITION_KEYS = ['x', 'y'];
const CONNECTION_KEYS = ['id', 'from', 'to'];
const TERMINAL_REFERENCE_KEYS = ['componentId', 'terminalId'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function addIssue(issues: ValidationIssue[], code: string, path: string, message: string) {
  issues.push({ code, path, message });
}

function checkKeys(
  value: Record<string, unknown>,
  allowedKeys: string[],
  path: string,
  issues: ValidationIssue[],
) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      addIssue(issues, 'unknown_property', `${path}.${key}`, 'La propiedad no está contemplada en la versión 1.0.0.');
    }
  }
}

function validateUniqueStrings(
  values: string[],
  path: string,
  issues: ValidationIssue[],
  normalize: (value: string) => string = (value) => value,
) {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    const normalized = normalize(value);
    if (seen.has(normalized)) {
      addIssue(issues, 'duplicate_value', `${path}[${index}]`, `El valor "${value}" está repetido.`);
    }
    seen.add(normalized);
  });
}

function isNumericComponentType(type: ComponentType): boolean {
  return type !== 'interruptor';
}

function validateComponentValueAndUnit(
  component: Record<string, unknown>,
  path: string,
  issues: ValidationIssue[],
) {
  const type = component.type;
  const value = component.value;
  const unit = component.unit;

  if (typeof unit !== 'string') {
    addIssue(issues, 'invalid_unit', `${path}.unit`, 'La unidad debe ser una cadena de texto.');
    return;
  }

  if (typeof type !== 'string' || !COMPONENT_TYPE_SET.has(type)) return;

  if (isNumericComponentType(type as ComponentType)) {
    if (!isFiniteNumber(value) || value <= 0) {
      addIssue(issues, 'invalid_value', `${path}.value`, 'El valor debe ser un número finito mayor que cero.');
    }
  }

  switch (type) {
    case 'bateria':
    case 'led':
      if (unit !== 'V') addIssue(issues, 'invalid_unit', `${path}.unit`, `${type} debe utilizar la unidad V.`);
      break;
    case 'resistencia':
      if (!['Ω', 'kΩ', 'MΩ'].includes(unit)) {
        addIssue(issues, 'invalid_unit', `${path}.unit`, 'La resistencia debe utilizar Ω, kΩ o MΩ.');
      }
      break;
    case 'capacitor':
      if (!['pF', 'nF', 'µF'].includes(unit)) {
        addIssue(issues, 'invalid_unit', `${path}.unit`, 'El capacitor debe utilizar pF, nF o µF.');
      }
      break;
    case 'interruptor':
      if (value !== 'abierto' && value !== 'cerrado') {
        addIssue(issues, 'invalid_switch_state', `${path}.value`, 'El interruptor debe tener el estado "abierto" o "cerrado".');
      }
      if (unit !== '') addIssue(issues, 'invalid_unit', `${path}.unit`, 'El interruptor no utiliza unidad de medida; su unidad debe ser una cadena vacía.');
      break;
  }
}

function validateTerminalArray(
  component: Record<string, unknown>,
  type: ComponentType | null,
  path: string,
  issues: ValidationIssue[],
) {
  const terminals = component.terminals;
  if (!Array.isArray(terminals) || terminals.length !== 2) {
    addIssue(issues, 'invalid_terminals', `${path}.terminals`, 'Cada componente debe declarar exactamente dos terminales.');
    return;
  }

  terminals.forEach((terminal, index) => {
    const terminalPath = `${path}.terminals[${index}]`;
    if (!isRecord(terminal)) {
      addIssue(issues, 'invalid_terminal', terminalPath, 'El terminal debe ser un objeto.');
      return;
    }
    checkKeys(terminal, TERMINAL_KEYS, terminalPath, issues);
    if (!TERMINAL_IDS.has(String(terminal.id))) {
      addIssue(issues, 'invalid_terminal_id', `${terminalPath}.id`, 'El identificador del terminal debe ser left o right.');
    }
    if (!isNonEmptyString(terminal.label) || terminal.label.length > 12) {
      addIssue(issues, 'invalid_terminal_label', `${terminalPath}.label`, 'La etiqueta del terminal debe contener entre 1 y 12 caracteres.');
    }
    if (!POLARITIES.has(String(terminal.polarity))) {
      addIssue(issues, 'invalid_terminal_polarity', `${terminalPath}.polarity`, 'La polaridad debe ser positive, negative o neutral.');
    }
  });

  if (terminals.length === 2 && terminals.every(isRecord)) {
    const first = terminals[0];
    const second = terminals[1];
    if (first.id !== 'left' || second.id !== 'right') {
      addIssue(issues, 'terminal_order', `${path}.terminals`, 'Los terminales deben aparecer en este orden: left y right.');
    }

    if (type === 'bateria') {
      if (first.label !== '+' || first.polarity !== 'positive' || second.label !== '−' || second.polarity !== 'negative') {
        addIssue(issues, 'terminal_semantics', `${path}.terminals`, 'La batería debe declarar left (+, positive) y right (−, negative).');
      }
    } else if (type === 'led') {
      if (first.label !== 'A' || first.polarity !== 'positive' || second.label !== 'K' || second.polarity !== 'negative') {
        addIssue(issues, 'terminal_semantics', `${path}.terminals`, 'El LED debe declarar left (A, positive) y right (K, negative).');
      }
    } else if (type === 'resistencia') {
      if (first.label !== '1' || first.polarity !== 'neutral' || second.label !== '2' || second.polarity !== 'neutral') {
        addIssue(issues, 'terminal_semantics', `${path}.terminals`, 'La resistencia debe declarar terminales 1 y 2 con polaridad neutral.');
      }
    }
  }
}

function validateComponent(
  value: unknown,
  index: number,
  canvasWidth: number | null,
  canvasHeight: number | null,
  allowedTypes: Set<string>,
  issues: ValidationIssue[],
) {
  const path = `$.components[${index}]`;
  if (!isRecord(value)) {
    addIssue(issues, 'invalid_component', path, 'El componente debe ser un objeto.');
    return;
  }
  checkKeys(value, COMPONENT_KEYS, path, issues);

  if (!isNonEmptyString(value.id) || !/^[A-Za-z0-9_-]+$/.test(value.id)) {
    addIssue(issues, 'invalid_component_id', `${path}.id`, 'El ID debe contener letras, números, guiones o guiones bajos.');
  }
  if (!isNonEmptyString(value.reference) || value.reference.length > 16 || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(value.reference)) {
    addIssue(issues, 'invalid_reference', `${path}.reference`, 'La referencia debe iniciar con una letra y tener hasta 16 caracteres.');
  }

  const componentType = typeof value.type === 'string' && COMPONENT_TYPE_SET.has(value.type)
    ? value.type as ComponentType
    : null;
  if (!componentType) {
    addIssue(issues, 'unknown_component_type', `${path}.type`, 'El tipo de componente no está soportado por ElectroLab v1.0.0.');
  } else if (!allowedTypes.has(componentType)) {
    addIssue(issues, 'component_not_allowed', `${path}.type`, `El tipo "${componentType}" no está permitido en esta práctica.`);
  }

  validateComponentValueAndUnit(value, path, issues);

  if (!isRecord(value.position)) {
    addIssue(issues, 'invalid_position', `${path}.position`, 'La posición debe ser un objeto con coordenadas x e y.');
  } else {
    checkKeys(value.position, POSITION_KEYS, `${path}.position`, issues);
    for (const axis of ['x', 'y'] as const) {
      const coordinate = value.position[axis];
      const limit = axis === 'x' ? canvasWidth : canvasHeight;
      if (!isFiniteNumber(coordinate) || coordinate < 0 || (limit !== null && coordinate > limit)) {
        addIssue(issues, 'position_out_of_bounds', `${path}.position.${axis}`, `La coordenada ${axis} debe estar entre 0 y ${limit ?? 'el límite del lienzo'}.`);
      }
    }
  }

  validateTerminalArray(value, componentType, path, issues);
}

function validateEvaluation(value: unknown, path: string, issues: ValidationIssue[]) {
  if (!isRecord(value)) {
    addIssue(issues, 'invalid_evaluation', path, 'La evaluación debe ser un objeto.');
    return;
  }
  checkKeys(value, ['passingScore', 'requiredAnalysis', 'criteria'], path, issues);

  if (!isFiniteNumber(value.passingScore) || value.passingScore < 0 || value.passingScore > 100) {
    addIssue(issues, 'invalid_passing_score', `${path}.passingScore`, 'La calificación mínima debe ser un número entre 0 y 100.');
  }
  if (value.requiredAnalysis !== 'dc' && value.requiredAnalysis !== 'rc') {
    addIssue(issues, 'invalid_required_analysis', `${path}.requiredAnalysis`, 'El análisis requerido debe ser dc o rc.');
  }
  if (!Array.isArray(value.criteria) || value.criteria.length === 0) {
    addIssue(issues, 'invalid_evaluation_criteria', `${path}.criteria`, 'La rúbrica debe contener al menos un criterio.');
    return;
  }

  const ids: string[] = [];
  let totalPoints = 0;
  value.criteria.forEach((criterion, index) => {
    const criterionPath = `${path}.criteria[${index}]`;
    if (!isRecord(criterion)) {
      addIssue(issues, 'invalid_evaluation_criterion', criterionPath, 'Cada criterio debe ser un objeto.');
      return;
    }

    const baseKeys = ['id', 'title', 'description', 'points', 'type'];
    const type = criterion.type;
    const specificKeys: Record<string, string[]> = {
      'component-count': ['expectedCounts', 'exact'],
      'component-value': ['reference', 'expectedValue', 'unit', 'tolerance'],
      'connection-topology': ['expectedConnections', 'exact'],
      'analysis-status': [],
      'dc-state': ['reference', 'expectedState'],
      'dc-measurement-range': ['reference', 'metric', 'min', 'max'],
      'rc-mode': ['expectedMode'],
      'rc-measurement-range': ['metric', 'min', 'max'],
    };
    if (typeof type !== 'string' || !specificKeys[type]) {
      addIssue(issues, 'unknown_evaluation_criterion', `${criterionPath}.type`, 'El tipo de criterio no está soportado.');
      checkKeys(criterion, baseKeys, criterionPath, issues);
      return;
    }
    checkKeys(criterion, [...baseKeys, ...specificKeys[type]], criterionPath, issues);

    if (!isNonEmptyString(criterion.id)) {
      addIssue(issues, 'invalid_evaluation_criterion_id', `${criterionPath}.id`, 'El criterio necesita un identificador.');
    } else {
      ids.push(criterion.id);
    }
    for (const field of ['title', 'description'] as const) {
      if (!isNonEmptyString(criterion[field])) {
        addIssue(issues, 'invalid_evaluation_criterion_text', `${criterionPath}.${field}`, 'Este campo debe contener texto.');
      }
    }
    if (!isFiniteNumber(criterion.points) || criterion.points <= 0) {
      addIssue(issues, 'invalid_evaluation_points', `${criterionPath}.points`, 'Los puntos deben ser un número mayor que cero.');
    } else {
      totalPoints += criterion.points;
    }

    switch (type) {
      case 'component-count': {
        if (!isRecord(criterion.expectedCounts) || Object.keys(criterion.expectedCounts).length === 0) {
          addIssue(issues, 'invalid_expected_counts', `${criterionPath}.expectedCounts`, 'Indica al menos una cantidad esperada por tipo de componente.');
        } else {
          checkKeys(criterion.expectedCounts, [...COMPONENT_TYPE_SET], `${criterionPath}.expectedCounts`, issues);
          for (const [componentType, expectedCount] of Object.entries(criterion.expectedCounts)) {
            if (!COMPONENT_TYPE_SET.has(componentType) || !Number.isInteger(expectedCount) || Number(expectedCount) < 0) {
              addIssue(issues, 'invalid_expected_component_count', `${criterionPath}.expectedCounts.${componentType}`, 'La cantidad debe ser un entero no negativo de un tipo de componente válido.');
            }
          }
        }
        if (criterion.exact !== undefined && typeof criterion.exact !== 'boolean') {
          addIssue(issues, 'invalid_exact_flag', `${criterionPath}.exact`, 'exact debe ser booleano.');
        }
        break;
      }
      case 'component-value': {
        if (!isNonEmptyString(criterion.reference) || !isNonEmptyString(criterion.unit)) {
          addIssue(issues, 'invalid_component_value_reference', criterionPath, 'Indica una referencia de componente y una unidad.');
        }
        if (!isFiniteNumber(criterion.expectedValue) || criterion.expectedValue <= 0) {
          addIssue(issues, 'invalid_expected_component_value', `${criterionPath}.expectedValue`, 'El valor esperado debe ser mayor que cero.');
        }
        if (criterion.tolerance !== undefined && (!isFiniteNumber(criterion.tolerance) || criterion.tolerance < 0)) {
          addIssue(issues, 'invalid_component_tolerance', `${criterionPath}.tolerance`, 'La tolerancia debe ser un número no negativo.');
        }
        break;
      }
      case 'connection-topology': {
        if (!Array.isArray(criterion.expectedConnections) || criterion.expectedConnections.length === 0) {
          addIssue(issues, 'invalid_expected_connections', `${criterionPath}.expectedConnections`, 'Indica al menos una conexión esperada.');
        } else {
          criterion.expectedConnections.forEach((connection, connectionIndex) => {
            const connectionPath = `${criterionPath}.expectedConnections[${connectionIndex}]`;
            if (!isRecord(connection)) {
              addIssue(issues, 'invalid_expected_connection', connectionPath, 'La conexión esperada debe ser un objeto.');
              return;
            }
            checkKeys(connection, ['from', 'to'], connectionPath, issues);
            for (const end of ['from', 'to'] as const) {
              const endpoint = connection[end];
              if (!isRecord(endpoint)) {
                addIssue(issues, 'invalid_expected_endpoint', `${connectionPath}.${end}`, 'El extremo debe incluir referencia y terminal.');
                continue;
              }
              checkKeys(endpoint, ['reference', 'terminalId'], `${connectionPath}.${end}`, issues);
              if (!isNonEmptyString(endpoint.reference) || !TERMINAL_IDS.has(String(endpoint.terminalId))) {
                addIssue(issues, 'invalid_expected_endpoint', `${connectionPath}.${end}`, 'La referencia debe ser texto y el terminal left o right.');
              }
            }
          });
        }
        if (criterion.exact !== undefined && typeof criterion.exact !== 'boolean') {
          addIssue(issues, 'invalid_exact_flag', `${criterionPath}.exact`, 'exact debe ser booleano.');
        }
        break;
      }
      case 'dc-state':
        if (!isNonEmptyString(criterion.reference) || !isNonEmptyString(criterion.expectedState)) {
          addIssue(issues, 'invalid_dc_state_criterion', criterionPath, 'Indica la referencia del componente y el estado esperado.');
        }
        if (value.requiredAnalysis !== 'dc') addIssue(issues, 'criterion_analysis_mismatch', criterionPath, 'Los criterios dc-state requieren requiredAnalysis = dc.');
        break;
      case 'dc-measurement-range':
        if (!isNonEmptyString(criterion.reference)) addIssue(issues, 'invalid_measurement_reference', `${criterionPath}.reference`, 'Indica la referencia del componente que se medirá.');
        if (!['voltageV', 'currentA', 'powerW'].includes(String(criterion.metric))) addIssue(issues, 'invalid_dc_metric', `${criterionPath}.metric`, 'La métrica debe ser voltageV, currentA o powerW.');
        if (!isFiniteNumber(criterion.min) || !isFiniteNumber(criterion.max) || Number(criterion.min) > Number(criterion.max)) addIssue(issues, 'invalid_measurement_range', criterionPath, 'El rango debe contener límites numéricos y min no puede superar max.');
        if (value.requiredAnalysis !== 'dc') addIssue(issues, 'criterion_analysis_mismatch', criterionPath, 'Los criterios dc-measurement-range requieren requiredAnalysis = dc.');
        break;
      case 'rc-mode':
        if (criterion.expectedMode !== 'charge' && criterion.expectedMode !== 'discharge') addIssue(issues, 'invalid_rc_mode', `${criterionPath}.expectedMode`, 'El modo esperado debe ser charge o discharge.');
        if (value.requiredAnalysis !== 'rc') addIssue(issues, 'criterion_analysis_mismatch', criterionPath, 'Los criterios rc-mode requieren requiredAnalysis = rc.');
        break;
      case 'rc-measurement-range':
        if (!['timeConstantSeconds', 'finalVoltageV'].includes(String(criterion.metric))) addIssue(issues, 'invalid_rc_metric', `${criterionPath}.metric`, 'La métrica debe ser timeConstantSeconds o finalVoltageV.');
        if (!isFiniteNumber(criterion.min) || !isFiniteNumber(criterion.max) || Number(criterion.min) > Number(criterion.max)) addIssue(issues, 'invalid_measurement_range', criterionPath, 'El rango debe contener límites numéricos y min no puede superar max.');
        if (value.requiredAnalysis !== 'rc') addIssue(issues, 'criterion_analysis_mismatch', criterionPath, 'Los criterios rc-measurement-range requieren requiredAnalysis = rc.');
        break;
    }
  });

  validateUniqueStrings(ids, `${path}.criteria.id`, issues);
  if (totalPoints <= 0) addIssue(issues, 'empty_evaluation_score', `${path}.criteria`, 'La rúbrica debe asignar puntos a sus criterios.');
}

function validateConnection(value: unknown, index: number, issues: ValidationIssue[]) {
  const path = `$.connections[${index}]`;
  if (!isRecord(value)) {
    addIssue(issues, 'invalid_connection', path, 'La conexión debe ser un objeto.');
    return;
  }
  checkKeys(value, CONNECTION_KEYS, path, issues);
  if (!isNonEmptyString(value.id) || !/^[A-Za-z0-9_-]+$/.test(value.id)) {
    addIssue(issues, 'invalid_connection_id', `${path}.id`, 'El ID de la conexión debe contener letras, números, guiones o guiones bajos.');
  }

  for (const endpointName of ['from', 'to'] as const) {
    const endpoint = value[endpointName];
    const endpointPath = `${path}.${endpointName}`;
    if (!isRecord(endpoint)) {
      addIssue(issues, 'invalid_connection_endpoint', endpointPath, 'El extremo de la conexión debe ser un objeto.');
      continue;
    }
    checkKeys(endpoint, TERMINAL_REFERENCE_KEYS, endpointPath, issues);
    if (!isNonEmptyString(endpoint.componentId)) {
      addIssue(issues, 'invalid_connection_component', `${endpointPath}.componentId`, 'Debe indicarse el ID del componente.');
    }
    if (!TERMINAL_IDS.has(String(endpoint.terminalId))) {
      addIssue(issues, 'invalid_connection_terminal', `${endpointPath}.terminalId`, 'El terminal debe ser left o right.');
    }
  }
}

/**
 * Valida estructura, reglas de dominio y referencias entre componentes y conexiones.
 * No calcula corrientes, voltajes ni determina si el circuito funciona eléctricamente.
 */
export function validatePracticeDocument(input: unknown): PracticeValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    addIssue(issues, 'invalid_document', '$', 'La práctica debe ser un objeto JSON.');
    return { ok: false, data: null, issues };
  }
  checkKeys(input, ROOT_KEYS, '$', issues);

  if (typeof input.schemaVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(input.schemaVersion)) {
    addIssue(issues, 'invalid_schema_version', '$.schemaVersion', 'La versión debe seguir el formato MAJOR.MINOR.PATCH.');
  } else if (input.schemaVersion.split('.')[0] !== '1') {
    addIssue(issues, 'unsupported_schema_version', '$.schemaVersion', `La versión ${input.schemaVersion} no es compatible. Se admite la versión mayor 1.`);
  }

  let allowedTypes = new Set<string>();
  if (!isRecord(input.practice)) {
    addIssue(issues, 'invalid_practice_metadata', '$.practice', 'Los metadatos de la práctica deben ser un objeto.');
  } else {
    const practice = input.practice;
    checkKeys(practice, PRACTICE_KEYS, '$.practice', issues);
    for (const field of ['id', 'title', 'description', 'subject'] as const) {
      if (!isNonEmptyString(practice[field])) {
        addIssue(issues, 'required_text', `$.practice.${field}`, 'Este campo debe contener texto.');
      }
    }
    if (typeof practice.id === 'string' && !/^[a-z0-9][a-z0-9-]*$/.test(practice.id)) {
      addIssue(issues, 'invalid_practice_id', '$.practice.id', 'El ID debe usar minúsculas, números y guiones.');
    }
    if (typeof practice.title === 'string' && practice.title.length > 120) {
      addIssue(issues, 'text_too_long', '$.practice.title', 'El título admite hasta 120 caracteres.');
    }
    if (typeof practice.description === 'string' && practice.description.length > 1000) {
      addIssue(issues, 'text_too_long', '$.practice.description', 'La descripción admite hasta 1000 caracteres.');
    }
    if (!DIFFICULTIES.has(String(practice.difficulty))) {
      addIssue(issues, 'invalid_difficulty', '$.practice.difficulty', 'La dificultad debe ser principiante, intermedio o avanzado.');
    }
    if (!Number.isInteger(practice.estimatedDurationMinutes) || Number(practice.estimatedDurationMinutes) < 1 || Number(practice.estimatedDurationMinutes) > 600) {
      addIssue(issues, 'invalid_duration', '$.practice.estimatedDurationMinutes', 'La duración debe ser un entero entre 1 y 600 minutos.');
    }
    if (!Array.isArray(practice.learningObjectives) || practice.learningObjectives.length < 1 || !practice.learningObjectives.every(isNonEmptyString)) {
      addIssue(issues, 'invalid_learning_objectives', '$.practice.learningObjectives', 'Debe existir al menos un objetivo de aprendizaje con texto.');
    }
    if (!Array.isArray(practice.instructions) || practice.instructions.length < 1) {
      addIssue(issues, 'invalid_instructions', '$.practice.instructions', 'Debe existir al menos una instrucción.');
    } else {
      const steps: number[] = [];
      practice.instructions.forEach((instruction, index) => {
        const path = `$.practice.instructions[${index}]`;
        if (!isRecord(instruction)) {
          addIssue(issues, 'invalid_instruction', path, 'La instrucción debe ser un objeto.');
          return;
        }
        checkKeys(instruction, ['step', 'text'], path, issues);
        if (!Number.isInteger(instruction.step) || Number(instruction.step) < 1) {
          addIssue(issues, 'invalid_instruction_step', `${path}.step`, 'El paso debe ser un entero mayor que cero.');
        } else {
          steps.push(Number(instruction.step));
        }
        if (!isNonEmptyString(instruction.text)) {
          addIssue(issues, 'invalid_instruction_text', `${path}.text`, 'La instrucción debe contener texto.');
        }
      });
      validateUniqueStrings(steps.map(String), '$.practice.instructions.step', issues);
    }
    if (!Array.isArray(practice.allowedComponentTypes) || practice.allowedComponentTypes.length < 1) {
      addIssue(issues, 'invalid_allowed_types', '$.practice.allowedComponentTypes', 'Debe permitirse al menos un tipo de componente.');
    } else {
      const validTypes: string[] = [];
      practice.allowedComponentTypes.forEach((type, index) => {
        if (typeof type !== 'string' || !COMPONENT_TYPE_SET.has(type)) {
          addIssue(issues, 'unknown_allowed_type', `$.practice.allowedComponentTypes[${index}]`, 'El tipo de componente no está soportado.');
        } else {
          validTypes.push(type);
        }
      });
      validateUniqueStrings(validTypes, '$.practice.allowedComponentTypes', issues);
      allowedTypes = new Set(validTypes);
    }
    if (practice.evaluation !== undefined) {
      validateEvaluation(practice.evaluation, '$.practice.evaluation', issues);
    }
  }

  let canvasWidth: number | null = null;
  let canvasHeight: number | null = null;
  if (!isRecord(input.canvas)) {
    addIssue(issues, 'invalid_canvas', '$.canvas', 'La configuración del lienzo debe ser un objeto.');
  } else {
    const canvas = input.canvas;
    checkKeys(canvas, CANVAS_KEYS, '$.canvas', issues);
    for (const dimension of ['width', 'height'] as const) {
      const value = canvas[dimension];
      if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5000) {
        addIssue(issues, 'invalid_canvas_dimension', `$.canvas.${dimension}`, 'La dimensión debe ser un entero entre 1 y 5000 píxeles.');
      } else if (dimension === 'width') {
        canvasWidth = Number(value);
      } else {
        canvasHeight = Number(value);
      }
    }
    if (canvas.unit !== 'px') addIssue(issues, 'invalid_canvas_unit', '$.canvas.unit', 'La unidad del lienzo debe ser px.');
    if (canvas.origin !== 'top-left') addIssue(issues, 'invalid_canvas_origin', '$.canvas.origin', 'El origen del lienzo debe ser top-left.');
    if (canvas.componentAnchor !== 'center-top') addIssue(issues, 'invalid_component_anchor', '$.canvas.componentAnchor', 'El ancla del componente debe ser center-top.');
  }

  if (!Array.isArray(input.components)) {
    addIssue(issues, 'invalid_components', '$.components', 'components debe ser un arreglo.');
  } else {
    input.components.forEach((component, index) => validateComponent(component, index, canvasWidth, canvasHeight, allowedTypes, issues));
  }

  if (!Array.isArray(input.connections)) {
    addIssue(issues, 'invalid_connections', '$.connections', 'connections debe ser un arreglo.');
  } else {
    input.connections.forEach((connection, index) => validateConnection(connection, index, issues));
  }

  // Comprobaciones semánticas entre colecciones.
  if (Array.isArray(input.components)) {
    const componentIds: string[] = [];
    const references: string[] = [];
    const componentMap = new Map<string, Record<string, unknown>>();

    input.components.forEach((component, index) => {
      if (!isRecord(component)) return;
      if (typeof component.id === 'string') {
        componentIds.push(component.id);
        componentMap.set(component.id, component);
      }
      if (typeof component.reference === 'string') references.push(component.reference);
    });
    validateUniqueStrings(componentIds, '$.components.id', issues);
    validateUniqueStrings(references, '$.components.reference', issues, (value) => value.trim().toUpperCase());

    if (Array.isArray(input.connections)) {
      const connectionIds: string[] = [];
      const normalizedConnections = new Set<string>();
      input.connections.forEach((connection, index) => {
        if (!isRecord(connection)) return;
        if (typeof connection.id === 'string') connectionIds.push(connection.id);
        const from = isRecord(connection.from) ? connection.from : null;
        const to = isRecord(connection.to) ? connection.to : null;
        if (!from || !to || typeof from.componentId !== 'string' || typeof to.componentId !== 'string') return;

        if (from.componentId === to.componentId) {
          addIssue(issues, 'self_connection', `$.connections[${index}]`, 'No se permite conectar dos terminales del mismo componente.');
        }

        const fromComponent = componentMap.get(from.componentId);
        const toComponent = componentMap.get(to.componentId);
        if (!fromComponent) {
          addIssue(issues, 'missing_component_reference', `$.connections[${index}].from.componentId`, `No existe el componente "${from.componentId}".`);
        } else if (Array.isArray(fromComponent.terminals) && !fromComponent.terminals.some((terminal) => isRecord(terminal) && terminal.id === from.terminalId)) {
          addIssue(issues, 'missing_terminal_reference', `$.connections[${index}].from.terminalId`, `El componente "${from.componentId}" no declara el terminal "${String(from.terminalId)}".`);
        }
        if (!toComponent) {
          addIssue(issues, 'missing_component_reference', `$.connections[${index}].to.componentId`, `No existe el componente "${to.componentId}".`);
        } else if (Array.isArray(toComponent.terminals) && !toComponent.terminals.some((terminal) => isRecord(terminal) && terminal.id === to.terminalId)) {
          addIssue(issues, 'missing_terminal_reference', `$.connections[${index}].to.terminalId`, `El componente "${to.componentId}" no declara el terminal "${String(to.terminalId)}".`);
        }

        const fromKey = `${from.componentId}:${String(from.terminalId)}`;
        const toKey = `${to.componentId}:${String(to.terminalId)}`;
        const key = [fromKey, toKey].sort().join('|');
        if (normalizedConnections.has(key)) {
          addIssue(issues, 'duplicate_connection', `$.connections[${index}]`, 'Esta conexión ya existe; invertir from y to no crea un cable diferente.');
        }
        normalizedConnections.add(key);
      });
      validateUniqueStrings(connectionIds, '$.connections.id', issues);
    }
  }

  if (issues.length > 0) return { ok: false, data: null, issues };
  return { ok: true, data: input as unknown as ElectroLabPractice, issues: [] };
}

/** Convierte texto JSON en una práctica validada sin propagar errores de parseo. */
export function parsePracticeJson(jsonText: string): PracticeValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    return {
      ok: false,
      data: null,
      issues: [{ code: 'invalid_json', path: '$', message: 'El archivo no contiene JSON válido.' }],
    };
  }
  return validatePracticeDocument(parsed);
}

/** Permite validar un identificador de terminal desde integraciones externas. */
export function isTerminalId(value: unknown): value is TerminalId {
  return value === 'left' || value === 'right';
}
