"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import municipiosJalisco from "@/data/municipios/jalisco.json";
import { actualizarPerfil } from "@/actions/perfil";

interface FormPerfilProps {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  municipio: string;
  semestre: string;
  correo?: string;
}

interface DatosPerfil {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  municipio: string;
  semestre: string;
}

const municipios = Object.entries(municipiosJalisco).sort((a, b) =>
  a[1].localeCompare(b[1], "es")
);

export function FormPerfil({
  nombre,
  apellido_paterno,
  apellido_materno,
  municipio,
  semestre,
  correo = "",
}: FormPerfilProps) {
  const router = useRouter();
  const [datos, setDatos] = useState<DatosPerfil>({
    nombre,
    apellido_paterno,
    apellido_materno,
    municipio,
    semestre,
  });
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  const municipioEstaEnLista = municipios.some(
    ([, nombreMunicipio]) => nombreMunicipio === datos.municipio
  );

  function actualizarCampo(campo: keyof DatosPerfil, valor: string) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    setMensaje("");
    setError(false);
  }

  function revisarCambios(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje("");
    setError(false);

    if (
      !datos.nombre.trim() ||
      !datos.apellido_paterno.trim() ||
      !datos.municipio ||
      !/^[1-6]$/.test(datos.semestre)
    ) {
      setMensaje(
        "Completa nombre, apellido paterno, municipio y semestre antes de continuar."
      );
      setError(true);
      return;
    }

    setConfirmando(true);
  }

  function guardarCambios() {
    iniciarTransicion(async () => {
      try {
        const resultado = await actualizarPerfil(datos);
        setMensaje(resultado.message);
        setError(!resultado.ok);

        if (resultado.ok) {
          setConfirmando(false);
          router.refresh();
        }
      } catch {
        setMensaje(
          "Ocurrió un error al actualizar tu perfil. Inténtalo nuevamente."
        );
        setError(true);
      }
    });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={revisarCambios} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Nombre(s) *
            </span>
            <input
              type="text"
              value={datos.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              maxLength={80}
              autoComplete="given-name"
              required
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Apellido paterno *
            </span>
            <input
              type="text"
              value={datos.apellido_paterno}
              onChange={(e) =>
                actualizarCampo("apellido_paterno", e.target.value)
              }
              maxLength={80}
              autoComplete="family-name"
              required
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Apellido materno
            </span>
            <input
              type="text"
              value={datos.apellido_materno}
              onChange={(e) =>
                actualizarCampo("apellido_materno", e.target.value)
              }
              maxLength={80}
              autoComplete="additional-name"
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Municipio *
            </span>
            <select
              value={datos.municipio}
              onChange={(e) => actualizarCampo("municipio", e.target.value)}
              required
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecciona tu municipio</option>
              {datos.municipio && !municipioEstaEnLista && (
                <option value={datos.municipio}>{datos.municipio}</option>
              )}
              {municipios.map(([id, nombreMunicipio]) => (
                <option key={id} value={nombreMunicipio}>
                  {nombreMunicipio}
                </option>
              ))}
            </select>
            <span className="mt-1 text-xs text-slate-500">
              Selecciona uno de los municipios de Jalisco.
            </span>
          </label>

          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Semestre *
            </span>
            <select
              value={datos.semestre}
              onChange={(e) => actualizarCampo("semestre", e.target.value)}
              required
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecciona tu semestre</option>
              {["1", "2", "3", "4", "5", "6"].map((valor) => (
                <option key={valor} value={valor}>
                  {valor}° semestre
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[13px] font-bold text-slate-600">
              Correo electrónico
            </span>
            <input
              type="email"
              value={correo}
              readOnly
              aria-readonly="true"
              className="mt-2 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
            />
            <span className="mt-1 text-xs text-slate-500">
              El correo no se puede modificar desde aquí.
            </span>
          </label>
        </div>

        {!confirmando && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
            >
              Revisar cambios
            </button>
          </div>
        )}
      </form>

      {confirmando && (
        <section
          className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"
          aria-labelledby="confirmar-perfil"
        >
          <h3 id="confirmar-perfil" className="font-semibold text-indigo-950">
            Confirma la actualización de tu perfil
          </h3>
          <p className="mt-1 text-sm text-indigo-900">
            Revisa que la información sea correcta. Los cambios se guardarán en
            tu perfil y se utilizará el nuevo municipio para consultar las
            recomendaciones universitarias.
          </p>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-indigo-800">Nombre</dt>
              <dd className="break-words text-indigo-950">
                {[datos.nombre, datos.apellido_paterno, datos.apellido_materno]
                  .filter(Boolean)
                  .join(" ")}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-indigo-800">Municipio</dt>
              <dd className="text-indigo-950">{datos.municipio}</dd>
            </div>
            <div>
              <dt className="font-semibold text-indigo-800">Semestre</dt>
              <dd className="text-indigo-950">{datos.semestre}° semestre</dd>
            </div>
            <div>
              <dt className="font-semibold text-indigo-800">Correo</dt>
              <dd className="break-words text-indigo-950">{correo}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pendiente}
              onClick={() => setConfirmando(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Seguir editando
            </button>
            <button
              type="button"
              disabled={pendiente}
              onClick={guardarCambios}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendiente ? "Guardando..." : "Confirmar y guardar"}
            </button>
          </div>
        </section>
      )}

      {mensaje && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-lg px-4 py-3 text-sm ${
            error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}





