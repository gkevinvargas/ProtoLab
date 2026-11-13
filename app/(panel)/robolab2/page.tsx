"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ClaseTeorica from "@/components/laboratorios/ClaseTeorica";
import RoboLabScreen from "@/components/robolab/RoboLabScreen";
import ElectroLabScreen from "@/components/electrolab/electrolab-screen";
import { DataLabOverview } from "@/components/datalab/datalab-overview";
import {
  actividadesDeRuta,
  claveAvance,
  leerAvance,
  leerRuta,
  type Ruta,
} from "@/lib/ruta/actividades";
import RoboLabScreen2 from "@/components/robolab/robolab-screen";
import Plantilla from "@/components/robolab/plantilla";

function leerMejorNota(ruta: Ruta, id: string): number | null {
  const guardada = localStorage.getItem(`${claveAvance(ruta)}:mejor:${id}`);

  if (guardada === null || guardada.trim() === "") return null;

  const puntaje = Number(guardada);
  return Number.isFinite(puntaje) && puntaje >= 0 && puntaje <= 100
    ? puntaje
    : null;
}

export default function RoboLabPage() {
    return (
        <RoboLabScreen2 />
    )
}


