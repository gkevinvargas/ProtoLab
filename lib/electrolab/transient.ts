import { editorStateToPractice } from './adapter';
import type {
  CircuitComponent,
  EditorCircuitState,
  ElectroLabPractice,
} from './types';

export type RCTransientMode = 'charge' | 'discharge';
export type RCTransientStatus = 'success' | 'warning' | 'error';

export interface RCTransientOptions {
  mode: RCTransientMode;
  /** Voltaje inicial del capacitor, medido de su terminal izquierdo al derecho. */
  initialVoltageV?: number;
  /** Duración total expresada como múltiplo de la constante de tiempo. */
  durationTimeConstants?: number;
  /** Cantidad de muestras incluyendo el instante inicial. */
  sampleCount?: number;
}

export interface RCTransientSample {
  timeSeconds: number;
  capacitorVoltageV: number;
  capacitorCurrentA: number;
  resistorVoltageV: number;
  resistorCurrentA: number;
}

export interface RCTransientIssue {
  code: string;
  severity: 'warning' | 'error';
  message: string;
}

export interface RCTransientResult {
  status: RCTransientStatus;
  analysis: 'rc-transient';
  mode: RCTransientMode;
  summary: string;
  capacitorReference: string | null;
  resistorReference: string | null;
  capacitanceF: number | null;
  equivalentResistanceOhms: number | null;
  timeConstantSeconds: number | null;
  initialVoltageV: number;
  finalVoltageV: number | null;
  durationSeconds: number;
  sampleCount: number;
  samples: RCTransientSample[];
  issues: RCTransientIssue[];
  model: {
    integrationMethod: 'backward-euler';
    assumedCapacitorInitialVoltageV: number;
    supportedCapacitors: 1;
    ledModel: 'not-supported-in-transient';
  };
}

interface NodePair {
  left: string;
  right: string;
}

interface Topology {
  nodesByComponent: Map<string, NodePair>;
  nodeIds: string[];
  groupByNode: Map<string, number>;
}

