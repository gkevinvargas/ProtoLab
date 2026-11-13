import { editorStateToPractice } from './adapter';
import type {
  CircuitComponent,
  ComponentType,
  EditorCircuitState,
  ElectroLabPractice,
  ValidationIssue,
} from './types';

/**
 * Motor inicial de ElectroLab.
 * Calcula el punto de operación de circuitos de corriente continua (DC).
 * No calcula transitorios, carga/descarga de capacitores ni temperatura.
 */

export type SimulationStatus = 'success' | 'warning' | 'error';
export type SimulationSeverity = 'warning' | 'error';

export interface SimulationIssue {
  code: string;
  severity: SimulationSeverity;
  message: string;
  componentId?: string;
}

export interface ComponentMeasurement {
  componentId: string;
  reference: string;
  type: ComponentType;
  /** Voltaje entre terminal izquierdo y derecho (V). Null cuando no es determinable. */
  voltageV: number | null;
  /** Corriente positiva de izquierda a derecha (A). Null en ramas ideales sin corriente individual determinable. */
  currentA: number | null;
  /** Potencia bajo convención pasiva: P = V * I (W). */
  powerW: number | null;
  state?: string;
  note?: string;
}

export interface TerminalVoltage {
  componentId: string;
  terminalId: 'left' | 'right';
  voltageV: number;
  /** Referencia local de la red. Dos redes eléctricas aisladas no comparten referencia. */
  referenceGroup: number;
}

export interface SimulationResult {
  status: SimulationStatus;
  analysis: 'dc-operating-point';
  summary: string;
  measurements: ComponentMeasurement[];
  terminalVoltages: TerminalVoltage[];
  issues: SimulationIssue[];
  iterations: number;
  /** Convención de signos y límites del modelo usados en el cálculo. */
  model: {
    ledOnResistanceOhms: number;
    ledOffResistanceOhms: number;
    referenceLedCurrentMilliAmps: number;
    capacitorMode: 'open-circuit-dc';
  };
}

export interface SimulationOptions {
  /** Resistencia serie equivalente del LED cuando conduce. */
  ledOnResistanceOhms?: number;
  /** Resistencia grande usada para aproximar el LED apagado durante la iteración. */
  ledOffResistanceOhms?: number;
  /** Referencia educativa para advertir corrientes superiores a este valor. */
  referenceLedCurrentMilliAmps?: number;
  /** Máximo de iteraciones para determinar qué LEDs conducen. */
  maxIterations?: number;
}

interface NormalizedOptions {
  ledOnResistanceOhms: number;
  ledOffResistanceOhms: number;
  referenceLedCurrentAmps: number;
  referenceLedCurrentMilliAmps: number;
  maxIterations: number;
}

interface NodePair {
  left: string;
  right: string;
}

interface LinearSolution {
  nodeVoltages: Map<string, number>;
  groupByNode: Map<string, number>;
  sourceCurrents: Map<string, number>;
}

interface SolveResult {
  solution: LinearSolution | null;
  error?: SimulationIssue;
}

class DisjointSet {
  private parent = new Map<string, string>();

  add(value: string) {
    if (!this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    this.add(value);
    const parent = this.parent.get(value)!;
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootB, rootA);
  }
}

function terminalKey(componentId: string, terminalId: 'left' | 'right') {
  return `${componentId}::${terminalId}`;
}

function resistanceInOhms(component: Extract<CircuitComponent, { type: 'resistencia' }>): number {
  const multiplier = component.unit === 'kΩ' ? 1_000 : component.unit === 'MΩ' ? 1_000_000 : 1;
  return component.value * multiplier;
}

function addEdge(adjacency: Map<string, Set<string>>, a: string, b: string) {
  if (a === b) return;
  adjacency.get(a)?.add(b);
  adjacency.get(b)?.add(a);
}

