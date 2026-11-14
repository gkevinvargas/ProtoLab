export type TipoActividad =
  | "animacion_secuencial"
  | "ordenar_bloques"
  | "completar_enunciados"
  | "calculo_guiado"
  | "sopa_letras";

export interface ActivityDefinition {
  tipo: TipoActividad;
  componente: string;
  nombre: string;
  descripcion: string;
}

/** Catálogo de tipos que reconoce el visor de clases de ProtoLab. */
export const ACTIVITY_REGISTRY: Record<TipoActividad, ActivityDefinition> = {
  animacion_secuencial: {
    tipo: "animacion_secuencial",
    componente: "AnimacionSecuencial",
    nombre: "Animación secuencial",
    descripcion: "Escena visual controlada por pasos.",
  },
  ordenar_bloques: {
    tipo: "ordenar_bloques",
    componente: "OrdenarBloques",
    nombre: "Ordenar bloques",
    descripcion: "Organizar conceptos en una secuencia lógica.",
  },
  completar_enunciados: {
    tipo: "completar_enunciados",
    componente: "CompletarEnunciados",
    nombre: "Completar enunciados",
    descripcion: "Completar frases mediante un banco de bloques.",
  },
  calculo_guiado: {
    tipo: "calculo_guiado",
    componente: "CalculoGuiado",
    nombre: "Cálculo guiado",
    descripcion: "Resolver un procedimiento numérico paso a paso.",
  },
  sopa_letras: {
    tipo: "sopa_letras",
    componente: "SopaLetras",
    nombre: "Sopa de letras",
    descripcion: "Localizar términos en una cuadrícula.",
  },
};

export function isRegisteredActivityType(value: string): value is TipoActividad {
  return Object.prototype.hasOwnProperty.call(ACTIVITY_REGISTRY, value);
}
