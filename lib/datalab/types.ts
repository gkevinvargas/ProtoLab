

export interface VariableData {
nombre: string;
tipo: string;
etiqueta: string;
}

export interface PreguntaObjetiva {
tipo: string;
enunciado: string;
opciones?: string[];
placeholder?: string;
}

export interface RetoDataLab {
id_reto: string;
titulo: string;
nivel: string;
instrucciones: string;
configuracion_escenario: {
restriccion_grafica: string;
ejes_predefinidos?: { x: string; y: string } | null;
habilitar_calculadora_interna?: boolean;
};
evaluacion: {
pregunta_objetiva: PreguntaObjetiva;
pregunta_reflexion: {
enunciado: string;
longitud_minima_palabras: number;
};
};
}

export interface DataLabConfig {
schema_version: string;
contenido_id: string;
tipo_contenido: string;
metadatos: {
titulo: string;
descripcion: string;
autor: string;
plantilla_id: string;
};
contenido: {
configuracion_datos: {
fuente_datos: string;
descripcion_fuente: string;
variables_disponibles: VariableData[];
};
interfaz_visual: {
mostrar_tabla_datos: boolean;
mostrar_panel_filtros: boolean;
tipos_graficas_permitidas: string[];
};
retos: RetoDataLab[];
};
}