function buildNetwork(practice: ElectroLabPractice, activeLeds: Set<string>) {
  const sets = new DisjointSet();
  for (const component of practice.components) {
    sets.add(terminalKey(component.id, 'left'));
    sets.add(terminalKey(component.id, 'right'));
  }

  for (const wire of practice.connections) {
    sets.union(
      terminalKey(wire.from.componentId, wire.from.terminalId),
      terminalKey(wire.to.componentId, wire.to.terminalId),
    );
  }

  // Un interruptor cerrado se comporta como un conductor ideal: fusiona sus nodos.
  for (const component of practice.components) {
    if (component.type === 'interruptor' && component.value === 'cerrado') {
      sets.union(terminalKey(component.id, 'left'), terminalKey(component.id, 'right'));
    }
  }

  const nodesByComponent = new Map<string, NodePair>();
  const nodeIds: string[] = [];
  const uniqueNodes = new Set<string>();
  for (const component of practice.components) {
    const left = sets.find(terminalKey(component.id, 'left'));
    const right = sets.find(terminalKey(component.id, 'right'));
    nodesByComponent.set(component.id, { left, right });
    if (!uniqueNodes.has(left)) { uniqueNodes.add(left); nodeIds.push(left); }
    if (!uniqueNodes.has(right)) { uniqueNodes.add(right); nodeIds.push(right); }
  }

  // La conectividad eléctrica incluye baterías, resistencias y LEDs (apagados o encendidos).
  // Los capacitores y los interruptores abiertos no forman un camino de corriente DC.
  const adjacency = new Map<string, Set<string>>();
  nodeIds.forEach((node) => adjacency.set(node, new Set()));
  for (const component of practice.components) {
    if (component.type === 'bateria' || component.type === 'resistencia' || component.type === 'led') {
      const pair = nodesByComponent.get(component.id)!;
      addEdge(adjacency, pair.left, pair.right);
    }
  }

  const groupByNode = new Map<string, number>();
  let nextGroup = 0;
  for (const start of nodeIds) {
    if (groupByNode.has(start)) continue;
    const group = nextGroup++;
    const queue = [start];
    groupByNode.set(start, group);
    while (queue.length) {
      const current = queue.shift()!;
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!groupByNode.has(neighbor)) {
          groupByNode.set(neighbor, group);
          queue.push(neighbor);
        }
      }
    }
  }

  return { nodesByComponent, nodeIds, groupByNode, activeLeds };
}

function solveLinearSystem(matrixInput: number[][], rhsInput: number[]): number[] | null {
  const size = rhsInput.length;
  if (size === 0) return [];
  const matrix = matrixInput.map((row) => [...row]);
  const rhs = [...rhsInput];
  const rowScale = matrix.map((row) => Math.max(...row.map((value) => Math.abs(value)), 1e-30));

  for (let pivotColumn = 0; pivotColumn < size; pivotColumn += 1) {
    let pivotRow = pivotColumn;
    let bestRatio = -1;
    for (let row = pivotColumn; row < size; row += 1) {
      const ratio = Math.abs(matrix[row][pivotColumn]) / rowScale[row];
      if (ratio > bestRatio) {
        bestRatio = ratio;
        pivotRow = row;
      }
    }

    if (Math.abs(matrix[pivotRow][pivotColumn]) < 1e-18 || bestRatio < 1e-14) return null;

    if (pivotRow !== pivotColumn) {
      [matrix[pivotRow], matrix[pivotColumn]] = [matrix[pivotColumn], matrix[pivotRow]];
      [rhs[pivotRow], rhs[pivotColumn]] = [rhs[pivotColumn], rhs[pivotRow]];
      [rowScale[pivotRow], rowScale[pivotColumn]] = [rowScale[pivotColumn], rowScale[pivotRow]];
    }

    const pivot = matrix[pivotColumn][pivotColumn];
    for (let row = pivotColumn + 1; row < size; row += 1) {
      const factor = matrix[row][pivotColumn] / pivot;
      if (factor === 0) continue;
      matrix[row][pivotColumn] = 0;
      for (let column = pivotColumn + 1; column < size; column += 1) {
        matrix[row][column] -= factor * matrix[pivotColumn][column];
      }
      rhs[row] -= factor * rhs[pivotColumn];
    }
  }

  const result = Array<number>(size).fill(0);
  for (let row = size - 1; row >= 0; row -= 1) {
    let remainder = rhs[row];
    for (let column = row + 1; column < size; column += 1) {
      remainder -= matrix[row][column] * result[column];
    }
    const pivot = matrix[row][row];
    if (Math.abs(pivot) < 1e-18) return null;
    result[row] = remainder / pivot;
    if (!Number.isFinite(result[row])) return null;
  }
  return result;
}

