"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegistroEmpleados() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Campos del empleado
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('comercial');
  
  // Estado para la foto de perfil (guarda la imagen en formato texto Base64)
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  // Función para procesar la imagen cuando el usuario la selecciona
  const manejarSubidaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setFotoBase64(lector.result as string);
      };
      lector.readAsDataURL(archivo); // Convierte la imagen a texto para guardarla fácil en la BD
    }
  };

  const registrarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // 1. Crear el usuario en la Autenticación
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("No se pudo obtener el ID del usuario creado.");

      // 2. Guardar los datos en la tabla 'usuarios'
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          {
            id_usuario: userId,
            cedula: cedula,
            nombre: nombres,
            apellido: apellidos,
            telefono: telefono,
            correo: email,
            rol: rol,
            foto: fotoBase64 || null // Opcional: si hay foto la guarda, si no, va nula
          }
        ]);

      if (dbError) throw dbError;

      setMensaje({ tipo: 'exito', texto: '¡Empleado registrado con éxito en el sistema!' });
      
      // Limpiar formulario
      setCedula('');
      setNombres('');
      setApellidos('');
      setTelefono('');
      setEmail('');
      setPassword('');
      setFotoBase64(null);

    } catch (error: any) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Error al registrar: ' + (error.message || 'Error desconocido') });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-emerald-900 text-white p-6">
          <h1 className="text-2xl font-bold">Alta de Personal y Asignación de Roles</h1>
          <p className="text-emerald-200 text-sm mt-1">Registra al nuevo operador para darle acceso a su módulo correspondiente.</p>
        </div>

        <form onSubmit={registrarEmpleado} className="p-8">
          
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: FOTO DE PERFIL */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 w-full text-center">
                Fotografía de Perfil <span className="text-zinc-400 font-normal block text-xs">(Opcional)</span>
              </label>
              
              <div className="relative w-full aspect-square max-w-[200px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer overflow-hidden flex items-center justify-center">
                
                {/* Input oculto que se activa al hacer clic en el cuadro */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={manejarSubidaFoto}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {fotoBase64 ? (
                  <img src={fotoBase64} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-10 w-10 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-xs text-zinc-500 font-medium">Clic para subir imagen</p>
                  </div>
                )}
              </div>
              
              {fotoBase64 && (
                <button 
                  type="button" 
                  onClick={() => setFotoBase64(null)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Quitar foto
                </button>
              )}
            </div>

            {/* COLUMNA DERECHA: DATOS DEL EMPLEADO */}
            <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cédula de Identidad</label>
                <input required type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 22600509" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Teléfono</label>
                <input required type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 04246652978" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombres</label>
                <input required type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres del empleado" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Apellidos</label>
                <input required type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos del empleado" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Correo Electrónico (Para Login)</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@serdefalca.gob.ve" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contraseña Provisional</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rol / Módulo Asignado</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500">
                  <option value="comercial">Operador de Comercialización</option>
                  <option value="flota">Operador de Flota de Rutas</option>
                  <option value="admin">Administrador General</option>
                </select>
              </div>

            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
            <Link 
              href="/admin"
              className="px-6 py-2.5 rounded-lg border border-zinc-300 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {guardando ? 'Registrando...' : 'Guardar Empleado'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}