# ElectroLab: modelo, validación, simulación y evaluación

Esta carpeta concentra las estructuras y la lógica propia del módulo ElectroLab. No depende de React, Next.js ni Supabase.

## Archivos

- `types.ts`: contratos del documento JSON, el editor y la rúbrica de evaluación.
- `validation.ts`: validación estructural y semántica de prácticas, incluidos los criterios opcionales de evaluación.
- `adapter.ts`: conversión entre el modelo JSON y el estado interno de React.
- `simulation.ts`: motor para calcular el punto de operación de circuitos DC.
- `transient.ts`: análisis transitorio de carga y descarga RC.
- `evaluation.ts`: comparación del circuito y de sus resultados con la rúbrica de cada práctica.
- `schemas/practice.schema.json`: esquema JSON de referencia.
- `examples/`: prácticas listas para probar.

## Evaluación automática

Una práctica puede declarar `practice.evaluation` en su JSON. La rúbrica define la calificación mínima, el análisis requerido (`dc` o `rc`) y los criterios con sus respectivos puntos.

Criterios disponibles:

- `component-count`: verifica las cantidades de componentes.
- `component-value`: comprueba el valor y la unidad de una referencia.
- `connection-topology`: compara conexiones entre referencias y terminales.
- `analysis-status`: verifica que el análisis haya terminado sin errores bloqueantes.
- `dc-state`: comprueba el estado de un componente en el análisis DC.
- `dc-measurement-range`: compara voltaje, corriente o potencia con un intervalo.
- `rc-mode`: comprueba si se ejecutó carga o descarga.
- `rc-measurement-range`: compara la constante de tiempo o el voltaje final con un intervalo.

Ejemplo mínimo de configuración:

```json
"evaluation": {
  "passingScore": 70,
  "requiredAnalysis": "dc",
  "criteria": [
    {
      "id": "componentes",
      "type": "component-count",
      "title": "Componentes requeridos",
      "description": "Comprueba que estén los componentes indicados.",
      "points": 20,
      "expectedCounts": { "bateria": 1, "resistencia": 1, "led": 1 },
      "exact": true
    }
  ]
}
```

La función `evaluatePractice(practice, editorState, analysis)` devuelve el puntaje, el estado de aprobación y la retroalimentación de cada criterio. La interfaz muestra esos datos en una ventana modal después de ejecutar el análisis requerido.

**Alcance actual:** la calificación se calcula localmente en el navegador y se pierde al recargar o cambiar de práctica. No se registra en Supabase ni en un historial docente. Las prácticas JSON sin `practice.evaluation` siguen pudiéndose cargar y simular, pero no muestran una evaluación calificable.

## API de simulación

```ts
import { simulateCircuit, simulateRCTransient } from '@/lib/electrolab';

const dcResult = simulateCircuit(practice, { components, connections });

const rcResult = simulateRCTransient(
  practice,
  { components, connections },
  { mode: 'charge', initialVoltageV: 0 },
);
```

La evaluación recibe el resultado del análisis requerido:

```ts
import { evaluatePractice } from '@/lib/electrolab';

const evaluation = evaluatePractice(
  practice,
  { components, connections },
  { mode: 'dc', result: dcResult },
);
```

## Modelo eléctrico inicial

- **Batería:** fuente ideal de tensión continua, orientada de `left` (+) a `right` (−).
- **Resistencia:** resistencia lineal con conversión de Ω, kΩ y MΩ a ohmios.
- **LED:** modelo lineal por tramos e iterativo con caída directa declarada y resistencia serie equivalente de 5 Ω por defecto.
- **Interruptor cerrado:** conductor ideal; abierto: circuito abierto.
- **Capacitor en DC:** circuito abierto.
- **Transitorio RC:** un capacitor, una o varias resistencias, fuente DC para carga o sin batería para descarga, con método Backward Euler.

Los resultados son educativos y no sustituyen simuladores especializados, mediciones físicas ni las especificaciones de los fabricantes. El LED y los componentes siguen siendo modelos aproximados.