function solveNetwork(
  practice: ElectroLabPractice,
  activeLeds: Set<string>,
  options: NormalizedOptions,
): SolveResult {
  const network = buildNetwork(practice, activeLeds);
  const batteries = practice.components.filter((component) => component.type === 'bateria');

  for (const battery of batteries) {
    const pair = network.nodesByComponent.get(battery.id)!;
    if (pair.left === pair.right) {
      return {
        solution: null,
        error: {
          code: 'SOURCE_SHORT_CIRCUIT',
          severity: 'error',
          componentId: battery.id,
          message: `La fuente ${battery.reference} está en cortocircuito: sus terminales positivo y negativo pertenecen al mismo nodo.`,
        },
      };
    }
  }

  // Se toma un nodo de referencia por cada red aislada. Así no se comparan voltajes
  // de redes sin una referencia eléctrica común.
  const groundNodes = new Set<string>();
  const firstNodeByGroup = new Map<number, string>();
  for (const node of network.nodeIds) {
    const group = network.groupByNode.get(node)!;
    if (!firstNodeByGroup.has(group)) firstNodeByGroup.set(group, node);
  }
  firstNodeByGroup.forEach((node) => groundNodes.add(node));

  const voltageNodes = network.nodeIds.filter((node) => !groundNodes.has(node));
  const nodeIndex = new Map(voltageNodes.map((node, index) => [node, index]));
  const sourceOffset = voltageNodes.length;
  const matrixSize = voltageNodes.length + batteries.length;
  const matrix = Array.from({ length: matrixSize }, () => Array<number>(matrixSize).fill(0));
  const rhs = Array<number>(matrixSize).fill(0);

  function stampConductance(p: string, n: string, resistance: number, seriesDrop = 0) {
    if (p === n) return;
    const conductance = 1 / resistance;
    const pi = nodeIndex.get(p);
    const ni = nodeIndex.get(n);

    if (pi !== undefined) matrix[pi][pi] += conductance;
    if (ni !== undefined) matrix[ni][ni] += conductance;
    if (pi !== undefined && ni !== undefined) {
      matrix[pi][ni] -= conductance;
      matrix[ni][pi] -= conductance;
    }

    // Rama equivalente: I = (Vp - Vn - Vserie) / R.
    if (pi !== undefined) rhs[pi] += conductance * seriesDrop;
    if (ni !== undefined) rhs[ni] -= conductance * seriesDrop;
  }

  const sourceIndices = new Map<string, number>();
  batteries.forEach((battery, index) => {
    const pair = network.nodesByComponent.get(battery.id)!;
    const pIndex = nodeIndex.get(pair.left);
    const nIndex = nodeIndex.get(pair.right);
    const sourceIndex = sourceOffset + index;
    sourceIndices.set(battery.id, sourceIndex);

    if (pIndex !== undefined) {
      matrix[pIndex][sourceIndex] += 1;
      matrix[sourceIndex][pIndex] += 1;
    }
    if (nIndex !== undefined) {
      matrix[nIndex][sourceIndex] -= 1;
      matrix[sourceIndex][nIndex] -= 1;
    }
    rhs[sourceIndex] = battery.value;
  });

  for (const component of practice.components) {
    const pair = network.nodesByComponent.get(component.id)!;
    if (component.type === 'resistencia') {
      stampConductance(pair.left, pair.right, resistanceInOhms(component));
    } else if (component.type === 'led') {
      const isActive = activeLeds.has(component.id);
      stampConductance(
        pair.left,
        pair.right,
        isActive ? options.ledOnResistanceOhms : options.ledOffResistanceOhms,
        isActive ? component.value : 0,
      );
    }
  }

  const solved = solveLinearSystem(matrix, rhs);
  if (!solved) {
    return {
      solution: null,
      error: {
        code: 'SINGULAR_CIRCUIT',
        severity: 'error',
        message: 'No se pudo resolver el circuito. Puede existir un lazo de fuentes ideales incompatibles o una topología numéricamente indeterminada.',
      },
    };
  }

  const nodeVoltages = new Map<string, number>();
  for (const ground of groundNodes) nodeVoltages.set(ground, 0);
  voltageNodes.forEach((node, index) => nodeVoltages.set(node, solved[index]));

  const sourceCurrents = new Map<string, number>();
  sourceIndices.forEach((index, componentId) => sourceCurrents.set(componentId, solved[index]));

  return {
    solution: {
      nodeVoltages,
      groupByNode: network.groupByNode,
      sourceCurrents,
    },
  };
}

