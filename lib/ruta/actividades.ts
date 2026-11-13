import robo01 from "@/app/(panel)/robolab/clase-teorica.json";
import robo02 from "@/app/(panel)/robolab/RL-CT-02.json";
import { practicasRoboLab } from "@/app/(panel)/robolab/robolab-data";
import electro01 from "@/lib/electrolab/clases/EL-CT-01-fundamentos-led.json";
import electro02 from "@/lib/electrolab/clases/EL-CT-02-conexion-serie-led.json";
import electro03 from "@/lib/electrolab/clases/EL-CT-03-ley-ohm-resistencia-led.json";
import led from "@/lib/electrolab/examples/led-basico.json";
import data01 from "@/lib/datalab/DL-CT-01.json";
import data02 from "@/lib/datalab/DL-CT-02.json";

const CLAVE_RUTA = "protolab:ruta-aprendizaje";

const practicaRoboLab = practicasRoboLab[0];

const laboratorios = {
  robolab: {
    nombre: "RoboLab",
    clases: [robo01, robo02],
    practica: {
      id: practicaRoboLab.contenido_id,
      titulo: practicaRoboLab.metadatos.titulo_practica,
    },
  },
  electrolab: {
    nombre: "ElectroLab",
    clases: [electro01, electro02, electro03],
    practica: {
      id: led.practice.id,
      titulo: led.practice.title,
    },
  },
  datalab: {
    nombre: "DataLab",
    clases: [data01, data02],
    practica: {
      id: "datalab-retos-datasets",
      titulo: "Representación y patrones de datos",
    },
  },
};

type Area = keyof typeof laboratorios;

export type Ruta = [Area, Area];

function esArea(valor: unknown): valor is Area {
  return (
    typeof valor === "string" &&
    Object.prototype.hasOwnProperty.call(laboratorios, valor)
  );
}

export function leerRuta(): Ruta | null {
  const guardada: unknown = JSON.parse(
    localStorage.getItem(CLAVE_RUTA) ?? "null"
  );

  if (!Array.isArray(guardada)) return null;

  const [principal, complementaria] = guardada;

  if (
    !esArea(principal) ||
    !esArea(complementaria) ||
    principal === complementaria
  ) {
    return null;
  }

  return [principal, complementaria];
}

export function claveAvance(ruta: Ruta): string {
  return `protolab:avance-ruta:${ruta.join(":")}`;
}

export function leerAvance(ruta: Ruta): string[] {
  const avance: unknown = JSON.parse(
    localStorage.getItem(claveAvance(ruta)) ?? "[]"
  );

  return Array.isArray(avance)
    ? avance.filter((id): id is string => typeof id === "string")
    : [];
}

export function actividadesDeRuta(ruta: Ruta) {
  return ruta.flatMap((area) => {
    const { nombre: laboratorio, clases, practica } = laboratorios[area];

    const clasesOrdenadas = [...clases]
      .sort((a, b) => a.orden - b.orden)
      .map((clase) => ({
        area,
        laboratorio,
        id: clase.identificador,
        titulo: clase.titulo,
        tipo: "clase_teorica" as const,
        clase,
      }));

    return [
      ...clasesOrdenadas,
      {
        area,
        laboratorio,
        ...practica,
        tipo: "practica_individual" as const,
      },
    ];
  });
}