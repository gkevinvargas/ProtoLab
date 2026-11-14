export type LaboratorioId = "robolab" | "electrolab" | "datalab";
export type EstadoPublicacion = "borrador" | "publicado" | "archivado";

export interface SeccionTeorica {
  titulo: string;
  parrafos: string[];
}

export interface PracticaRelacionada {
  practica_id: string;
  tipo_contenido: "practica_individual" | "practica_complementaria";
  aplicacion: string;
}

export interface ClaseTeorica {
  schema_version: "1.1.0";
  version_contenido: string;
  identificador: string;
  laboratorio_id: LaboratorioId;
  tipo_contenido: "clase_teorica";
  estado_publicacion: EstadoPublicacion;
  titulo: string;
  descripcion: string;
  orden: number;
  duracion_estimada_minutos: number;
  objetivos: string[];
  secciones: SeccionTeorica[];
  actividades_interactivas: ActividadInteractiva[];
  prepara_para: PracticaRelacionada[];
}

export interface ActividadBase<TTipo extends string, TConfiguracion> {
  id: string;
  tipo: TTipo;
  titulo: string;
  instrucciones: string;
  duracion_estimada_minutos: number;
  obligatoria: boolean;
  configuracion: TConfiguracion;
}

export interface PasoAnimacion {
  orden: number;
  duracion_ms: number;
  estado_visual: string;
  titulo: string;
  explicacion: string;
  resaltar: string[];
  animaciones?: Array<{
    tipo: string;
    direccion?: string;
    recorrido?: string[];
  }>;
}

export interface AnimacionSecuencialConfig {
  escenario: string;
  reproduccion: {
    inicio_automatico: boolean;
    repetir: boolean;
    controles: string[];
  };
  pasos: PasoAnimacion[];
}

export interface OrdenarBloquesConfig {
  mezclar_al_cargar: boolean;
  permitir_reintentar: boolean;
  bloques: Array<{ id: string; texto: string }>;
  orden_correcto: string[];
  retroalimentacion: { correcta: string; incorrecta: string };
}

export interface CompletarEnunciadosConfig {
  modo_respuesta: string;
  mezclar_opciones: boolean;
  permitir_reintentar: boolean;
  banco_bloques: Array<{ id: string; texto: string }>;
  enunciados: Array<{
    id: string;
    segmentos: Array<
      | { tipo: "texto"; contenido: string }
      | { tipo: "espacio"; id: string; respuesta: string }
    >;
    retroalimentacion: string;
  }>;
  retroalimentacion: { correcta: string; incorrecta: string };
}

export interface CalculoGuiadoConfig {
  modo_respuesta: string;
  permitir_reintentar: boolean;
  datos: Array<{ id: string; etiqueta: string; valor: number; unidad: string }>;
  formula_principal: string;
  nota_unidades: string;
  pasos: Array<{
    id: string;
    consigna: string;
    formula: string;
    respuesta_esperada: number;
    unidad: string;
    tolerancia_absoluta: number;
    pista: string;
    explicacion: string;
  }>;
  retroalimentacion: { correcta: string; incorrecta: string };
}

export interface SopaLetrasConfig {
  filas: number;
  columnas: number;
  relleno: string;
  mostrar_lista_palabras: boolean;
  permitir_reintentar: boolean;
  direcciones_permitidas: Array<"horizontal" | "vertical">;
  cuadricula: string[];
  palabras: Array<{ texto: string; pista: string }>;
  soluciones: Array<{
    palabra: string;
    fila_inicio: number;
    columna_inicio: number;
    direccion: "horizontal" | "vertical";
  }>;
  retroalimentacion: { completada: string; ayuda: string };
}

export type AnimacionSecuencial = ActividadBase<"animacion_secuencial", AnimacionSecuencialConfig>;
export type OrdenarBloques = ActividadBase<"ordenar_bloques", OrdenarBloquesConfig>;
export type CompletarEnunciados = ActividadBase<"completar_enunciados", CompletarEnunciadosConfig>;
export type CalculoGuiado = ActividadBase<"calculo_guiado", CalculoGuiadoConfig>;
export type SopaLetras = ActividadBase<"sopa_letras", SopaLetrasConfig>;

export type ActividadInteractiva =
  | AnimacionSecuencial
  | OrdenarBloques
  | CompletarEnunciados
  | CalculoGuiado
  | SopaLetras;
