"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const validarSesion = async () => {
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
      setCargando(false);
    };

    validarSesion();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const obtenerIniciales = (nombre = '', apellido = '') => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  // Variable rápida para saber si es el Super Usuario
  const esSuperUsuario = usuario?.rol?.toLowerCase().trim() === 'super usuario';

  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950">
      
      {/* BARRA LATERAL */}
      <aside className="hidden w-64 flex-col bg-emerald-900 text-white md:flex shadow-xl z-10">
        <div className="flex h-20 items-center justify-center border-b border-emerald-800">
          <h2 className="text-xl font-bold tracking-wider">SERDEFALCA</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          
          <Link href="/admin" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium transition-colors hover:bg-emerald-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Panel Principal
          </Link>

          <Link href="/admin/empleados/registro" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Registro de Empleados
          </Link>

          <Link href="/admin/empleados" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Visualización de Empleados
          </Link>

          <Link href="/admin/comercial" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Vista de Comercialización
          </Link>

          <Link href="/admin/flota" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Vista Flota de Rutas
          </Link>

          {/* Ocultamiento Condicional: Solo lo ve el Super Usuario */}
          {esSuperUsuario && (
            <Link href="/admin/configuracion" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-800 hover:text-white mt-4 border border-amber-700/50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Configuración de Sistema
            </Link>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Centro de Monitoreo</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
              Administración Central {usuario ? `- Rol: ${usuario.rol}` : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {!cargando && (
              <span className="hidden text-sm font-medium text-zinc-600 dark:text-zinc-300 md:block uppercase animate-in fade-in">
                {usuario?.nombre} {usuario?.apellido}
              </span>
            )}
            
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-colors overflow-hidden ${cargando ? 'bg-zinc-300 dark:bg-zinc-800 animate-pulse' : 'bg-emerald-600'}`}>
              {cargando ? '' : (
                usuario?.foto ? (
                  <img src={usuario.foto} alt="Perfil" className="h-full w-full object-cover" />
                ) : (
                  obtenerIniciales(usuario?.nombre, usuario?.apellido)
                )
              )}
            </div>
            
          </div>
        </header>

        {/* Contenido Central */}
        <div className="flex-1 p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 flex flex-col items-center justify-center">
          
          {cargando ? (
             <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-emerald-600 font-bold">Autenticando credenciales...</p>
             </div>
          ) : (
            <div className="w-full max-w-5xl animate-in slide-in-from-bottom-4 duration-500 fade-in">
              <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-8 text-center">Seleccione el módulo de administración</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Botón 1 */}
                <Link href="/admin/empleados/registro" className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  </div>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">1. Registro de Empleados</span>
                  <p className="text-sm text-zinc-500 text-center">Dar de alta nuevo personal y asignar roles al sistema.</p>
                </Link>

                {/* Botón 2 */}
                <Link href="/admin/empleados" className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">2. Visualización de Empleados</span>
                  <p className="text-sm text-zinc-500 text-center">Directorio general y control de la plantilla de trabajo.</p>
                </Link>

                {/* Botón 3 */}
                <Link href="/admin/comercial" className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">3. Vista de Comercialización</span>
                  <p className="text-sm text-zinc-500 text-center">Monitoreo de ingresos, taquilla y todos los registros financieros.</p>
                </Link>

                {/* Botón 4 */}
                <Link href="/admin/flota" className="group flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </div>
                  <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">4. Vista Flota de Rutas</span>
                  <p className="text-sm text-zinc-500 text-center">Supervisión de camiones, tonelajes y estatus logístico.</p>
                </Link>

                {/* Botón 5: Ocultamiento Condicional (Solo lo ve el Super Usuario) */}
                {esSuperUsuario && (
                  <div className="md:col-span-2 flex justify-center mt-4">
                    <Link href="/admin/configuracion" className="group w-full md:w-1/2 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer">
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full group-hover:scale-110 transition-transform">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">5. Configuración de Sistema</span>
                      <p className="text-sm text-zinc-500 text-center">Ajustes avanzados y reglas de negocio.</p>
                    </Link>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}