interface StepSolution {
  nodeVoltages: Map<string, number>;
  sourceCurrents: Map<string, number>;
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

function terminalKey(componentId: string, side: 'left' | 'right') {
  return `${componentId}::${side}`;
}

function resistanceInOhms(component: Extract<CircuitComponent, { type: 'resistencia' }>): number {
  const multiplier = component.unit === 'kΩ' ? 1_000 : component.unit === 'MΩ' ? 1_000_000 : 1;
  return component.value * multiplier;
}

function capacitanceInFarads(component: Extract<CircuitComponent, { type: 'capacitor' }>): number {
  const multiplier = component.unit === 'pF' ? 1e-12 : component.unit === 'nF' ? 1e-9 : 1e-6;
  return component.value * multiplier;
}

function addEdge(adjacency: Map<string, Set<string>>, a: string, b: string) {
  if (a === b) return;
  adjacency.get(a)?.add(b);
  adjacency.get(b)?.add(a);
}

function buildTopology(practice: ElectroLabPractice): Topology {
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

  for (const component of practice.components) {
    if (component.type === 'interruptor' && component.value === 'cerrado') {
      sets.union(terminalKey(component.id, 'left'), terminalKey(component.id, 'right'));
    }
  }

  const nodesByComponent = new Map<string, NodePair>();
  const nodeIds: string[] = [];
  const seen = new Set<string>();
  for (const component of practice.components) {
    const left = sets.find(terminalKey(component.id, 'left'));
    const right = sets.find(terminalKey(component.id, 'right'));
    nodesByComponent.set(component.id, { left, right });
    if (!seen.has(left)) { seen.add(left); nodeIds.push(left); }
    if (!seen.has(right)) { seen.add(right); nodeIds.push(right); }
  }

  const adjacency = new Map(nodeIds.map((node) => [node, new Set<string>()]));
  for (const component of practice.components) {
    if (component.type === 'bateria' || component.type === 'resistencia' || component.type === 'capacitor') {
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

  return { nodesByComponent, nodeIds, groupByNode };
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
      if (ratio > bestRatio) { bestRatio = ratio; pivotRow = row; }
    }
    if (Math.abs(matrix[pivotRow][pivotColumn]) < 1e-24 || bestRatio < 1e-14) return null;

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
    for (let column = row + 1; column < size; column += 1) remainder -= matrix[row][column] * result[column];
    const pivot = matrix[row][row];
    if (Math.abs(pivot) < 1e-24) return null;
    result[row] = remainder / pivot;
    if (!Number.isFinite(result[row])) return null;
  }
  return result;
}

function calculateEquivalentResistance(
  practice: ElectroLabPractice,
  capacitor: Extract<CircuitComponent, { type: 'capacitor' }>,
): number | null {
  // Para obtener R_th se desactivan las fuentes ideales de voltaje (se sustituyen por cortos).
  const sets = new DisjointSet();
  for (const component of practice.components) {
    sets.add(terminalKey(component.id, 'left'));
    sets.add(terminalKey(component.id, 'right'));
  }
  for (const wire of practice.connections) {
    sets.union(terminalKey(wire.from.componentId, wire.from.terminalId), terminalKey(wire.to.componentId, wire.to.terminalId));
  }
  for (const component of practice.components) {
    if (component.type === 'interruptor' && component.value === 'cerrado') {
      sets.union(terminalKey(component.id, 'left'), terminalKey(component.id, 'right'));
    }
    if (component.type === 'bateria') {
      sets.union(terminalKey(component.id, 'left'), terminalKey(component.id, 'right'));
    }
  }

  const capLeft = sets.find(terminalKey(capacitor.id, 'left'));
  const capRight = sets.find(terminalKey(capacitor.id, 'right'));
  if (capLeft === capRight) return 0;

  const resistorPairs = practice.components
    .filter((component): component is Extract<CircuitComponent, { type: 'resistencia' }> => component.type === 'resistencia')
    .map((component) => ({
      component,
      left: sets.find(terminalKey(component.id, 'left')),
      right: sets.find(terminalKey(component.id, 'right')),
      resistance: resistanceInOhms(component),
    }));

  const nodes = new Set<string>([capLeft, capRight]);
  resistorPairs.forEach((pair) => { nodes.add(pair.left); nodes.add(pair.right); });
  const adjacency = new Map([...nodes].map((node) => [node, new Set<string>()]));
  resistorPairs.forEach((pair) => addEdge(adjacency, pair.left, pair.right));

  const reachable = new Set<string>([capLeft]);
  const queue = [capLeft];
  while (queue.length) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!reachable.has(neighbor)) { reachable.add(neighbor); queue.push(neighbor); }
    }
  }
  if (!reachable.has(capRight)) return null;

  const groupByNode = new Map<string, number>();
  let group = 0;
  for (const start of nodes) {
    if (groupByNode.has(start)) continue;
    const pending = [start];
    groupByNode.set(start, group);
    while (pending.length) {
      const current = pending.shift()!;
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!groupByNode.has(neighbor)) { groupByNode.set(neighbor, group); pending.push(neighbor); }
      }
    }
    group += 1;
  }

  const groundNodes = new Set<string>();
  const firstByGroup = new Map<number, string>();
  for (const node of nodes) {
    const nodeGroup = groupByNode.get(node)!;
    if (!firstByGroup.has(nodeGroup)) firstByGroup.set(nodeGroup, node);
  }
  firstByGroup.forEach((node) => groundNodes.add(node));
  const unknownNodes = [...nodes].filter((node) => !groundNodes.has(node));
  const nodeIndex = new Map(unknownNodes.map((node, index) => [node, index]));
  const matrix = Array.from({ length: unknownNodes.length }, () => Array<number>(unknownNodes.length).fill(0));
  const rhs = Array<number>(unknownNodes.length).fill(0);

  for (const pair of resistorPairs) {
    if (pair.left === pair.right) continue;
    const conductance = 1 / pair.resistance;
    const left = nodeIndex.get(pair.left);
    const right = nodeIndex.get(pair.right);
    if (left !== undefined) matrix[left][left] += conductance;
    if (right !== undefined) matrix[right][right] += conductance;
    if (left !== undefined && right !== undefined) {
      matrix[left][right] -= conductance;
      matrix[right][left] -= conductance;
    }
  }

  // Inyección de prueba de 1 A entre los terminales del capacitor: R_th = V/I.
  const capLeftIndex = nodeIndex.get(capLeft);
  const capRightIndex = nodeIndex.get(capRight);
  if (capLeftIndex !== undefined) rhs[capLeftIndex] += 1;
  if (capRightIndex !== undefined) rhs[capRightIndex] -= 1;
  const solved = solveLinearSystem(matrix, rhs);
  if (!solved) return null;

  const voltage = (node: string) => {
    const index = nodeIndex.get(node);
    return index === undefined ? 0 : solved[index];
  };
  const equivalent = voltage(capLeft) - voltage(capRight);
  return Number.isFinite(equivalent) && equivalent > 0 ? equivalent : equivalent === 0 ? 0 : null;
}

