export const practicasDataLab = {
  "schema_version": "1.0",
  "contenido_id": "DL-MOD-01",
  "version_contenido": "1.0.0",
  "tipo_contenido": "actividad_analisis_datos",
  "laboratorio": "DataLab",
  "areas": [
    "Probabilidad y Estadística",
    "Orientación Vocacional",
    "Pensamiento Analítico"
  ],
  "tema": "Relación entre Educación STEM y Mercado Laboral",
  "orden": 1,
  "metadatos": {
    "titulo": "Explorador de Oportunidades STEM",
    "descripcion": "Cruza los datos de egresados y vacantes para descubrir qué carreras técnicas se necesitan urgentemente en tu región.",
    "autor": "",
    "plantilla_id": "data-analysis-2d"
  },
  "prerrequisitos": [
    "evaluacion_diagnostica_completada"
  ],
  "contenido": {
    "configuracion_datos": {
      "fuente_datos": "datalab_maestro_unificado.json",
      "descripcion_fuente": "Unificación de dataset_28 (SEJ) y dataset_36 (IIEG)",
      "variables_disponibles": [
        { "nombre": "nombre_municipio", "tipo": "categorica", "etiqueta": "Municipio" },
        { "nombre": "region_geografica", "tipo": "categorica", "etiqueta": "Región Geográfica" },
        { "nombre": "poblacion_total", "tipo": "numerica", "etiqueta": "Población Total" },
        { "nombre": "tasa_graduacion", "tipo": "numerica", "etiqueta": "Tasa de Graduación STEM (%)" },
        { "nombre": "vacantes_tecnicas", "tipo": "numerica", "etiqueta": "Vacantes Tecnológicas" },
        { "nombre": "salario_promedio", "tipo": "numerica", "etiqueta": "Salario Promedio (MXN)" },
        { "nombre": "brecha_talento", "tipo": "numerica_calculada", "etiqueta": "Brecha de Talento (Déficit)" }
      ]
    },
    "interfaz_visual": {
      "mostrar_tabla_datos": true,
      "mostrar_panel_filtros": true,
      "tipos_graficas_permitidas": ["barras", "dispersion", "lineas"]
    },
    "retos": [
      {
        "id_reto": "DL-01",
        "titulo": "¿Dónde están los técnicos?",
        "nivel": "Inicial",
        "instrucciones": "Genera una gráfica de barras que compare la Tasa de Graduación STEM entre los municipios preseleccionados.",
        "configuracion_escenario": {
          "restriccion_grafica": "barras",
          "ejes_predefinidos": {
            "x": "nombre_municipio",
            "y": "tasa_graduacion"
          },
          "filtros_activos": [
            { "variable": "region_geografica", "valor_defecto": "Centro", "bloqueado": false }
          ]
        },
        "evaluacion": {
          "pregunta_objetiva": {
            "tipo": "opcion_multiple",
            "enunciado": "De los municipios mostrados en tu gráfica, ¿cuál tiene el menor porcentaje de graduados en áreas tecnológicas?",
            "opciones": ["Guadalajara", "Zapopan", "Tlajomulco", "Tonalá"]
          },
          "pregunta_reflexion": {
            "enunciado": "¿Por qué crees que este municipio tiene menos graduados técnicos que los demás?",
            "longitud_minima_palabras": 15
          }
        },
        "retroalimentacion_ui": {
          "mensaje_exito": "¡Excelente lectura de datos! Has identificado correctamente el municipio con menor índice STEM.",
          "mensaje_error": "Revisa bien las alturas de las barras y el municipio correspondiente antes de seleccionar."
        }
      },
      {
        "id_reto": "DL-02",
        "titulo": "Oferta vs Demanda",
        "nivel": "Intermedio",
        "instrucciones": "Cruza la Tasa de Graduación STEM (Eje X) con las Vacantes Técnicas (Eje Y) utilizando un Gráfico de Dispersión. Filtra los municipios con menos de 10,000 habitantes.",
        "configuracion_escenario": {
          "restriccion_grafica": "dispersion",
          "ejes_predefinidos": null,
          "filtros_requeridos": [
            { "variable": "poblacion_total", "condicion": "mayor_que", "valor": 10000 }
          ]
        },
        "evaluacion": {
          "pregunta_objetiva": {
            "tipo": "opcion_multiple",
            "enunciado": "Observando la nube de puntos, ¿cuál es la tendencia principal?",
            "opciones": [
              "A mayor tasa de graduación, mayor demanda laboral",
              "A mayor tasa de graduación, menor demanda laboral",
              "No existe ninguna relación visible"
            ]
          },
          "pregunta_reflexion": {
            "enunciado": "Identifica un municipio (punto) que rompa la regla general (alta demanda pero bajos graduados). ¿Qué oportunidad ves ahí?",
            "longitud_minima_palabras": 15
          }
        },
        "retroalimentacion_ui": {
          "mensaje_exito": "¡Bien hecho! Acabas de encontrar una correlación estadística positiva.",
          "mensaje_error": "Parece que olvidaste aplicar el filtro de población o configuraste mal los ejes. Inténtalo de nuevo."
        }
      },
      {
        "id_reto": "DL-03",
        "titulo": "Inversión Estratégica",
        "nivel": "Avanzado",
        "instrucciones": "Eres consultor de la Secretaría de Educación. Analiza la 'Brecha de Talento' (Vacantes vs Graduados) y descubre qué municipio requiere urgentemente un nuevo plantel técnico.",
        "configuracion_escenario": {
          "restriccion_grafica": "libre",
          "ejes_predefinidos": null,
          "habilitar_calculadora_interna": true
        },
        "evaluacion": {
          "pregunta_objetiva": {
            "tipo": "entrada_texto",
            "enunciado": "Escribe el nombre exacto del municipio con la mayor 'Brecha de Talento' numérica (Déficit de técnicos).",
            "placeholder": "Ej. Zapopan"
          },
          "pregunta_reflexion": {
            "enunciado": "Como director de este nuevo plantel, basándote en los datos del IMSS, ¿qué carrera técnica abrirías en ese municipio y por qué?",
            "longitud_minima_palabras": 15
          }
        },
        "retroalimentacion_ui": {
          "mensaje_exito": "¡Felicidades Analista! Has usado datos reales para justificar la construcción de una escuela que cambiará la región.",
          "mensaje_error": "El municipio ingresado no es el que tiene mayor déficit. Ordena tu tabla de mayor a menor en la columna 'Brecha de Talento'."
        }
      }
    ]
  }
};