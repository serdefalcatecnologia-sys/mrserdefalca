"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PanelOperadorComercial() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estados del formulario
  const [idFactura, setIdFactura] = useState('');
  const [cliente, setCliente] = useState('');
  const [municipio, setMunicipio] = useState('Miranda');
  const [monto, setMonto] = useState('');
  const [estado, setEstado] = useState('Pagado');
  const [fecha, setFecha] = useState('');

  // Validar sesión al entrar
  useEffect(() => {
    const validarSesion = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }
      // Obtener datos del usuario
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', authData.session.user.id)
        .single();
      
      if (perfil) setUsuario(perfil);
    };
    validarSesion();
    
    // Autocompletar la fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    setFecha(hoy);
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const registrarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase
        .from('facturas')
        .insert([
          { 
            id: idFactura, 
            cliente: cliente, 
            municipio: municipio, 
            monto: parseFloat(monto), 
            estado: estado, 
            fecha: fecha 
          }
        ]);

      if (error) throw error;

      setMensaje({ tipo: 'exito', texto: '¡Registro guardado exitosamente en la base de datos!' });
      
      // Limpiar formulario después de guardar
      setIdFactura('');
      setCliente('');
      setMonto('');
      // Mantenemos el municipio, estado y fecha para facilitar registros seguidos
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);

    } catch (error: any) {
      console.error("Error guardando:", error);
      setMensaje({ tipo: 'error', texto: 'Hubo un error al guardar. Verifica que el N° de Factura no esté repetido.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      
      {/* HEADER DEL OPERADOR */}
      <header className="bg-emerald-900 text-white px-8 py-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wider">SERDEFALCA</h1>
          <p className="text-emerald-300 text-sm">Módulo de Recaudación y Operaciones</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:block">
            Operador: {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Cargando...'}
          </span>
          <button 
            onClick={cerrarSesion}
            className="bg-emerald-800 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO CENTRAL - FORMULARIO */}
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Registrar Nueva Operación Comercial</h2>
            <p className="text-sm text-zinc-500 mt-1">Completa los datos para ingresar la factura al sistema central.</p>
          </div>

          <form onSubmit={registrarFactura} className="p-6 space-y-6">
            
            {mensaje.texto && (
              <div className={`p-4 rounded-lg text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* N° Factura */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">N° Factura / Recibo <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej. FAC-1005"
                  value={idFactura}
                  onChange={(e) => setIdFactura(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Operación <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                />
              </div>

              {/* Cliente */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cliente / Razón Social <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  placeholder="Nombre de la empresa o local"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                />
              </div>

              {/* Municipio */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Municipio <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Miranda">Miranda</option>
                  <option value="Carirubana">Carirubana</option>
                  <option value="Colina">Colina</option>
                  <option value="Los Taques">Los Taques</option>
                  <option value="Silva">Silva</option>
                  <option value="Falcón">Falcón</option>
                </select>
              </div>

              {/* Estado de Pago */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado del Cobro <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Mora">Mora (Atrasado)</option>
                </select>
              </div>

              {/* Monto */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Monto de la Factura (USD $) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-zinc-500 sm:text-sm">$</span>
                  </div>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 py-2.5 pl-7 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                  />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button 
                type="submit"
                disabled={cargando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cargando ? 'Procesando...' : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Registrar en Base de Datos
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}