function solveTransientStep(
  practice: ElectroLabPractice,
  topology: Topology,
  capacitor: Extract<CircuitComponent, { type: 'capacitor' }>,
  previousCapacitorVoltageV: number,
  deltaTimeSeconds: number,
): StepSolution | null {
  const batteries = practice.components.filter((component) => component.type === 'bateria');
  for (const battery of batteries) {
    const pair = topology.nodesByComponent.get(battery.id)!;
    if (pair.left === pair.right) return null;
  }

  const firstNodeByGroup = new Map<number, string>();
  for (const node of topology.nodeIds) {
    const group = topology.groupByNode.get(node)!;
    if (!firstNodeByGroup.has(group)) firstNodeByGroup.set(group, node);
  }
  const groundNodes = new Set(firstNodeByGroup.values());
  const voltageNodes = topology.nodeIds.filter((node) => !groundNodes.has(node));
  const nodeIndex = new Map(voltageNodes.map((node, index) => [node, index]));
  const sourceOffset = voltageNodes.length;
  const matrixSize = voltageNodes.length + batteries.length;
  const matrix = Array.from({ length: matrixSize }, () => Array<number>(matrixSize).fill(0));
  const rhs = Array<number>(matrixSize).fill(0);

  function stampConductance(p: string, n: string, resistance: number, seriesHistoryV = 0) {
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
    if (pi !== undefined) rhs[pi] += conductance * seriesHistoryV;
    if (ni !== undefined) rhs[ni] -= conductance * seriesHistoryV;
  }

  const sourceIndices = new Map<string, number>();
  batteries.forEach((battery, index) => {
    const pair = topology.nodesByComponent.get(battery.id)!;
    const pIndex = nodeIndex.get(pair.left);
    const nIndex = nodeIndex.get(pair.right);
    const sourceIndex = sourceOffset + index;
    sourceIndices.set(battery.id, sourceIndex);
    if (pIndex !== undefined) { matrix[pIndex][sourceIndex] += 1; matrix[sourceIndex][pIndex] += 1; }
    if (nIndex !== undefined) { matrix[nIndex][sourceIndex] -= 1; matrix[sourceIndex][nIndex] -= 1; }
    rhs[sourceIndex] = battery.value;
  });

  for (const component of practice.components) {
    const pair = topology.nodesByComponent.get(component.id)!;
    if (component.type === 'resistencia') {
      stampConductance(pair.left, pair.right, resistanceInOhms(component));
    } else if (component.type === 'capacitor') {
      const capacitance = capacitanceInFarads(component);
      const equivalentResistance = deltaTimeSeconds / capacitance;
      stampConductance(pair.left, pair.right, equivalentResistance, previousCapacitorVoltageV);
    }
  }

  const solved = solveLinearSystem(matrix, rhs);
  if (!solved) return null;

  const nodeVoltages = new Map<string, number>();
  groundNodes.forEach((node) => nodeVoltages.set(node, 0));
  voltageNodes.forEach((node, index) => nodeVoltages.set(node, solved[index]));
  const sourceCurrents = new Map<string, number>();
  sourceIndices.forEach((index, componentId) => sourceCurrents.set(componentId, solved[index]));
  return { nodeVoltages, sourceCurrents };
}

