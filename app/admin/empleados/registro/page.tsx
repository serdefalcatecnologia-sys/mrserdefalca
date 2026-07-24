"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// 1. CLIENTE PRINCIPAL: Mantiene la sesión del Administrador intacta
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. CLIENTE SECUNDARIO: La magia para que no te cierre la sesión.
// Tiene la orden estricta de NO guardar la sesión en el navegador (persistSession: false)
const supabaseRegistro = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export default function RegistroEmpleados() {
  const router = useRouter();
  
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Lista de vehículos
  const [vehiculosLista, setVehiculosLista] = useState<any[]>([]);

  // Campos del Formulario Empleado
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Comercial');
  const [vehiculoAsignado, setVehiculoAsignado] = useState('');

  // ----------------------------------------------------
  // ESTADOS DEL MODAL DE VEHÍCULO EXPRESS
  // ----------------------------------------------------
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [nuevaPlaca, setNuevaPlaca] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoResp, setNuevoResp] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('Operativo');
  const [guardandoVehiculo, setGuardandoVehiculo] = useState(false);

  // Cargar lista de vehículos
  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    const { data } = await supabase
      .from('vehiculos')
      .select('placa, descripcion, estado_operativo')
      .order('placa', { ascending: true });
      
    if (data) setVehiculosLista(data);
  };

  // ----------------------------------------------------
  // FUNCIÓN: GUARDAR VEHÍCULO EXPRESS
  // ----------------------------------------------------
  const guardarVehiculoExpress = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoVehiculo(true);

    try {
      const placaMayuscula = nuevaPlaca.toUpperCase();
      const { error } = await supabase.from('vehiculos').insert([{
        placa: placaMayuscula,
        descripcion: nuevaDesc,
        responsable: nuevoResp,
        estado_operativo: nuevoEstado
      }]);

      if (error) {
        if (error.code === '23505') throw new Error('Esta placa ya está registrada.');
        throw error;
      }

      // Recargar la lista y auto-seleccionar el camión recién creado
      await cargarVehiculos();
      setVehiculoAsignado(placaMayuscula);
      
      // Cerrar y limpiar modal
      setModalVehiculo(false);
      setNuevaPlaca(''); setNuevaDesc(''); setNuevoResp(''); setNuevoEstado('Operativo');
      
      // Notificación rápida
      setMensaje({ tipo: 'exito', texto: '¡Vehículo registrado y listo para ser asignado!' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setGuardandoVehiculo(false);
    }
  };

  // ----------------------------------------------------
  // FUNCIÓN: GUARDAR EMPLEADO
  // ----------------------------------------------------
  const registrarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // AQUÍ USAMOS EL CLIENTE SECUNDARIO PARA QUE NO TE SAQUE DE TU SESIÓN
      const { data: authData, error: authError } = await supabaseRegistro.auth.signUp({
        email: correo,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Y aquí volvemos a usar el principal para guardar los datos en la tabla usando tus permisos de Admin
        const { error: dbError } = await supabase.from('usuarios').insert([{
          id_usuario: authData.user.id,
          cedula: cedula,
          telefono: telefono,
          nombre: nombres,
          apellido: apellidos,
          correo: correo,
          rol: rol,
          vehiculo_asignado: rol === 'Flota' ? vehiculoAsignado : null 
        }]);

        if (dbError) throw dbError;

        setMensaje({ tipo: 'exito', texto: '¡Empleado registrado y asignado exitosamente!' });
        
        setCedula(''); setTelefono(''); setNombres(''); setApellidos(''); setCorreo(''); setPassword(''); setVehiculoAsignado('');
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
      }
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar: ' + error.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center font-sans">
      
      <div className="w-full max-w-4xl mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        <div className="bg-emerald-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white tracking-wide">Alta de Personal y Asignación de Roles</h1>
          <p className="text-emerald-200 text-sm mt-1">Registra al nuevo operador para darle acceso a su módulo correspondiente.</p>
        </div>

        <form onSubmit={registrarEmpleado} className="p-8">
          
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${mensaje.tipo === 'exito' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="md:col-span-1 flex flex-col items-center justify-start border-r border-zinc-100 dark:border-zinc-800 pr-4">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Fotografía de Perfil</p>
              <p className="text-xs text-zinc-400 mb-4">(Opcional)</p>
              
              <div className="w-40 h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-emerald-500 transition-colors cursor-pointer group">
                <svg className="h-10 w-10 mb-2 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-medium group-hover:text-emerald-600 transition-colors">Clic para subir imagen</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Cédula de Identidad *</label>
                <input required type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 22600509" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Teléfono *</label>
                <input required type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 04246652978" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nombres *</label>
                <input required type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres del empleado" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Apellidos *</label>
                <input required type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos del empleado" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Correo Electrónico (Para Login) *</label>
                <input 
                  required 
                  type="email" 
                  value={correo} 
                  onChange={(e) => setCorreo(e.target.value)} 
                  onKeyDown={(e) => e.stopPropagation()} 
                  autoComplete="off" 
                  placeholder="usuario@serdefalca.com" 
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 bg-blue-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Contraseña Provisional *</label>
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="new-password"
                  placeholder="••••••••" 
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 bg-blue-50/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-500 mb-1">Rol / Módulo Asignado *</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full rounded-lg border-2 border-emerald-500 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-800 dark:text-white font-bold text-emerald-900 dark:text-emerald-100">
                  <option value="Administrador">Administrador del Sistema (Acceso Total)</option>
                  <option value="Comercial">Operador de Comercialización y Facturación</option>
                  <option value="Flota">Operador de Flota de Rutas</option>
                </select>
              </div>

              {/* ASIGNACIÓN DE VEHÍCULO + BOTÓN EXPRESS */}
              {rol === 'Flota' && (
                <div className="sm:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-400">
                        Vehículo Asignado (Opcional)
                      </label>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        Selecciona el camión para este operador.
                      </p>
                    </div>
                    {/* BOTÓN MÁGICO */}
                    <button 
                      type="button" 
                      onClick={() => setModalVehiculo(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Registrar Camión
                    </button>
                  </div>
                  
                  {vehiculosLista.length === 0 ? (
                    <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-800 font-medium">
                      ⚠️ La flota está vacía. Haz clic en el botón verde de arriba para registrar tu primer vehículo.
                    </div>
                  ) : (
                    <select 
                      value={vehiculoAsignado} 
                      onChange={(e) => setVehiculoAsignado(e.target.value)} 
                      className="w-full rounded-lg border border-emerald-400 p-2.5 text-sm outline-none focus:border-emerald-600 dark:bg-zinc-800 dark:border-emerald-700 dark:text-white font-medium"
                    >
                      <option value="">-- Sin vehículo fijo / Rotativo --</option>
                      {vehiculosLista.map((v) => (
                        <option key={v.placa} value={v.placa}>
                          Placa: {v.placa} - {v.descripcion} ({v.estado_operativo})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" onClick={() => router.push('/admin')} className="px-6 py-2.5 text-sm font-bold text-zinc-600 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={cargando} className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {cargando ? 'Registrando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>

      {/* ================================================================= */}
      {/* MODAL DE REGISTRO EXPRESS DE VEHÍCULO */}
      {/* ================================================================= */}
      {modalVehiculo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                Registro Express de Vehículo
              </h3>
              <button type="button" onClick={() => setModalVehiculo(false)} className="text-emerald-200 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={guardarVehiculoExpress} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Placa o Código *</label>
                <input required type="text" value={nuevaPlaca} onChange={(e) => setNuevaPlaca(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Ej. COMP-01" className="w-full uppercase rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Estado Inicial *</label>
                <select required value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-bold outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                  <option value="Operativo">🟢 Operativo</option>
                  <option value="En Mantenimiento">🟡 En Mantenimiento</option>
                  <option value="Inoperativo">🔴 Inoperativo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Descripción del Equipo *</label>
                <input required type="text" value={nuevaDesc} onChange={(e) => setNuevaDesc(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Ej. Camión Compactador Blanco" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Responsable Fijo</label>
                <input type="text" value={nuevoResp} onChange={(e) => setNuevoResp(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="(Opcional) Nombre del supervisor" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setModalVehiculo(false)} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={guardandoVehiculo} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50">
                  {guardandoVehiculo ? 'Guardando...' : 'Guardar y Seleccionar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}