function makeErrorResult(
  message: string,
  issues: SimulationIssue[],
  options: NormalizedOptions,
  iterations = 0,
): SimulationResult {
  return {
    status: 'error',
    analysis: 'dc-operating-point',
    summary: message,
    measurements: [],
    terminalVoltages: [],
    issues,
    iterations,
    model: {
      ledOnResistanceOhms: options.ledOnResistanceOhms,
      ledOffResistanceOhms: options.ledOffResistanceOhms,
      referenceLedCurrentMilliAmps: options.referenceLedCurrentMilliAmps,
      capacitorMode: 'open-circuit-dc',
    },
  };
}

function normalizeOptions(input: SimulationOptions): NormalizedOptions {
  const ledOnResistanceOhms = input.ledOnResistanceOhms ?? 5;
  const ledOffResistanceOhms = input.ledOffResistanceOhms ?? 1_000_000_000;
  const referenceLedCurrentMilliAmps = input.referenceLedCurrentMilliAmps ?? 20;
  const maxIterations = input.maxIterations ?? 40;

  if (!Number.isFinite(ledOnResistanceOhms) || ledOnResistanceOhms <= 0) {
    throw new Error('ledOnResistanceOhms debe ser un número mayor que cero.');
  }
  if (!Number.isFinite(ledOffResistanceOhms) || ledOffResistanceOhms <= ledOnResistanceOhms) {
    throw new Error('ledOffResistanceOhms debe ser mayor que ledOnResistanceOhms.');
  }
  if (!Number.isFinite(referenceLedCurrentMilliAmps) || referenceLedCurrentMilliAmps <= 0) {
    throw new Error('referenceLedCurrentMilliAmps debe ser mayor que cero.');
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 200) {
    throw new Error('maxIterations debe ser un entero entre 1 y 200.');
  }

  return {
    ledOnResistanceOhms,
    ledOffResistanceOhms,
    referenceLedCurrentMilliAmps,
    referenceLedCurrentAmps: referenceLedCurrentMilliAmps / 1000,
    maxIterations,
  };
}

function issue(
  code: string,
  message: string,
  componentId?: string,
): SimulationIssue {
  return { code, severity: 'warning', message, ...(componentId ? { componentId } : {}) };
}

/**
 * Simula el estado actual del editor usando los metadatos de la práctica cargada.
 * Valida nuevamente valores, referencias y conexiones antes de resolver el circuito.
 */