function makeFailure(
  mode: RCTransientMode,
  initialVoltageV: number,
  message: string,
  issue: RCTransientIssue,
): RCTransientResult {
  return {
    status: 'error',
    analysis: 'rc-transient',
    mode,
    summary: message,
    capacitorReference: null,
    resistorReference: null,
    capacitanceF: null,
    equivalentResistanceOhms: null,
    timeConstantSeconds: null,
    initialVoltageV,
    finalVoltageV: null,
    durationSeconds: 0,
    sampleCount: 0,
    samples: [],
    issues: [issue],
    model: {
      integrationMethod: 'backward-euler',
      assumedCapacitorInitialVoltageV: initialVoltageV,
      supportedCapacitors: 1,
      ledModel: 'not-supported-in-transient',
    },
  };
}

function normalizeTransientOptions(options: RCTransientOptions) {
  const initialVoltageV = options.initialVoltageV ?? (options.mode === 'charge' ? 0 : 5);
  const durationTimeConstants = options.durationTimeConstants ?? 5;
  const sampleCount = options.sampleCount ?? 201;
  if (!Number.isFinite(initialVoltageV)) throw new Error('El voltaje inicial debe ser un número finito.');
  if (!Number.isFinite(durationTimeConstants) || durationTimeConstants <= 0 || durationTimeConstants > 20) {
    throw new Error('La duración debe estar entre más de 0 y 20 constantes de tiempo.');
  }
  if (!Number.isInteger(sampleCount) || sampleCount < 20 || sampleCount > 1000) {
    throw new Error('La cantidad de muestras debe ser un entero entre 20 y 1000.');
  }
  return { initialVoltageV, durationTimeConstants, sampleCount };
}

/**
 * Simula la respuesta temporal de un circuito RC lineal de primer orden.
 * Usa MNA con integración implícita Backward Euler. Acepta una resistencia equivalente
 * formada por varias resistencias, una batería DC en carga, interruptores y un capacitor.
 * Los LEDs y las redes con más de un capacitor se rechazan explícitamente en esta etapa.
 */
