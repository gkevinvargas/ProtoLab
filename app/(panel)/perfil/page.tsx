import { IconUser } from "@tabler/icons-react";

import { FormPerfil } from "@/components/perfil/form-perfil";
import { usuarioAutenticado } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function textoPerfil(valor: unknown): string {
  if (typeof valor === "string") return valor.trim();
  return typeof valor === "number" ? String(valor) : "";
}

function esObjeto(
  valor: unknown
): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export default async function PerfilPage() {
  const usuario = await usuarioAutenticado();
  const supabase = await createClient();

  // La tabla perfiles es la fuente principal de información.
  const { data: perfilTabla, error } = await supabase
    .from("perfiles")
    .select("nombre, apellido_paterno, apellido_materno, semestre")
    .eq("id", usuario.id)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el perfil.");
  }

  // Compatibilidad con cuentas antiguas cuyos datos siguen en metadata.
  const metadata = esObjeto(usuario.user_metadata)
    ? usuario.user_metadata
    : {};
  const registro = esObjeto(metadata.perfil_registro)
    ? metadata.perfil_registro
    : {};

  const nombre =
    textoPerfil(perfilTabla?.nombre) || textoPerfil(registro.nombre);
  const apellidoPaterno =
    textoPerfil(perfilTabla?.apellido_paterno) ||
    textoPerfil(registro.apellido_paterno);
  const apellidoMaterno =
    textoPerfil(perfilTabla?.apellido_materno) ||
    textoPerfil(registro.apellido_materno);
  const semestreGuardado =
    textoPerfil(perfilTabla?.semestre) || textoPerfil(registro.semestre);
  const semestre = /^[1-6]$/.test(semestreGuardado)
    ? semestreGuardado
    : "";
  const correo = usuario.email ?? "";

  const nombreCompleto = [nombre, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  const iniciales = [nombre, apellidoPaterno]
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[1700px] space-y-6 p-2 sm:p-6 lg:p-7">
      <header className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700"
          aria-hidden="true"
        >
          {iniciales || <IconUser size={30} />}
        </div>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {nombreCompleto || "Mi perfil"}
          </h1>
          <p className="break-words text-sm text-slate-600">{correo}</p>
        </div>
      </header>

      <section
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        aria-labelledby="datos-perfil"
      >
        <div className="mb-5">
          <h2 id="datos-perfil" className="font-semibold text-slate-900">
            Datos del perfil
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Puedes actualizar tus datos personales. Tu correo electrónico y
            contraseña no se modifican desde esta sección.
          </p>
        </div>

        <FormPerfil
          nombre={nombre}
          apellido_paterno={apellidoPaterno}
          apellido_materno={apellidoMaterno}
          semestre={semestre}
          correo={correo}
        />
      </section>
    </div>
  );
}
