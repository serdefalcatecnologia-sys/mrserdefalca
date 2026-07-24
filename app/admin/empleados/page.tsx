"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VisualizacionEmpleados() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Guarda el rol de quien está usando la PC actualmente
  const [rolActual, setRolActual] = useState('');

  // Estados para el Modal de Edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Datos del empleado seleccionado
  const [idUsuario, setIdUsuario] = useState('');
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('');
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  // NUEVOS ESTADOS: Contraseñas y visibilidad con ojitos
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      setCargando(true);
      const { data: authData } = await supabase.auth.getSession();
      
      let miRol = '';
      if (authData.session) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id_usuario', authData.session.user.id)
          .single();
          
        miRol = perfil?.rol?.toLowerCase().trim() || '';
        setRolActual(miRol);
      }
      
      await fetchEmpleados(miRol);
    };

    inicializar();
  }, []);

  const fetchEmpleados = async (miRol: string) => {
    setCargando(true);
    const { data, error } = await supabase.from('usuarios').select('*').order('nombre', { ascending: true });
    
    if (error) {
      console.error("Error cargando empleados:", error);
    } else {
      let lista = data || [];
      
      // Si NO eres super usuario, ocultamos al super usuario de tu vista
      if (miRol !== 'super usuario') {
        lista = lista.filter(emp => emp.rol?.toLowerCase().trim() !== 'super usuario');
      }
      
      setEmpleados(lista);
    }
    setCargando(false);
  };

  const obtenerIniciales = (n = '', a = '') => `${n.charAt(0) || ''}${a.charAt(0) || ''}`.toUpperCase();

  const abrirModal = (emp: any) => {
    setIdUsuario(emp.id_usuario);
    setCedula(emp.cedula || '');
    setNombre(emp.nombre || '');
    setApellido(emp.apellido || '');
    setTelefono(emp.telefono || '');
    setCorreo(emp.correo || ''); 
    setRol(emp.rol || 'comercial');
    setFotoBase64(emp.foto || null);
    
    // Limpiamos los campos de contraseña al abrir
    setPassword('');
    setConfirmPassword('');
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setFotoBase64(null);
  };

  const manejarSubidaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setFotoBase64(lector.result as string);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const actualizarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas si el usuario escribió algo
    if (password !== '') {
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
    }

    setGuardando(true);

    try {
      // 1. Actualizar datos en la tabla 'usuarios'
      const datosActualizar: any = {
        cedula: cedula,
        nombre: nombre,
        apellido: apellido,
        telefono: telefono,
        correo: correo,
        rol: rol,
        foto: fotoBase64
      };

      const { error: errorDb } = await supabase
        .from('usuarios')
        .update(datosActualizar)
        .eq('id_usuario', idUsuario);

      if (errorDb) throw errorDb;

      // 2. Si se ingresó una nueva contraseña, actualizarla también en Supabase Auth
      if (password !== '') {
        const { error: errorAuth } = await supabase.auth.admin.updateUserById(
          idUsuario,
          { password: password }
        );
        if (errorAuth) {
          console.warn("Aviso al actualizar contraseña en Auth (requiere permisos de admin en Supabase):", errorAuth.message);
        }
      }

      alert("¡Datos del empleado actualizados correctamente!");
      cerrarModal();
      fetchEmpleados(rolActual);

    } catch (error: any) {
      console.error(error);
      alert("Error al actualizar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEmpleado = async () => {
    const confirmacion = window.confirm(`¿Estás completamente seguro de que deseas ELIMINAR a ${nombre} ${apellido}? Esta acción no se puede deshacer.`);
    if (!confirmacion) return;

    setGuardando(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', idUsuario);

      if (error) throw error;

      alert("Empleado eliminado del sistema.");
      cerrarModal();
      fetchEmpleados(rolActual);
    } catch (error: any) {
      console.error(error);
      alert("Error al eliminar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 relative">
      
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Directorio de Personal</h1>
        <p className="text-sm text-zinc-500">Gestiona y actualiza los datos de los empleados registrados en el sistema.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="p-12 text-center text-emerald-600 font-medium animate-pulse">Cargando base de datos de personal...</div>
          ) : empleados.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">No hay empleados registrados en la base de datos.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Empleado</th>
                  <th className="px-6 py-4">Cédula</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {empleados.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shrink-0">
                          {emp.foto ? (
                            <img src={emp.foto} alt="Foto" className="h-full w-full object-cover" />
                          ) : (
                            obtenerIniciales(emp.nombre, emp.apellido)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{emp.nombre} {emp.apellido}</p>
                          <p className="text-xs text-zinc-500">{emp.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{emp.cedula}</td>
                    <td className="px-6 py-4 capitalize">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md text-xs font-semibold">
                        {emp.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">{emp.telefono}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => abrirModal(emp)}
                        className="bg-zinc-100 text-zinc-600 hover:bg-emerald-100 hover:text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors text-xs"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL EMERGENTE DE EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 my-8">
            
            <div className="flex justify-between items-center bg-emerald-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Detalle y Edición de Personal</h3>
              <button onClick={cerrarModal} className="text-emerald-200 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={actualizarEmpleado} className="p-6">
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-200 group cursor-pointer">
                  {fotoBase64 ? (
                    <img src={fotoBase64} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-600">{obtenerIniciales(nombre, apellido)}</span>
                  )}
                  
                  <label className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center cursor-pointer transition-all">
                    <svg className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[10px] text-white font-bold">Cambiar</span>
                    <input type="file" accept="image/*" onChange={manejarSubidaFoto} className="hidden" />
                  </label>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">{nombre} {apellido}</h2>
                  <p className="text-sm font-medium text-emerald-600 capitalize">Rol: {rol}</p>
                  {fotoBase64 && (
                     <button type="button" onClick={() => setFotoBase64(null)} className="text-xs text-red-500 hover:underline mt-1">Quitar foto</button>
                  )}
                </div>
              </div>

              {/* Formulario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Cédula</label>
                  <input required type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Teléfono</label>
                  <input required type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nombre</label>
                  <input required type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Apellido</label>
                  <input required type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Asignar Rol</label>
                  <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500">
                    {(rolActual === 'super usuario' || rol?.toLowerCase().trim() === 'super usuario') && (
                      <option value="Super Usuario">Super Usuario</option>
                    )}
                    <option value="Administrador">Administrador</option>
                    <option value="comercial">Comercial</option>
                    <option value="flota">Flota</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* NUEVO: Campo Nueva Contraseña con Ojito */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Nueva Contraseña <span className="text-zinc-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={mostrarPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full rounded-lg border border-zinc-300 p-2.5 pr-10 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {mostrarPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* NUEVO: Campo Repetir Contraseña con Ojito */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Repetir Contraseña
                  </label>
                  <div className="relative">
                    <input 
                      type={mostrarConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Repetir nueva contraseña"
                      className="w-full rounded-lg border border-zinc-300 p-2.5 pr-10 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {mostrarConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Botones Inferiores */}
              <div className="mt-8 flex justify-between items-center">
                
                <button 
                  type="button" 
                  onClick={eliminarEmpleado}
                  disabled={guardando}
                  className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Eliminar
                </button>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={cerrarModal}
                    className="px-5 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={guardando}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}