// app/perfil/page.tsx
"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/datalab/sidebar';
import { IconUser, IconMapPin, IconCalendar, IconMail, IconShieldCheck, IconLogin, IconRefresh, IconEdit, IconCheck } from '@tabler/icons-react';

export default function PerfilPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  // Estado de los campos del perfil (vacíos por defecto)
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    municipio: "",
    semestre: "",
    correo: "",
    nivel: 1,
    puntosXP: 0
  });

  // Manejar el inicio de sesión inicial solo pidiendo el correo
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    setPerfil(prev => ({ ...prev, correo: emailInput }));
    setIsLoggedIn(true);
    setIsEditing(true); // Activa el modo de edición automático para que el usuario llene sus datos
  };

  // Guardar datos ingresados manualmente
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };
  
  return (
    <div className="mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7">
        
        {/* ENCABEZADO DE PERFIL */}
        <header className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-black shadow-inner">
              {isLoggedIn && perfil.nombre ? `${perfil.nombre.charAt(0)}${perfil.apellido_paterno.charAt(0)}` : <IconUser size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {isLoggedIn && perfil.nombre ? `${perfil.nombre} ${perfil.apellido_paterno}` : "Usuario No Registrado"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wider">
                  Estudiante
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {isLoggedIn ? perfil.correo : "Inicia sesión con tu correo para registrar tus datos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón para actualizar la página */}
            <button 
              onClick={() => window.location.reload()}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
              title="Actualizar página"
            >
              <IconRefresh size={18} />
            </button>

            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="flex items-center gap-2">
                <input 
                  type="email" 
                  placeholder="Ingresa tu correo..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                  <IconLogin size={16} /> Entrar
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                <div className="text-center">
                  <span className="text-2xl font-black text-blue-600">Nivel {perfil.nivel}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Progreso</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-center">
                  <span className="text-2xl font-black text-emerald-500">{perfil.puntosXP}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Puntos XP</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* DETALLES DE LA TABLA (LLENADO MANUAL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IconUser size={18} className="text-indigo-500" /> Información Registrada en Base de Datos
              </h3>
              {isLoggedIn && (
                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <IconEdit size={14} /> Editar datos
                    </button>
                  ) : (
                    <button 
                      onClick={handleSave}
                      className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <IconCheck size={14} /> Guardar
                    </button>
                  )}
                  <button 
                    onClick={() => { setIsLoggedIn(false); setIsEditing(false); setEmailInput(""); }}
                    className="text-xs text-rose-500 font-semibold hover:underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            {/* FORMULARIO DE CAPTURA MANUAL */}
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Nombre(s)</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={perfil.nombre}
                    onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                    placeholder="Escribe tu nombre"
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    required
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1">{perfil.nombre || "—"}</span>
                )}
              </div>

              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Apellido Paterno</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={perfil.apellido_paterno}
                    onChange={(e) => setPerfil({...perfil, apellido_paterno: e.target.value})}
                    placeholder="Apellido paterno"
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                    required
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1">{perfil.apellido_paterno || "—"}</span>
                )}
              </div>

              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Apellido Materno</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={perfil.apellido_materno}
                    onChange={(e) => setPerfil({...perfil, apellido_materno: e.target.value})}
                    placeholder="Apellido materno"
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1">{perfil.apellido_materno || "—"}</span>
                )}
              </div>

              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Municipio (Ubicación)</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={perfil.municipio}
                    onChange={(e) => setPerfil({...perfil, municipio: e.target.value})}
                    placeholder="Ej. Macuspana, Tabasco"
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <IconMapPin size={14} className="text-rose-500" /> {perfil.municipio || "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Semestre Actual</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={perfil.semestre}
                    onChange={(e) => setPerfil({...perfil, semestre: e.target.value})}
                    placeholder="Ej. 5to Semestre"
                    className="mt-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-blue-500" /> {perfil.semestre || "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Correo</span>
                <span className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5 truncate">
                  <IconMail size={14} className="text-purple-500" /> {perfil.correo || "—"}
                </span>
              </div>
            </form>
          </div>

          {/* ESTADO DE CUENTA */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IconShieldCheck size={18} className="text-emerald-500" /> Estado de Cuenta
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isLoggedIn 
                  ? "Sesión iniciada. Ingresa o actualiza tus datos manualmente para sincronizarlos con la tabla 'perfiles'."
                  : "Ingresa tu correo electrónico para comenzar a registrar tus datos en el sistema."}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Estado de Sesión</span>
                <span className={`px-2 py-0.5 rounded-full ${isLoggedIn ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  {isLoggedIn ? 'Activo' : 'Sin Iniciar Sesión'}
                </span>
              </div>
            </div>
          </div>

        </div>
    </div>
  );
}