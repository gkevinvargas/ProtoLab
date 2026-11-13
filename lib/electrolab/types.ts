/**
 * Contrato de datos de ElectroLab.
 * Versión del formato: 1.0.0
 * Este archivo no depende de React ni de Next.js.
 */

export const COMPONENT_TYPES = [
  'bateria',
  'resistencia',
  'led',
  'capacitor',
  'interruptor',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];
export type Difficulty = 'principiante' | 'intermedio' | 'avanzado';
export type TerminalPolarity = 'positive' | 'negative' | 'neutral';
export type TerminalId = 'left' | 'right';

export interface PracticeInstruction {
  step: number;
  text: string;
}

export interface PracticeEvaluation {
  /** Calificación porcentual mínima para aprobar. */
  passingScore: number;
  /** Tipo de análisis que debe ejecutar el estudiante antes de evaluar. */
  requiredAnalysis: 'dc' | 'rc';
  criteria: EvaluationCriterion[];
}

export interface EvaluationConnectionEndpoint {
  reference: string;
  terminalId: TerminalId;
}

interface EvaluationCriterionBase {
  id: string;
  title: string;
  description: string;
  /** Puntaje asignado al criterio. La suma de la rúbrica representa el 100 %. */
  points: number;
}

export type EvaluationCriterion =
  | (EvaluationCriterionBase & {
      type: 'component-count';
      expectedCounts: Partial<Record<ComponentType, number>>;
      exact?: boolean;
    })
  | (EvaluationCriterionBase & {
      type: 'component-value';
      reference: string;
      expectedValue: number;
      unit: string;
      tolerance?: number;
    })
  | (EvaluationCriterionBase & {
      type: 'connection-topology';
      expectedConnections: Array<{
        from: EvaluationConnectionEndpoint;
        to: EvaluationConnectionEndpoint;
      }>;
      exact?: boolean;
    })
  | (EvaluationCriterionBase & { type: 'analysis-status' })
  | (EvaluationCriterionBase & {
      type: 'dc-state';
      reference: string;
      expectedState: string;
    })
  | (EvaluationCriterionBase & {
      type: 'dc-measurement-range';
      reference: string;
      metric: 'voltageV' | 'currentA' | 'powerW';
      min: number;
      max: number;
    })
  | (EvaluationCriterionBase & {
      type: 'rc-mode';
      expectedMode: 'charge' | 'discharge';
    })
  | (EvaluationCriterionBase & {
      type: 'rc-measurement-range';
      metric: 'timeConstantSeconds' | 'finalVoltageV';
      min: number;
      max: number;
    });

export interface EvaluationCriterionResult {
  id: string;
  title: string;
  description: string;
  pointsEarned: number;
  pointsPossible: number;
  passed: boolean;
  feedback: string;
}

export interface PracticeEvaluationResult {
  practiceId: string;
  practiceTitle: string;
  analysisMode: 'dc' | 'rc';
  pointsEarned: number;
  pointsPossible: number;
  score: number;
  passingScore: number;
  passed: boolean;
  criteria: EvaluationCriterionResult[];
  summary: string;
}

export interface PracticeMetadata {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  instructions: PracticeInstruction[];
  allowedComponentTypes: ComponentType[];
  evaluation?: PracticeEvaluation;
}

export interface CanvasDefinition {
  width: number;
  height: number;
  unit: 'px';
  origin: 'top-left';
  componentAnchor: 'center-top';
}

export interface CircuitTerminal {
  id: TerminalId;
  label: string;
  polarity: TerminalPolarity;
}

export interface ComponentPosition {
  /** Coordenadas lógicas del lienzo; no son píxeles del viewport. */
  x: number;
  y: number;
}

interface ComponentBase<TType extends ComponentType, TValue, TUnit extends string> {
  id: string;
  type: TType;
  reference: string;
  value: TValue;
  unit: TUnit;
  position: ComponentPosition;
  terminals: [CircuitTerminal, CircuitTerminal];
}

export type CircuitComponent =
  | (ComponentBase<'bateria', number, 'V'> & {
      terminals: [
        CircuitTerminal & { id: 'left'; label: '+'; polarity: 'positive' },
        CircuitTerminal & { id: 'right'; label: '−'; polarity: 'negative' },
      ];
    })
  | (ComponentBase<'resistencia', number, 'Ω' | 'kΩ' | 'MΩ'> & {
      terminals: [
        CircuitTerminal & { id: 'left'; label: '1'; polarity: 'neutral' },
        CircuitTerminal & { id: 'right'; label: '2'; polarity: 'neutral' },
      ];
    })
  | (ComponentBase<'led', number, 'V'> & {
      terminals: [
        CircuitTerminal & { id: 'left'; label: 'A'; polarity: 'positive' },
        CircuitTerminal & { id: 'right'; label: 'K'; polarity: 'negative' },
      ];
    })
  | (ComponentBase<'capacitor', number, 'pF' | 'nF' | 'µF'> & {
      terminals: [CircuitTerminal, CircuitTerminal];
    })
  | (ComponentBase<'interruptor', 'abierto' | 'cerrado', ''> & {
      terminals: [CircuitTerminal, CircuitTerminal];
    });

export interface TerminalReference {
  componentId: string;
  terminalId: TerminalId;
}

export interface CircuitConnection {
  id: string;
  from: TerminalReference;
  to: TerminalReference;
}

export interface ElectroLabPractice {
  schemaVersion: string;
  practice: PracticeMetadata;
  canvas: CanvasDefinition;
  components: CircuitComponent[];
  connections: CircuitConnection[];
}

/** Forma interna que utiliza actualmente electrolab-screen.tsx. */
export interface EditorComponentState {
  id: string;
  kind: ComponentType;
  reference: string;
  /** El editor actual muestra y edita el valor como texto. */
  value: string;
  unit: string;
  /** Porcentaje horizontal (0 a 100) en el lienzo de 1600 px actual. */
  x: number;
  /** Coordenada vertical lógica del lienzo. */
  y: number;
}

export interface EditorTerminalReference {
  componentId: string;
  side: TerminalId;
}

export interface EditorConnectionState {
  id: string;
  from: EditorTerminalReference;
  to: EditorTerminalReference;
}

export interface EditorCircuitState {
  components: EditorComponentState[];
  connections: EditorConnectionState[];
}

export type EditorSnapshot = EditorCircuitState;

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export type PracticeValidationResult =
  | { ok: true; data: ElectroLabPractice; issues: [] }
  | { ok: false; data: null; issues: ValidationIssue[] };

export type PracticeConversionResult =
  | { ok: true; data: ElectroLabPractice; issues: [] }
  | { ok: false; data: null; issues: ValidationIssue[] };

export type PracticeLoadResult =
  | { ok: true; practice: ElectroLabPractice; editorState: EditorCircuitState; issues: [] }
  | { ok: false; practice: null; editorState: null; issues: ValidationIssue[] };
