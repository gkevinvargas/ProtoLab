"use client";

import type { ActividadInteractiva } from "../../lib/content/types";
import { ACTIVITY_REGISTRY } from "../../lib/content/activity-registry";
import { AnimacionSecuencial } from "./activities/AnimacionSecuencial";
import { OrdenarBloques } from "./activities/OrdenarBloques";
import { CompletarEnunciados } from "./activities/CompletarEnunciados";
import { CalculoGuiado } from "./activities/CalculoGuiado";
import { SopaLetras } from "./activities/SopaLetras";

interface Props { actividad: ActividadInteractiva }

export function ActivityRenderer({ actividad }: Props) {
  // El registro permite comprobar qué tipos están implementados; el switch conserva
  // el estrechamiento de tipos de TypeScript para pasar la configuración correcta.
  if (!ACTIVITY_REGISTRY[actividad.tipo]) {
    return <div className="pl-feedback is-incorrect">Esta actividad todavía no está disponible.</div>;
  }

  switch (actividad.tipo) {
    case "animacion_secuencial": return <AnimacionSecuencial actividad={actividad} />;
    case "ordenar_bloques": return <OrdenarBloques actividad={actividad} />;
    case "completar_enunciados": return <CompletarEnunciados actividad={actividad} />;
    case "calculo_guiado": return <CalculoGuiado actividad={actividad} />;
    case "sopa_letras": return <SopaLetras actividad={actividad} />;
    default: return <div className="pl-feedback is-incorrect">Tipo de actividad no reconocido.</div>;
  }
}
