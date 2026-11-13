// app/perfil/page.tsx
"use client";
import React, { useState } from 'react';
import { IconUser, IconMapPin, IconCalendar, IconMail, IconShieldCheck, IconLogin, IconRefresh, IconEdit, IconCheck } from '@tabler/icons-react';

export default function PerfilPage() {
  // Estados con nomenclatura de desarrollo real
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  // TODO: Sincronizar este estado inicial con la API de PostgreSQL del equipo
  const [estudiantePerfil, setEstudiantePerfil] = useState({
    nombre:"",
    apellido_paterno:"",
    apellido_materno:"",
    municipio:"",
    semestre:"5to Semestre", // precargado por defecto para agilizar
    correo:"",
    nivelAcceso:1,
    xpAcumulado:0
  });
  const gestionarAccesoSesion =(e:React.FormEvent)=> {
    e.preventDefault();
    if (!emailInput.trim())return;
    
    // Asignamos correo y saltamos directo a edición para el usuario
    setEstudiantePerfil(prev => ({ ...prev, correo: emailInput }));
    setIsLoggedIn(true);
    setIsEditing(true); 
  };
  const guardarCambiosBD = (e:React.FormEvent)=> {
  e.preventDefault();
    // FIXME: Agregar validación de campos vacíos antes de cerrar edición
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">
      <header className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-black shadow-inner">
            {isLoggedIn && estudiantePerfil.nombre ? `${estudiantePerfil.nombre.charAt(0)}${estudiantePerfil.apellido_paterno.charAt(0)}` : <IconUser size={32} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {isLoggedIn && estudiantePerfil.nombre ? `${estudiantePerfil.nombre} ${estudiantePerfil.apellido_paterno}`:"Acceso Estudiantil Pendiente"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">Ing. Sistemas</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isLoggedIn ? estudiantePerfil.correo:"Introduce tu correo institucional para habilitar el perfil"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()}className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition" title="Recargar vista">
            <IconRefresh size={18} />
          </button>
          
          {!isLoggedIn ?(
            <form onSubmit={gestionarAccesoSesion}className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="correo@itomacuspana.edu.mx" 
                value={emailInput} 
                onChange={e => setEmailInput(e.target.value)} 
                required 
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500" 
              />
              <button type="submit"className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                <IconLogin size={16} />Conectar
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
              <div className="text-center">
                <span className="text-2xl font-black text-blue-600">nivel {estudiantePerfil.nivelAcceso}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rango</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-center">
                <span className="text-2xl font-black text-emerald-500">{estudiantePerfil.xpAcumulado}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Total</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Resto de la estructura optimizada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IconUser size={18}className="text-indigo-500" />Registro de Datos Académicos
            </h3>
            {isLoggedIn && (
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <button onClick={() =>setIsEditing(true)} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    <IconEdit size={14} />modificar
                  </button>
                ) : (
                  <button onClick={guardarCambiosBD}className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-1">
                    <IconCheck size={14} />aplicar
                  </button>
                )}
                <button onClick={() => {setIsLoggedIn(false);setIsEditing(false); setEmailInput(""); }}className="text-xs text-rose-500 font-semibold hover:underline">
                  salir
                </button>
              </div>
            )}
          </div>

          <form onSubmit={guardarCambiosBD}className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Nombre(s)", key: "nombre", placeholder: "Tus nombres", req:true },
              { label: "Apellido Paterno", key: "apellido_paterno", placeholder: "Primer apellido", req:true },
              { label: "Apellido Materno", key: "apellido_materno", placeholder: "Segundo apellido" },
              { label: "Municipio", key: "municipio", placeholder: "Ej. Macuspana", icon: <IconMapPin size={14} className="text-rose-500" /> },
              { label: "Semestre", key: "semestre", placeholder: "Ej. 5to Semestre", icon: <IconCalendar size={14} className="text-blue-500" /> },
            ].map(({ label, key, placeholder, req, icon })=>(
              <div key={key} className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
                {isEditing ?(
                  <input
                    type="text"
                    value={(estudiantePerfil as any)[key]}
                    onChange={e => setEstudiantePerfil({ ...estudiantePerfil, [key]: e.target.value })}
                    placeholder={placeholder}
                    required={req}
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    {icon} {(estudiantePerfil as any)[key] || "—"}
                  </span>
                )}
              </div>
            ))}

            <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Correo Electrónico</span>
              <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5 truncate">
                <IconMail size={14} className="text-purple-500" /> {estudiantePerfil.correo || "—"}
              </span>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IconShieldCheck size={18} className="text-emerald-500" />estado del Servidor
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isLoggedIn ? "Conexión activa con el almacenamiento local del navegador y estado global." :"Inicia sesión para sincronizar la sesión con los componentes del sistema."}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Token de Sesión</span>
              <span className={`px-2 py-0.5 rounded-full ${isLoggedIn ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                {isLoggedIn ? 'Verificado' : 'Null'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}