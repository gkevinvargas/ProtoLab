import { IconUser } from "@tabler/icons-react";

import { usuarioAutenticado } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function textoPerfil(valor: unknown): string {
  if (typeof valor === "string") return valor.trim();
  return typeof valor === "number" ? String(valor) : "";
}

export default async function PerfilPage() {
  const usuario = await usuarioAutenticado();
  const datosRegistro = usuario.user_metadata.perfil_registro;
  const datosGuardados =
    typeof datosRegistro === "object" && datosRegistro !== null && !Array.isArray(datosRegistro)
      ? (datosRegistro as Record<string, unknown>)
      : null;

  let perfil = datosGuardados;
  if (!perfil) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("perfiles")
      .select("nombre, apellido_paterno, apellido_materno, municipio, semestre")
      .eq("id", usuario.id)
      .maybeSingle();

    if (error) throw new Error("No se pudo cargar el perfil.");
    perfil = data;
  }

  const nombre = textoPerfil(perfil?.nombre);
  const paterno = textoPerfil(perfil?.apellido_paterno);
  const materno = textoPerfil(perfil?.apellido_materno);
  const municipio = textoPerfil(perfil?.municipio);
  const semestre = textoPerfil(perfil?.semestre);
  const correo = usuario.email ?? "";
  const nombreCompleto = [nombre, paterno, materno].filter(Boolean).join(" ");
  const iniciales = [nombre, paterno]
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
  const semestreVisible = /^[1-6]$/.test(semestre)
    ? `${semestre}° semestre`
    : semestre === "Selecciona una opción" ? "" : semestre;

  const campos = [
    { etiqueta: "Nombre(s)", valor: nombre },
    { etiqueta: "Apellido paterno", valor: paterno },
    { etiqueta: "Apellido materno", valor: materno },
    { etiqueta: "Municipio", valor: municipio },
    { etiqueta: "Semestre", valor: semestreVisible },
    { etiqueta: "Correo electrónico", valor: correo },
  ];

  return (
    <div className="mx-auto max-w-[1700px] space-y-6 p-2 sm:p-6 lg:p-7">
      <header className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700" aria-hidden="true">
          {iniciales || <IconUser size={30} />}
        </div>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {nombreCompleto || "Mi perfil"}
          </h1>
          <p className="break-words text-sm text-slate-600">{correo}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="datos-perfil">
        <h2 id="datos-perfil" className="mb-4 font-semibold text-slate-900">
          Datos del perfil
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {campos.map(({ etiqueta, valor }) => (
            <div key={etiqueta} className="min-w-0 rounded-xl bg-slate-50 p-4">
              <dt className="text-sm font-semibold text-slate-600">{etiqueta}</dt>
              <dd className="mt-1 break-words text-slate-900">{valor || "Sin registrar"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
