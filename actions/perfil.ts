"use server";

import { revalidatePath } from "next/cache";

import municipiosJalisco from "@/data/municipios/jalisco.json";
import { usuarioAutenticado } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface DatosActualizacionPerfil {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  municipio: string;
  semestre: string;
}

function limpiarTexto(valor: unknown, maximo = 80): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

export async function actualizarPerfil(
  datos: DatosActualizacionPerfil
): Promise<{ ok: boolean; message: string }> {
  const usuario = await usuarioAutenticado();

  try {
    const nombre = limpiarTexto(datos?.nombre);
    const apellido_paterno = limpiarTexto(datos?.apellido_paterno);
    const apellido_materno = limpiarTexto(datos?.apellido_materno);
    const municipio = limpiarTexto(datos?.municipio, 100);
    const semestre = limpiarTexto(datos?.semestre, 1);

    if (!nombre || !apellido_paterno || !municipio || !semestre) {
      return {
        ok: false,
        message:
          "Completa nombre, apellido paterno, municipio y semestre.",
      };
    }

    const municipiosPermitidos = Object.values(municipiosJalisco) as string[];
    if (!municipiosPermitidos.includes(municipio)) {
      return {
        ok: false,
        message: "Selecciona un municipio válido de Jalisco.",
      };
    }

    if (!/^[1-6]$/.test(semestre)) {
      return {
        ok: false,
        message: "Selecciona un semestre válido del 1 al 6.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("perfiles").upsert(
      {
        id: usuario.id,
        nombre,
        apellido_paterno,
        apellido_materno,
        municipio,
        semestre,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("No se pudo actualizar el perfil:", error);
      return {
        ok: false,
        message:
          "No fue posible guardar los cambios. Verifica los permisos de la tabla de perfiles e inténtalo nuevamente.",
      };
    }

    revalidatePath("/perfil");
    revalidatePath("/ruta");

    return {
      ok: true,
      message: "Tu información se actualizó correctamente.",
    };
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return {
      ok: false,
      message:
        "Ocurrió un error al actualizar tu perfil. Inténtalo nuevamente.",
    };
  }
}




