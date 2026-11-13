
export type DiagnosticAreaId =
  | "robolab"
  | "electrolab"
  | "datalab";

export type DiagnosticDimensionId =
  | "intereses"
  | "aptitudes"
  | "oferta_laboral";

export type DiagnosticClassification =
  | "principal"
  | "complementaria"
  | "exploratoria";

export type DiagnosticPublicationStatus =
  | "borrador"
  | "publicado"
  | "archivado";

export interface DiagnosticMetadata {
  titulo: string;
  descripcion: string;
  idioma: string;
}

export interface DiagnosticDimension {
  dimension_id: DiagnosticDimensionId;
  nombre: string;
}

export interface DiagnosticArea {
  area_id: DiagnosticAreaId;
  nombre: string;
}

export interface InterestSelectionConfig {
  tipo: "multiple";
  minimo: 1;
  maximo: 3;
  conservar_orden: true;
}

export interface DiagnosticInterest {
  identificador: string;
  etiqueta: string;
  areas_relacionadas: DiagnosticAreaId[];
}


export interface DiagnosticInterestCatalog {
  seleccion: InterestSelectionConfig;
  intereses: DiagnosticInterest[];
}

export type DiagnosticQuestionType =
  | "seleccion_unica"
  | "seleccion_multiple"
  | "escala";

export interface DiagnosticQuestionOption {
  opcion_id: string;
  texto: string;
}

export interface DiagnosticQuestion {
  identificador: string;
  area: DiagnosticAreaId;
  dimension: DiagnosticDimensionId;
  tipo: DiagnosticQuestionType;
  enunciado: string;
  obligatoria: boolean;
  opciones: DiagnosticQuestionOption[];
  ponderacion_maxima: number;
}

export interface DiagnosticPublicContent {
  schema_version: string;
  contenido_id: string;
  version_contenido: string;
  estado_publicacion: DiagnosticPublicationStatus;
  tipo_contenido: "diagnostico_vocacional";
  metadatos: DiagnosticMetadata;
  dimensiones: DiagnosticDimension[];
  areas: DiagnosticArea[];
  catalogo_intereses: DiagnosticInterestCatalog;
  preguntas: DiagnosticQuestion[];
}

export interface DiagnosticEvaluationConfig {
  escala_minima: number;
  escala_maxima: number;
  areas_evaluadas: DiagnosticAreaId[];
  dimensiones_evaluadas: DiagnosticDimensionId[];
}

export interface DiagnosticPrivateEvaluation {
  schema_version: string;
  evaluacion_id: string;
  version_evaluacion: string;
  configuracion: DiagnosticEvaluationConfig;
  evaluacion_privada_backend: {
    respuestas_correctas: unknown[];
    ponderaciones: unknown[];
    reglas_calculo: unknown[];
    reglas_desempate: unknown[];
  };
  configuracion_oferta_laboral: {
    alcance: "municipal";
    estado: string;
    municipio_id: string | null;
  };
}

export interface DiagnosticAreaResult {
  puntuacion: number;
}

export interface DiagnosticRankingItem {
  area_id: DiagnosticAreaId;
  puntuacion: number;
  clasificacion: DiagnosticClassification;
}

export interface DiagnosticTie {
  has_tie: boolean;
  tied_areas: DiagnosticAreaId[];
  selected_tiebreaker_area: DiagnosticAreaId | null;
}

export interface DiagnosticLearningRoute {
  area_principal: DiagnosticAreaId;
  area_complementaria: DiagnosticAreaId;
  area_exploratoria: DiagnosticAreaId;
}

export interface DiagnosticResult {
  diagnostico_id: string;
  estado: "completado";
  resultados: Record<DiagnosticAreaId, DiagnosticAreaResult>;
  ranking: DiagnosticRankingItem[];
  empate: DiagnosticTie;
  intereses_seleccionados: string[];
  ruta_aprendizaje: DiagnosticLearningRoute;
}