export function simulateRCTransient(
  sourcePractice: ElectroLabPractice,
  editorState: EditorCircuitState,
  inputOptions: RCTransientOptions,
): RCTransientResult {
  let normalized: ReturnType<typeof normalizeTransientOptions>;
  try {
    normalized = normalizeTransientOptions(inputOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Las opciones del análisis RC no son válidas.';
    return makeFailure(inputOptions.mode, inputOptions.initialVoltageV ?? 0, message, {
      code: 'INVALID_TRANSIENT_OPTIONS', severity: 'error', message,
    });
  }

  const { initialVoltageV, durationTimeConstants, sampleCount } = normalized;
  const conversion = editorStateToPractice(sourcePractice, editorState);
  if (!conversion.ok) {
    const message = conversion.issues.map((item) => `${item.path}: ${item.message}`).join(' ');
    return makeFailure(inputOptions.mode, initialVoltageV, 'El circuito contiene datos inválidos. Corrígelos antes del análisis transitorio.', {
      code: 'INVALID_CIRCUIT', severity: 'error', message,
    });
  }

  const practice = conversion.data;
  const capacitors = practice.components.filter((component) => component.type === 'capacitor');
  const resistors = practice.components.filter((component): component is Extract<CircuitComponent, { type: 'resistencia' }> => component.type === 'resistencia');
  const batteries = practice.components.filter((component) => component.type === 'bateria');
  const leds = practice.components.filter((component) => component.type === 'led');

  if (capacitors.length !== 1) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'Este análisis RC de primera etapa requiere exactamente un capacitor.', {
      code: 'UNSUPPORTED_CAPACITOR_COUNT', severity: 'error', message: `Se encontraron ${capacitors.length} capacitores. El modelo actual admite uno por circuito.`,
    });
  }
  if (resistors.length === 0) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'El circuito necesita al menos una resistencia para definir su constante de tiempo.', {
      code: 'MISSING_RESISTOR', severity: 'error', message: 'Agrega una resistencia que proporcione el camino de carga o descarga del capacitor.',
    });
  }
  if (leds.length > 0) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'El análisis RC temporal todavía no admite LEDs.', {
      code: 'LED_NOT_SUPPORTED', severity: 'error', message: 'Retira los LEDs del circuito o utiliza el análisis DC. El modelo transitorio actual se limita a redes RC lineales.',
    });
  }
  if (inputOptions.mode === 'charge' && batteries.length !== 1) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'Para analizar la carga se requiere exactamente una batería DC.', {
      code: 'CHARGE_REQUIRES_ONE_SOURCE', severity: 'error', message: `Se encontraron ${batteries.length} baterías. El modo de carga admite una fuente ideal DC.`,
    });
  }
  if (inputOptions.mode === 'discharge' && batteries.length > 0) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'Para analizar la descarga, el circuito debe estar aislado de fuentes de voltaje.', {
      code: 'DISCHARGE_WITH_SOURCE', severity: 'error', message: 'Retira la batería del circuito. El capacitor comenzará con el voltaje inicial que indiques.',
    });
  }

  const capacitor = capacitors[0];
  const capacitanceF = capacitanceInFarads(capacitor);
  if (!(capacitanceF > 0) || !Number.isFinite(capacitanceF)) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'La capacitancia no es válida.', {
      code: 'INVALID_CAPACITANCE', severity: 'error', message: `${capacitor.reference} debe tener una capacitancia mayor que cero.`,
    });
  }

  const equivalentResistanceOhms = calculateEquivalentResistance(practice, capacitor);
  if (equivalentResistanceOhms === null) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'No existe un camino resistivo entre los terminales del capacitor.', {
      code: 'NO_RESISTIVE_PATH', severity: 'error', message: 'Comprueba las conexiones y que los interruptores necesarios estén cerrados.',
    });
  }
  if (!(equivalentResistanceOhms > 0) || !Number.isFinite(equivalentResistanceOhms)) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'La resistencia equivalente debe ser mayor que cero.', {
      code: 'INVALID_EQUIVALENT_RESISTANCE', severity: 'error', message: 'El capacitor está cortocircuitado o la red no tiene una resistencia equivalente finita.',
    });
  }

  const timeConstantSeconds = equivalentResistanceOhms * capacitanceF;
  const durationSeconds = durationTimeConstants * timeConstantSeconds;
  const deltaTimeSeconds = durationSeconds / (sampleCount - 1);
  if (!Number.isFinite(deltaTimeSeconds) || deltaTimeSeconds <= 0) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'No se pudo determinar el intervalo de integración.', {
      code: 'INVALID_TIME_STEP', severity: 'error', message: 'Revisa los valores de resistencia y capacitancia.',
    });
  }

  const topology = buildTopology(practice);
  for (const battery of batteries) {
    const pair = topology.nodesByComponent.get(battery.id)!;
    if (pair.left === pair.right) {
      return makeFailure(inputOptions.mode, initialVoltageV, 'La batería está en cortocircuito.', {
        code: 'SOURCE_SHORT_CIRCUIT', severity: 'error', message: `Los terminales de ${battery.reference} pertenecen al mismo nodo.`,
      });
    }
  }

  // Comprueba que la fuente y el capacitor pertenezcan a la misma red durante la carga.
  if (inputOptions.mode === 'charge') {
    const capPair = topology.nodesByComponent.get(capacitor.id)!;
    const battery = batteries[0];
    const batteryPair = topology.nodesByComponent.get(battery.id)!;
    const capacitorGroup = topology.groupByNode.get(capPair.left);
    const sourceGroup = topology.groupByNode.get(batteryPair.left);
    if (capacitorGroup !== sourceGroup) {
      return makeFailure(inputOptions.mode, initialVoltageV, 'La batería no está conectada a la red del capacitor.', {
        code: 'SOURCE_NOT_CONNECTED_TO_CAPACITOR', severity: 'error', message: 'Conecta la batería, la resistencia y el capacitor dentro de una misma red eléctrica.',
      });
    }
  }

  const capacitorPair = topology.nodesByComponent.get(capacitor.id)!;
  if (capacitorPair.left === capacitorPair.right) {
    return makeFailure(inputOptions.mode, initialVoltageV, 'El capacitor está cortocircuitado.', {
      code: 'CAPACITOR_SHORT_CIRCUIT', severity: 'error', message: `Los terminales de ${capacitor.reference} pertenecen al mismo nodo.`,
    });
  }

  const resistor = resistors[0];
  const resistorPair = topology.nodesByComponent.get(resistor.id)!;
  let previousVoltage = initialVoltageV;
  const samples: RCTransientSample[] = [{
    timeSeconds: 0,
    capacitorVoltageV: previousVoltage,
    capacitorCurrentA: 0,
    resistorVoltageV: 0,
    resistorCurrentA: 0,
  }];

  for (let index = 1; index < sampleCount; index += 1) {
    const solved = solveTransientStep(practice, topology, capacitor, previousVoltage, deltaTimeSeconds);
    if (!solved) {
      return makeFailure(inputOptions.mode, initialVoltageV, 'No se pudo resolver un paso temporal del circuito RC.', {
        code: 'TRANSIENT_SYSTEM_SINGULAR', severity: 'error', message: 'El sistema eléctrico es singular. Comprueba conexiones, interruptores y fuentes ideales.',
      });
    }

    const capLeftV = solved.nodeVoltages.get(capacitorPair.left);
    const capRightV = solved.nodeVoltages.get(capacitorPair.right);
    if (capLeftV === undefined || capRightV === undefined) {
      return makeFailure(inputOptions.mode, initialVoltageV, 'No se pudo determinar el voltaje del capacitor.', {
        code: 'CAPACITOR_VOLTAGE_UNAVAILABLE', severity: 'error', message: 'Los terminales del capacitor no tienen una referencia eléctrica válida.',
      });
    }
    const capacitorVoltageV = capLeftV - capRightV;
    const capacitorCurrentA = capacitanceF * (capacitorVoltageV - previousVoltage) / deltaTimeSeconds;
    const resistorLeftV = solved.nodeVoltages.get(resistorPair.left) ?? 0;
    const resistorRightV = solved.nodeVoltages.get(resistorPair.right) ?? 0;
    const resistorVoltageV = resistorLeftV - resistorRightV;
    const resistorCurrentA = resistorVoltageV / resistanceInOhms(resistor);
    const timeSeconds = index * deltaTimeSeconds;

    samples.push({ timeSeconds, capacitorVoltageV, capacitorCurrentA, resistorVoltageV, resistorCurrentA });
    previousVoltage = capacitorVoltageV;
  }

  // En t = 0 se muestra la corriente inicial inmediatamente posterior a la conexión.
  // La primera muestra numérica aproxima esa condición con el primer paso implícito.
  if (samples.length > 1) samples[0].capacitorCurrentA = samples[1].capacitorCurrentA;
  const finalVoltageV = samples[samples.length - 1]?.capacitorVoltageV ?? initialVoltageV;
  const issues: RCTransientIssue[] = [];
  if (inputOptions.mode === 'charge' && finalVoltageV < initialVoltageV) {
    issues.push({ code: 'CHARGE_POLARITY_REVERSED', severity: 'warning', message: 'El capacitor está orientado en sentido contrario a la polaridad de carga esperada. Revisa la conexión de sus terminales.' });
  }
  if (practice.components.some((component) => component.type === 'interruptor' && component.value === 'abierto')) {
    issues.push({ code: 'OPEN_SWITCH_PRESENT', severity: 'warning', message: 'Hay al menos un interruptor abierto. El resultado corresponde a la topología que permanece conectada.' });
  }

  const modeLabel = inputOptions.mode === 'charge' ? 'carga' : 'descarga';
  const status: RCTransientStatus = issues.length > 0 ? 'warning' : 'success';
  const summary = `Análisis de ${modeLabel} RC completado. τ = ${timeConstantSeconds.toPrecision(4)} s; se calcularon ${samples.length} muestras durante ${(durationSeconds).toPrecision(4)} s.`;

  return {
    status,
    analysis: 'rc-transient',
    mode: inputOptions.mode,
    summary,
    capacitorReference: capacitor.reference,
    resistorReference: resistor.reference,
    capacitanceF,
    equivalentResistanceOhms,
    timeConstantSeconds,
    initialVoltageV,
    finalVoltageV,
    durationSeconds,
    sampleCount: samples.length,
    samples,
    issues,
    model: {
      integrationMethod: 'backward-euler',
      assumedCapacitorInitialVoltageV: initialVoltageV,
      supportedCapacitors: 1,
      ledModel: 'not-supported-in-transient',
    },
  };
}
