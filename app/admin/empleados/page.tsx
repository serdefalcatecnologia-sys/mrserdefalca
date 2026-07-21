"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = "https://lngeqruorrokkuuvstut.supabase.co";
const supabaseKey = "sb_publishable_lAmxQ4ijw9Ah2E_X7Clj1w_3Yni_elN";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ListaEmpleados() {
  const router = useRouter();
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del Modal de Edición/Detalle
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<any>(null);

  // Cargar lista de empleados
  const cargarEmpleados = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (data) setEmpleados(data);
    if (error) console.error("Error cargando empleados:", error);
  };

  useEffect(() => {
    const inicializar = async () => {
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
      
      if (perfil) setUsuarioActivo(perfil);
      
      await cargarEmpleados();
      setCargando(false);
    };

    inicializar();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const obtenerIniciales = (nombre = '', apellido = '') => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  // Abrir modal con los datos del empleado seleccionado
  const abrirDetalles = (empleado: any) => {
    setEmpleadoEdit({ ...empleado }); // Hacemos una copia para no alterar el original sin guardar
    setModalAbierto(true);
  };

  // Guardar cambios editados en Supabase
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          cedula: empleadoEdit.cedula,
          nombre: empleadoEdit.nombre,
          apellido: empleadoEdit.apellido,
          telefono: empleadoEdit.telefono,
          correo: empleadoEdit.correo,
          rol: empleadoEdit.rol,
          unidad_vehiculo: empleadoEdit.rol === 'flota' ? empleadoEdit.unidad_vehiculo : null,
          placa_vehiculo: empleadoEdit.rol === 'flota' ? empleadoEdit.placa_vehiculo : null,
        })
        .eq('id_usuario', empleadoEdit.id_usuario);

      if (error) throw error;

      alert("¡Datos actualizados con éxito!");
      setModalAbierto(false);
      await cargarEmpleados(); // Recargar la tabla
    } catch (error: any) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="flex h-screen items-center justify-center bg-zinc-900 text-emerald-500 font-bold text-xl">Cargando Directorio...</div>;

  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950 relative">
      
      {/* MODAL DE DETALLES Y EDICIÓN */}
      {modalAbierto && empleadoEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-white font-bold text-lg">Detalle y Edición de Personal</h3>
              <button onClick={() => setModalAbierto(false)} className="text-emerald-100 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <div className="flex items-center gap-6 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                {empleadoEdit.foto ? (
                  <img src={empleadoEdit.foto} alt="Perfil" className="h-20 w-20 rounded-full object-cover border-4 border-emerald-50 shadow-sm" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                    {obtenerIniciales(empleadoEdit.nombre, empleadoEdit.apellido)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{empleadoEdit.nombre} {empleadoEdit.apellido}</h2>
                  <p className="text-sm text-emerald-600 font-medium capitalize">Rol: {empleadoEdit.rol}</p>
                </div>
              </div>

              <form id="form-editar" onSubmit={guardarCambios} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Cédula</label>
                    <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                      value={empleadoEdit.cedula} onChange={(e) => setEmpleadoEdit({...empleadoEdit, cedula: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Teléfono</label>
                    <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                      value={empleadoEdit.telefono} onChange={(e) => setEmpleadoEdit({...empleadoEdit, telefono: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nombre</label>
                    <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                      value={empleadoEdit.nombre} onChange={(e) => setEmpleadoEdit({...empleadoEdit, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Apellido</label>
                    <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                      value={empleadoEdit.apellido} onChange={(e) => setEmpleadoEdit({...empleadoEdit, apellido: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Correo Electrónico</label>
                    <input required type="email" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                      value={empleadoEdit.correo} onChange={(e) => setEmpleadoEdit({...empleadoEdit, correo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Asignar Rol</label>
                    <select className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                      value={empleadoEdit.rol} onChange={(e) => setEmpleadoEdit({...empleadoEdit, rol: e.target.value})}>
                      <option value="comercial">Comercial</option>
                      <option value="flota">Flota</option>
                      <option value="super usuario">Super Usuario</option>
                    </select>
                  </div>
                </div>

                {empleadoEdit.rol === 'flota' && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg grid grid-cols-2 gap-4">
                    <div className="col-span-2"><h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase">Datos del Vehículo Asignado</h4></div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Modelo / Unidad</label>
                      <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                        value={empleadoEdit.unidad_vehiculo || ''} onChange={(e) => setEmpleadoEdit({...empleadoEdit, unidad_vehiculo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Placa</label>
                      <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-white uppercase focus:ring-1 focus:ring-emerald-500 outline-none" 
                        value={empleadoEdit.placa_vehiculo || ''} onChange={(e) => setEmpleadoEdit({...empleadoEdit, placa_vehiculo: e.target.value.toUpperCase()})} />
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
              <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2 text-sm font-medium text-zinc-600 bg-zinc-200 rounded-lg hover:bg-zinc-300 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="form-editar" disabled={guardando} className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="hidden w-64 flex-col bg-emerald-900 text-white md:flex shadow-xl z-10 flex-shrink-0">
        <div className="flex h-20 items-center justify-center border-b border-emerald-800">
          <h2 className="text-xl font-bold tracking-wider">SERDEFALCA</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Panel Principal
          </Link>

          <Link href="/admin/empleados/registro" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Registro de Empleados
          </Link>

          {/* BOTÓN ACTIVO */}
          <Link href="/admin/empleados" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium transition-colors hover:bg-emerald-700">
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
          
          <Link href="/admin/configuracion" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white mt-4 border border-emerald-700/50">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuración de Sistema
          </Link>
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button onClick={cerrarSesion} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/50 hover:text-red-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950/50">
        
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Directorio de Empleados</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Administración y control del personal de SERDEFALCA</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/empleados/registro" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuevo Empleado
            </Link>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            
            <div className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Lista General de Usuarios</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">{empleados.length} Registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                <thead className="bg-white dark:bg-zinc-900 text-xs uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Empleado</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Cédula</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Contacto</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Rol de Sistema</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No hay empleados registrados en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    empleados.map((empleado) => (
                      <tr key={empleado.id_usuario} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {empleado.foto ? (
                              <img src={empleado.foto} alt="Perfil" className="h-10 w-10 rounded-full object-cover border border-zinc-200" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                {obtenerIniciales(empleado.nombre, empleado.apellido)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{empleado.nombre} {empleado.apellido}</p>
                              {empleado.rol === 'flota' && <p className="text-xs text-amber-600 font-medium">Placa: {empleado.placa_vehiculo}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{empleado.cedula}</td>
                        <td className="px-6 py-4">
                          <p>{empleado.telefono}</p>
                          <p className="text-xs text-zinc-400">{empleado.correo}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize
                            ${empleado.rol === 'super usuario' ? 'bg-purple-100 text-purple-700' : 
                              empleado.rol === 'flota' ? 'bg-amber-100 text-amber-700' : 
                              'bg-emerald-100 text-emerald-700'}`}>
                            {empleado.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => abrirDetalles(empleado)} 
                            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors" 
                            title="Ver y Editar Detalles"
                          >
                            {/* ÍCONO DE OJITO / EDITAR */}
                            <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}