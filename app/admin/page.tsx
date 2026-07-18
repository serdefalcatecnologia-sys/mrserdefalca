"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lngeqruorrokkuuvstut.supabase.co";
const supabaseKey = "sb_publishable_lAmxQ4ijw9Ah2E_X7Clj1w_3Yni_elN";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const router = useRouter();
  
  // Estados de la base de datos
  const [usuario, setUsuario] = useState<any>(null);
  const [tasaBcv, setTasaBcv] = useState<number>(0);
  const [flota, setFlota] = useState<any[]>([]);
  const [comercial, setComercial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Validar sesión y usuario
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }

      const { data: perfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', authData.session.user.id)
        .single();
      
      if (perfil) setUsuario(perfil);

      // 2. Traer los datos reales de las nuevas tablas
      const { data: datosFlota } = await supabase.from('flota_rutas').select('*').order('fecha', { ascending: false });
      const { data: datosComercial } = await supabase.from('comercializacion').select('*').order('fecha', { ascending: false });
      
      if (datosFlota) setFlota(datosFlota);
      if (datosComercial) setComercial(datosComercial);

      // 3. Consultar API del BCV (Usando DolarAPI, más estable)
      try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res.ok) {
          const data = await res.json();
          setTasaBcv(data.promedio || 36.50); 
        } else {
          setTasaBcv(36.50);
        }
      } catch (error) {
        console.error("API BCV bloqueada, usando tasa por defecto.", error);
        setTasaBcv(36.50);
      }

      setCargando(false);
    };

    cargarDatos();
  }, [router]);

  // Cálculos automáticos basados en la base de datos
  const toneladasTotales = flota.reduce((suma, item) => suma + Number(item.toneladas), 0);
  const totalTramites = comercial.length;

  const obtenerIniciales = (nombre = '', apellido = '') => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Función para formatear fechas
  const formatearFecha = (fechaISO: string) => {
    const f = new Date(fechaISO);
    return f.toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
  };

  if (cargando) {
    return <div className="flex h-screen items-center justify-center bg-zinc-900 text-emerald-500 font-bold text-xl">Cargando Panel y Base de Datos...</div>;
  }

  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="hidden w-64 flex-col bg-emerald-900 text-white md:flex shadow-xl z-10">
        <div className="flex h-20 items-center justify-center border-b border-emerald-800">
          <h2 className="text-xl font-bold tracking-wider">SERDEFALCA</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium transition-colors hover:bg-emerald-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Panel Principal
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Flota y Rutas
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Comercialización
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Usuarios y Personal
          </a>

          {/* BOTÓN DE CONFIGURACIÓN */}
          {usuario?.rol === 'super usuario' && (
            <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-900/50 hover:text-amber-100 mt-4 border border-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración del Sistema
            </a>
          )}
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button onClick={cerrarSesion} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/50 hover:text-red-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* Header Superior Dinámico */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm dark:bg-zinc-900 dark:border-b dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Panel de Administración</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">Rol Activo: {usuario?.rol}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-zinc-600 dark:text-zinc-300 md:block uppercase">
              {usuario?.nombre} {usuario?.apellido}
            </span>
            {usuario?.foto ? (
              <img src={usuario.foto} alt="Perfil" className="h-10 w-10 rounded-full object-cover border-2 border-emerald-600" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                {obtenerIniciales(usuario?.nombre, usuario?.apellido)}
              </div>
            )}
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div className="p-8">
          
          {/* Tarjetas de Resumen (Ahora calculadas desde la Base de Datos) */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tasa Oficial BCV</h3>
              <p className="mt-2 text-3xl font-bold text-amber-500">Bs. {tasaBcv.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Toneladas Acumuladas</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{toneladasTotales.toFixed(1)} t</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rutas Registradas</h3>
              <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">{flota.length}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Trámites Procesados</h3>
              <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">{totalTramites}</p>
            </div>
          </div>

          {/* TABLA: MÓDULO DE FLOTA Y RUTAS (DB) */}
          <div className="mb-8 rounded-xl bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Reportes: Flota y Rutas (Desde Base de Datos)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Unidad</th>
                    <th className="px-6 py-3 font-medium">Chofer</th>
                    <th className="px-6 py-3 font-medium">Ruta Ejecutada</th>
                    <th className="px-6 py-3 font-medium">Toneladas</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {flota.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(item.fecha)}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.unidad}</td>
                      <td className="px-6 py-4">{item.chofer}</td>
                      <td className="px-6 py-4">{item.ruta}</td>
                      <td className="px-6 py-4 font-semibold">{item.toneladas} t</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.estatus === 'Operativo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA: MÓDULO DE COMERCIALIZACIÓN (DB) */}
          <div className="rounded-xl bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Transacciones Comerciales (Desde Base de Datos)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Cliente (RIF)</th>
                    <th className="px-6 py-3 font-medium">Trámite</th>
                    <th className="px-6 py-3 font-medium">Monto Original (Bs)</th>
                    <th className="px-6 py-3 font-medium">Equivalente Divisas ($)</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {comercial.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.rif}</td>
                      <td className="px-6 py-4">{item.tramite}</td>
                      <td className="px-6 py-4 font-semibold">Bs. {Number(item.bs).toLocaleString('es-VE')}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        $ {(Number(item.bs) / tasaBcv).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.estatus === 'Procesado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}