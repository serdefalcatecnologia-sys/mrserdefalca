"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = "https://lngeqruorrokkuuvstut.supabase.co";
const supabaseKey = "sb_publishable_lAmxQ4ijw9Ah2E_X7Clj1w_3Yni_elN";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegistroEmpleados() {
  const router = useRouter();
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    password: '',
    rol: 'comercial', // Valor por defecto
    // Campos condicionales para flota
    unidad_vehiculo: '',
    placa_vehiculo: '',
  });

  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

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
      
      if (perfil) setUsuarioActivo(perfil);
      setCargando(false);
    };
    validarSesion();
  }, [router]);

  // Manejar la carga de imagen en el formulario
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoFoto(file);
      setVistaPrevia(URL.createObjectURL(file));
    }
  };

  // Función para guardar en Base de Datos
  const registrarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      /* 
        NOTA PARA EL BACKEND:
        Aquí idealmente se usaría supabase.auth.admin.createUser para crear el acceso,
        pero por ahora guardaremos el registro directamente en la tabla de personal/usuarios
        para que tengas la estructura completa funcionando.
      */

      let fotoUrl = null;

      // 1. Si hay foto, subirla al Storage de Supabase (Asumiendo que tienes un bucket llamado 'perfiles')
      if (archivoFoto) {
        const fileExt = archivoFoto.name.split('.').pop();
        const fileName = `${formulario.cedula}-${Math.random()}.${fileExt}`;
        const filePath = `${formulario.rol}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('perfiles') // Cambia esto por el nombre de tu bucket
          .upload(filePath, archivoFoto);

        if (!uploadError && data) {
          const { data: publicUrlData } = supabase.storage.from('perfiles').getPublicUrl(filePath);
          fotoUrl = publicUrlData.publicUrl;
        }
      }

      // 2. Insertar en la tabla (Ajusta los nombres de columnas a tu base de datos)
      const { error: dbError } = await supabase.from('usuarios').insert([
        {
          cedula: formulario.cedula,
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          telefono: formulario.telefono,
          correo: formulario.correo,
          rol: formulario.rol,
          foto: fotoUrl,
          unidad_vehiculo: formulario.rol === 'flota' ? formulario.unidad_vehiculo : null,
          placa_vehiculo: formulario.rol === 'flota' ? formulario.placa_vehiculo : null,
          // La contraseña real se manejará por Supabase Auth después
        }
      ]);

      if (dbError) throw dbError;

      alert("¡Personal registrado con éxito!");
      
      // Limpiar formulario
      setFormulario({
        cedula: '', nombre: '', apellido: '', telefono: '', correo: '', password: '', rol: 'comercial', unidad_vehiculo: '', placa_vehiculo: ''
      });
      setArchivoFoto(null);
      setVistaPrevia(null);

    } catch (error: any) {
      console.error(error);
      alert("Error al registrar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (cargando) return <div className="flex h-screen items-center justify-center bg-zinc-900 text-emerald-500 font-bold text-xl">Cargando Módulo...</div>;

  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950">
      
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

          {/* BOTÓN ACTIVO */}
          <Link href="/admin/empleados/registro" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium transition-colors hover:bg-emerald-700">
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
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Alta de Personal</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Complete los datos para habilitar el acceso al sistema</p>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto flex justify-center">
          
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden h-fit">
            <div className="bg-emerald-600 px-8 py-4 border-b border-emerald-700">
              <h2 className="text-lg font-bold text-white">Ficha de Nuevo Registro</h2>
            </div>

            <form onSubmit={registrarEmpleado} className="p-8">
              
              {/* SECCIÓN 1: ROL DEL SISTEMA */}
              <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <label className="block text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 uppercase tracking-wider">1. Asignación de Rol</label>
                <select 
                  className="w-full md:w-1/2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={formulario.rol} 
                  onChange={(e) => setFormulario({...formulario, rol: e.target.value})}
                >
                  <option value="comercial">Comercialización (Taquilla)</option>
                  <option value="flota">Flota de Rutas (Chofer/Operador)</option>
                  <option value="super usuario">Administrador (Super Usuario)</option>
                </select>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {formulario.rol === 'flota' ? 'Al seleccionar Flota, se requerirán los datos del vehículo asignado.' : 'El usuario tendrá acceso a su módulo correspondiente basado en esta selección.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA: FOTO */}
                <div className="col-span-1 flex flex-col items-center">
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 text-center">
                    {formulario.rol === 'flota' ? 'Foto del Vehículo / Placa' : 'Fotografía de Perfil'}
                  </label>
                  
                  <div className="w-48 h-48 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative group cursor-pointer">
                    {vistaPrevia ? (
                      <img src={vistaPrevia} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="mt-2 block text-xs text-zinc-500">Clic para subir imagen</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={manejarArchivo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>

                {/* COLUMNA DERECHA: DATOS */}
                <div className="col-span-1 md:col-span-2 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cédula de Identidad</label>
                      <input required type="text" placeholder="Ej: V-12345678" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.cedula} onChange={(e) => setFormulario({...formulario, cedula: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Teléfono</label>
                      <input required type="text" placeholder="Ej: 0414-1234567" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.telefono} onChange={(e) => setFormulario({...formulario, telefono: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombres</label>
                      <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.nombre} onChange={(e) => setFormulario({...formulario, nombre: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Apellidos</label>
                      <input required type="text" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.apellido} onChange={(e) => setFormulario({...formulario, apellido: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Correo Electrónico (Para Login)</label>
                      <input required type="email" placeholder="correo@empresa.com" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.correo} onChange={(e) => setFormulario({...formulario, correo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contraseña Provisional</label>
                      <input required type="password" placeholder="******" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                        value={formulario.password} onChange={(e) => setFormulario({...formulario, password: e.target.value})} />
                    </div>
                  </div>

                  {/* CAMPOS CONDICIONALES PARA FLOTA */}
                  {formulario.rol === 'flota' && (
                    <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl grid grid-cols-2 gap-5">
                      <div className="col-span-2"><h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 uppercase">Datos de la Unidad (Flota)</h3></div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tipo/Modelo de Vehículo</label>
                        <input required type="text" placeholder="Ej: Camión Cava NPR" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2" 
                          value={formulario.unidad_vehiculo} onChange={(e) => setFormulario({...formulario, unidad_vehiculo: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Placa del Vehículo</label>
                        <input required type="text" placeholder="Ej: A12BCD" className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 uppercase" 
                          value={formulario.placa_vehiculo} onChange={(e) => setFormulario({...formulario, placa_vehiculo: e.target.value.toUpperCase()})} />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
                <Link href="/admin" className="px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                  Cancelar
                </Link>
                <button type="submit" disabled={guardando} className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
                  {guardando ? (
                    'Procesando...'
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Registrar en Sistema
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}