export function simulateCircuit(
  sourcePractice: ElectroLabPractice,
  editorState: EditorCircuitState,
  inputOptions: SimulationOptions = {},
): SimulationResult {
  const options = normalizeOptions(inputOptions);
  const conversion = editorStateToPractice(sourcePractice, editorState);
  if (!conversion.ok) {
    const validationIssues: SimulationIssue[] = conversion.issues.map((item: ValidationIssue) => ({
      code: item.code,
      severity: 'error',
      message: `${item.path}: ${item.message}`,
    }));
    return makeErrorResult('El circuito contiene datos que deben corregirse antes de simular.', validationIssues, options);
  }

  const practice = conversion.data;
  const leds = practice.components.filter((component) => component.type === 'led');
  const activeLeds = new Set<string>();
  let finalSolve: SolveResult | null = null;
  let iterations = 0;
  let converged = false;

  for (let iteration = 0; iteration < options.maxIterations; iteration += 1) {
    iterations = iteration + 1;
    const solved = solveNetwork(practice, activeLeds, options);
    if (!solved.solution) {
      return makeErrorResult(
        solved.error?.message ?? 'No fue posible resolver el circuito.',
        solved.error ? [solved.error] : [],
        options,
        iterations,
      );
    }
    finalSolve = solved;
    let changed = false;

    for (const led of leds) {
      const network = buildNetwork(practice, activeLeds);
      const pair = network.nodesByComponent.get(led.id)!;
      const sameReference = solved.solution.groupByNode.get(pair.left) === solved.solution.groupByNode.get(pair.right);
      if (!sameReference) continue;
      const leftVoltage = solved.solution.nodeVoltages.get(pair.left);
      const rightVoltage = solved.solution.nodeVoltages.get(pair.right);
      if (leftVoltage === undefined || rightVoltage === undefined) continue;
      const ledVoltage = leftVoltage - rightVoltage;

      if (!activeLeds.has(led.id) && ledVoltage > led.value + 1e-6) {
        activeLeds.add(led.id);
        changed = true;
      } else if (activeLeds.has(led.id)) {
        const current = (ledVoltage - led.value) / options.ledOnResistanceOhms;
        if (current < -1e-9) {
          activeLeds.delete(led.id);
          changed = true;
        }
      }
    }

    if (!changed) {
      converged = true;
      break;
    }
  }

  if (!converged || !finalSolve?.solution) {
    return makeErrorResult(
      'El estado de conducción de los LEDs no convergió. Revisa si hay fuentes ideales o conexiones que producen estados contradictorios.',
      [{ code: 'DIODE_CONVERGENCE', severity: 'error', message: 'El algoritmo alcanzó el máximo de iteraciones sin encontrar un estado estable para los LEDs.' }],
      options,
      iterations,
    );
  }

  // Resuelve una última vez con el conjunto final de LEDs activos.
  finalSolve = solveNetwork(practice, activeLeds, options);
  if (!finalSolve.solution) {
    return makeErrorResult(
      finalSolve.error?.message ?? 'No fue posible resolver el circuito.',
      finalSolve.error ? [finalSolve.error] : [],
      options,
      iterations,
    );
  }

  const solution = finalSolve.solution;
  const measurements: ComponentMeasurement[] = [];
  const terminalVoltages: TerminalVoltage[] = [];
  const issues: SimulationIssue[] = [];
  const nodes = buildNetwork(practice, activeLeds);

  for (const component of practice.components) {
    const pair = nodes.nodesByComponent.get(component.id)!;
    const sameReference = solution.groupByNode.get(pair.left) === solution.groupByNode.get(pair.right);
    const leftVoltage = solution.nodeVoltages.get(pair.left);
    const rightVoltage = solution.nodeVoltages.get(pair.right);
    const voltageV = sameReference && leftVoltage !== undefined && rightVoltage !== undefined
      ? leftVoltage - rightVoltage
      : null;

    if (leftVoltage !== undefined) {
      terminalVoltages.push({
        componentId: component.id,
        terminalId: 'left',
        voltageV: leftVoltage,
        referenceGroup: solution.groupByNode.get(pair.left)!,
      });
    }
    if (rightVoltage !== undefined) {
      terminalVoltages.push({
        componentId: component.id,
        terminalId: 'right',
        voltageV: rightVoltage,
        referenceGroup: solution.groupByNode.get(pair.right)!,
      });
    }

    let currentA: number | null = 0;
    let powerW: number | null = null;
    let state: string | undefined;
    let note: string | undefined;

    switch (component.type) {
      case 'bateria':
        currentA = solution.sourceCurrents.get(component.id) ?? 0;
        state = currentA < -1e-9 ? 'Suministrando energía' : 'En reposo o recibiendo energía';
        powerW = voltageV === null ? null : voltageV * currentA;
        note = 'Corriente positiva definida de (+) hacia (−) dentro de la fuente. Un valor negativo indica que la batería entrega energía.';
        break;
      case 'resistencia':
        currentA = voltageV === null ? null : voltageV / resistanceInOhms(component);
        powerW = voltageV !== null && currentA !== null ? voltageV * currentA : null;
        break;
      case 'led': {
        const isOn = activeLeds.has(component.id);
        state = isOn ? 'Encendido' : 'Apagado';
        if (isOn && voltageV !== null) {
          currentA = Math.max(0, (voltageV - component.value) / options.ledOnResistanceOhms);
          note = `Modelo aproximado: caída directa de ${component.value} V y resistencia serie de ${options.ledOnResistanceOhms} Ω.`;
        } else {
          currentA = 0;
          note = voltageV === null
            ? 'No se puede determinar la polarización porque sus terminales están en redes sin referencia común.'
            : voltageV < 0
              ? 'Polarización inversa: el LED no conduce en este modelo.'
              : `La tensión directa no supera el umbral aproximado de ${component.value} V.`;
        }
        powerW = voltageV !== null && currentA !== null ? voltageV * currentA : null;
        if (currentA !== null && currentA > options.referenceLedCurrentAmps) {
          issues.push(issue(
            'LED_CURRENT_REFERENCE_EXCEEDED',
            `${component.reference} conduce ${(currentA * 1000).toFixed(2)} mA, por encima de la referencia educativa de ${options.referenceLedCurrentMilliAmps} mA. Revisa la resistencia en serie y la especificación del LED real.`,
            component.id,
          ));
        }
        break;
      }
      case 'capacitor':
        currentA = 0;
        powerW = 0;
        state = 'Circuito abierto en DC';
        note = 'El análisis de estado estable DC no calcula la carga inicial ni los transitorios del capacitor.';
        if (voltageV === null) {
          note += ' Su tensión tampoco es determinable sin una condición inicial o una ruta de referencia.';
        }
        break;
      case 'interruptor':
        if (component.value === 'cerrado') {
          currentA = null;
          state = 'Cerrado';
          powerW = null;
          note = 'Se modela como conductor ideal. La corriente individual del interruptor no se determina en este modelo.';
        } else {
          currentA = 0;
          powerW = voltageV === null ? null : 0;
          state = 'Abierto';
          note = 'Interruptor abierto: no circula corriente por su rama.';
        }
        break;
    }

    measurements.push({
      componentId: component.id,
      reference: component.reference,
      type: component.type,
      voltageV,
      currentA,
      powerW,
      ...(state ? { state } : {}),
      ...(note ? { note } : {}),
    });
  }

  const batteries = practice.components.filter((component) => component.type === 'bateria');
  if (batteries.length === 0) {
    issues.push(issue('NO_VOLTAGE_SOURCE', 'No hay una batería o fuente DC en el circuito. Sin una fuente independiente, el análisis no encontrará corriente de alimentación.'));
  }

  practice.components.forEach((component) => {
    if (component.type === 'capacitor') {
      issues.push(issue('CAPACITOR_DC_MODEL', `${component.reference} se trata como circuito abierto. La carga, descarga y respuesta temporal no se calculan en esta versión.`, component.id));
    }
    if (component.type === 'interruptor' && component.value === 'abierto') {
      issues.push(issue('OPEN_SWITCH', `${component.reference} está abierto y no permite el paso de corriente por su rama.`, component.id));
    }
    if (component.type === 'led' && !activeLeds.has(component.id)) {
      issues.push(issue('LED_NOT_CONDUCTING', `${component.reference} permanece apagado. Revisa su polaridad y que la tensión directa supere su caída indicada.`, component.id));
    }
  });

  const batteryCurrentMagnitude = measurements
    .filter((measurement) => measurement.type === 'bateria')
    .reduce((sum, measurement) => sum + Math.abs(measurement.currentA ?? 0), 0);
  if (batteries.length > 0 && batteryCurrentMagnitude < 1e-9) {
    issues.push(issue('NO_CLOSED_CURRENT_PATH', 'No se detectó corriente apreciable. Comprueba si hay un interruptor abierto, una conexión incompleta o una carga sin camino de retorno.'));
  }

  const hasErrors = issues.some((item) => item.severity === 'error');
  const hasWarnings = issues.length > 0;
  const status: SimulationStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';
  const summary = status === 'success'
    ? 'El punto de operación DC se calculó correctamente.'
    : status === 'warning'
      ? 'El circuito se resolvió, pero hay advertencias o componentes fuera del alcance del modelo.'
      : 'No fue posible completar la simulación. Revisa los errores indicados.';

  return {
    status,
    analysis: 'dc-operating-point',
    summary,
    measurements,
    terminalVoltages,
    issues,
    iterations,
    model: {
      ledOnResistanceOhms: options.ledOnResistanceOhms,
      ledOffResistanceOhms: options.ledOffResistanceOhms,
      referenceLedCurrentMilliAmps: options.referenceLedCurrentMilliAmps,
      capacitorMode: 'open-circuit-dc',
    },
  };
}

/** Variante directa para pruebas o herramientas que ya tienen un documento JSON validado. */
export function simulatePractice(
  practice: ElectroLabPractice,
  inputOptions: SimulationOptions = {},
): SimulationResult {
  // El adaptador valida la misma forma de documento cuando se convierte desde el editor;
  // aquí conservamos una sola ruta de cálculo utilizando un estado visual equivalente.
  const editorState: EditorCircuitState = {
    components: practice.components.map((component) => ({
      id: component.id,
      kind: component.type,
      reference: component.reference,
      value: component.type === 'interruptor'
        ? component.value === 'abierto' ? 'Abierto' : 'Cerrado'
        : String(component.value),
      unit: component.unit,
      x: (component.position.x / practice.canvas.width) * 100,
      y: (component.position.y / practice.canvas.height) * 1000,
    })),
    connections: practice.connections.map((connection) => ({
      id: connection.id,
      from: { componentId: connection.from.componentId, side: connection.from.terminalId },
      to: { componentId: connection.to.componentId, side: connection.to.terminalId },
    })),
  };
  return simulateCircuit(practice, editorState, inputOptions);
}
