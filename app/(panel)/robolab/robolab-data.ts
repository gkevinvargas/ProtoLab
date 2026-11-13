export interface Coord {
  x: number;
  y: number;
}

export type Orientation = 'Norte' | 'Este' | 'Sur' | 'Oeste';

export interface PracticaRoboLab {
  schema_version: string;
  contenido_id: string;
  plantilla_id: 'robot-navigation-2d';
  laboratorio: string;
  metadatos: {
    practica_num: string;
    titulo_practica: string;
    nivel: string;
    titulo_banner: string;
    descripcion_banner: string;
    mision_titulo: string;
    mision_descripcion: string;
    recompensa_xp: number;
  };
  contenido: {
    grid_dimensions: { rows: number; cols: number };
    initial_state: { x: number; y: number; orientation: Orientation };
    goal: Coord;
    obstacles: Coord[];
    max_moves: number;
    optimal_moves: number;
  };
}

export const practicasRoboLab: PracticaRoboLab[] = [
  {
    schema_version: '1.0',
    contenido_id: 'robolab-practica-03',
    plantilla_id: 'robot-navigation-2d',
    laboratorio: 'robolab',
    metadatos: {
      practica_num: 'Práctica 3: Recorrido con obstáculos',
      titulo_practica: 'Práctica 3: Recorrido con obstáculos',
      nivel: 'Nivel: Intermedio',
      titulo_banner: 'Simulador interactivo de robótica educativa',
      descripcion_banner:
        'Construye la secuencia algorítmica para guiar a Botty por la arena matricial. Calibra giros, mide trayectorias y alcanza el sensor de destino evitando los bloques de colisión.',
      mision_titulo: 'Traza el canal despejado hacia el punto de extracción',
      mision_descripcion:
        'Programa el microcontrolador de Botty agregando instrucciones a la pila de ejecución. Los sensores detectan obstáculos en las celdas (2,2), (3,4), (4,2) y (5,4). Si colisionas o sales de la cuadrícula, deberás reiniciar el ciclo.',
      recompensa_xp: 150,
    },
    contenido: {
      grid_dimensions: { rows: 6, cols: 6 },
      initial_state: { x: 1, y: 1, orientation: 'Este' },
      goal: { x: 6, y: 6 },
      obstacles: [
        { x: 2, y: 2 },
        { x: 3, y: 4 },
        { x: 4, y: 2 },
        { x: 5, y: 4 },
      ],
      max_moves: 12,
      optimal_moves: 10,
    },
  },
];