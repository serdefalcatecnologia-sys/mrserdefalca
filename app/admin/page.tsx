"use client";

import React, { useState } from 'react';
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
  const [rol, setRol] = useState('comercial'); // comercial, flota, admin
  const [foto, setFoto] = useState('');

  const registrarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // 1. Crear el usuario en el sistema de Autenticación de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario creado.");
      }

      // 2. Guardar los datos en la tabla 'usuarios' (Sin campos de flota mezclados)
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          {
            id_usuario: userId,
            cedula: cedula,
            nombre: nombres,
            apellido: apellidos,
            telefono: telefono,
            email: email,
            rol: rol,
            foto: foto || null // Opcional
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
      setFoto('');

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

      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-emerald-900 text-white p-6">
          <h1 className="text-2xl font-bold">Alta de Personal y Asignación de Roles</h1>
          <p className="text-emerald-200 text-sm mt-1">Registra al nuevo operador para darle acceso a su módulo correspondiente.</p>
        </div>

        <form onSubmit={registrarEmpleado} className="p-8 space-y-6">
          
          {mensaje.texto && (
            <div className={`p-4 rounded-lg text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cédula de Identidad</label>
              <input 
                required
                type="text" 
                value={cedula} 
                onChange={(e) => setCedula(e.target.value)} 
                placeholder="Ej. 22600509"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Teléfono</label>
              <input 
                required
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                placeholder="Ej. 04246652978"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombres</label>
              <input 
                required
                type="text" 
                value={nombres} 
                onChange={(e) => setNombres(e.target.value)} 
                placeholder="Nombres del empleado"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Apellidos</label>
              <input 
                required
                type="text" 
                value={apellidos} 
                onChange={(e) => setApellidos(e.target.value)} 
                placeholder="Apellidos del empleado"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Correo Electrónico (Para Login)</label>
              <input 
                required
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="correo@serdefalca.gob.ve"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contraseña Provisional</label>
              <input 
                required
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rol / Módulo Asignado</label>
              <select 
                value={rol} 
                onChange={(e) => setRol(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value="comercial">Operador de Comercialización</option>
                <option value="flota">Operador de Flota de Rutas</option>
                <option value="admin">Administrador General</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
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