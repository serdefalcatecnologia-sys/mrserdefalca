"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// IMPORTANTE: Usamos la instancia centralizada en lugar de crear una nueva
import { supabase } from '@/lib/supabase'; 

export default function ConfiguracionSistema() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'empresa' | 'salud' | 'db'>('empresa');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // ESTADOS: EMPRESA
  const [datosEmpresa, setDatosEmpresa] = useState({
    razon_social: '', rif: '', telefono: '', director: '', direccion: ''
  });
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false);

  // ESTADOS: SALUD
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [estadoInternet, setEstadoInternet] = useState('Calculando...');
  const [colorInternet, setColorInternet] = useState('text-zinc-500');

  // ESTADOS: DB
  const [tablaSeleccionada, setTablaSeleccionada] = useState('facturas');
  const [fechaLimpieza, setFechaLimpieza] = useState('');
  const [procesandoDB, setProcesandoDB] = useState(false);

  const infoTablas: Record<string, { descripcion: string, uso: string }> = {
    'usuarios': { descripcion: 'Almacena credenciales y roles.', uso: 'Control de acceso.' },
    'clientes': { descripcion: 'Directorio de empresas.', uso: 'Autocompletado.' },
    'facturas': { descripcion: 'Historial financiero.', uso: 'Generación de PDFs.' },
    'vehiculos': { descripcion: 'Inventario de camiones.', uso: 'Control de bienes.' },
    'flota_rutas': { descripcion: 'Reportes diarios de recolección.', uso: 'Estadísticas.' },
  };

  useEffect(() => {
    let montado = true; // Para evitar actualizar estado si el componente se desmonta

    const inicializar = async () => {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        router.push('/');
        return;
      }
      
      const { data: config } = await supabase.from('empresa_config').select('*').eq('id', 1).single();
      
      if (config && montado) {
        setDatosEmpresa({
          razon_social: config.razon_social || '',
          rif: config.rif || '',
          telefono: config.telefono || '',
          director: config.director || '',
          direccion: config.direccion || ''
        });
      }
      
      if (montado) {
        setCargando(false);
        medirPing();
      }
    };
    
    inicializar();
    
    const intervaloPing = setInterval(() => {
      if (montado) medirPing();
    }, 10000);
    
    return () => {
      montado = false;
      clearInterval(intervaloPing);
    };
  }, [router]);

  const medirPing = async () => {
    const inicio = performance.now();
    try {
      await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { method: 'HEAD', cache: 'no-store' });
      const fin = performance.now();
      const tiempo = Math.round(fin - inicio);
      
      setPingMs(tiempo);

      if (tiempo < 150) { setEstadoInternet('Óptima (Vuela 🚀)'); setColorInternet('text-emerald-500'); }
      else if (tiempo < 400) { setEstadoInternet('Aceptable (Estable 👍)'); setColorInternet('text-blue-500'); }
      else if (tiempo < 1000) { setEstadoInternet('Lenta (Hay retrasos ⚠️)'); setColorInternet('text-amber-500'); }
      else { setEstadoInternet('Crítica (Caída inminente 🚨)'); setColorInternet('text-red-500'); }
    } catch (error) {
      setPingMs(9999);
      setEstadoInternet('Desconectado / Sin Internet 🔴');
      setColorInternet('text-red-600');
    }
  };

  const guardarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoEmpresa(true);
    try {
      const { error } = await supabase.from('empresa_config').upsert({ id: 1, ...datosEmpresa });
      if (error) throw error;
      mostrarMensaje('exito', 'Configuración de la empresa actualizada.');
    } catch (err: unknown) {
      mostrarMensaje('error', (err as Error).message);
    } finally {
      setGuardandoEmpresa(false);
    }
  };

  const descargarRespaldo = async () => {
    setProcesandoDB(true);
    try {
      const { data, error } = await supabase.from(tablaSeleccionada).select('*');
      if (error) throw error;
      
      const archivo = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(archivo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Respaldo_${tablaSeleccionada}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      mostrarMensaje('exito', `Respaldo descargado correctamente.`);
    } catch (err: unknown) {
      mostrarMensaje('error', 'Error al respaldar: ' + (err as Error).message);
    } finally {
      setProcesandoDB(false);
    }
  };

  const limpiarTabla = async () => {
    if (!fechaLimpieza) {
      alert("Selecciona una fecha tope.");
      return;
    }
    const confirmar = confirm(`🚨 PELIGRO: Vas a borrar registros anteriores al ${fechaLimpieza}. ¿Seguro?`);
    
    if (confirmar) {
      setProcesandoDB(true);
      try {
        const columnaFecha = tablaSeleccionada === 'facturas' ? 'fecha_operacion' : 
                             tablaSeleccionada === 'flota_rutas' ? 'fecha' : 'created_at';
                             
        const { error } = await supabase.from(tablaSeleccionada).delete().lt(columnaFecha, fechaLimpieza);
        if (error) throw error;
        
        mostrarMensaje('exito', `Datos antiguos eliminados.`);
        setFechaLimpieza('');
      } catch (err: unknown) {
        mostrarMensaje('error', 'Error: ' + (err as Error).message);
      } finally {
        setProcesandoDB(false);
      }
    }
  };

  const mostrarMensaje = (tipo: string, texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  if (cargando) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600 bg-zinc-50">Cargando Módulo...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-5xl mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
        <div className="bg-slate-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Configuración y Núcleo</h1>
          <p className="text-slate-300 text-sm mt-1">Gestión de parámetros y base de datos.</p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-x-auto">
          <button type="button" onClick={() => setTabActiva('empresa')} className={`px-6 py-4 text-sm font-bold border-b-2 ${tabActiva === 'empresa' ? 'border-emerald-500 text-emerald-600 bg-white' : 'border-transparent text-zinc-500'}`}>1. Perfil de Empresa</button>
          <button type="button" onClick={() => setTabActiva('salud')} className={`px-6 py-4 text-sm font-bold border-b-2 ${tabActiva === 'salud' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-zinc-500'}`}>2. Salud del Sistema</button>
          <button type="button" onClick={() => setTabActiva('db')} className={`px-6 py-4 text-sm font-bold border-b-2 ${tabActiva === 'db' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent text-zinc-500'}`}>3. Base de Datos</button>
        </div>

        <div className="p-8">
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {mensaje.texto}
            </div>
          )}

          {tabActiva === 'empresa' && (
            <form onSubmit={guardarEmpresa} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Razón Social</label>
                <input required type="text" value={datosEmpresa.razon_social} onChange={(e) => setDatosEmpresa({...datosEmpresa, razon_social: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">RIF</label>
                <input required type="text" value={datosEmpresa.rif} onChange={(e) => setDatosEmpresa({...datosEmpresa, rif: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Director Actual</label>
                <input required type="text" value={datosEmpresa.director} onChange={(e) => setDatosEmpresa({...datosEmpresa, director: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Teléfono Institucional</label>
                <input required type="text" value={datosEmpresa.telefono} onChange={(e) => setDatosEmpresa({...datosEmpresa, telefono: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 mb-1">Dirección Principal</label>
                <input required type="text" value={datosEmpresa.direccion} onChange={(e) => setDatosEmpresa({...datosEmpresa, direccion: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-3 text-sm focus:border-emerald-500 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" disabled={guardandoEmpresa} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-500 disabled:opacity-50">
                  {guardandoEmpresa ? 'Guardando...' : 'Actualizar Datos'}
                </button>
              </div>
            </form>
          )}

          {tabActiva === 'salud' && (
            <div className="animate-in fade-in space-y-6">
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between dark:bg-blue-900/20 dark:border-blue-800">
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-400">Estado de Conexión a Internet</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Latencia actual (Ping): {pingMs !== null ? `${pingMs} ms` : 'Midiendo...'}</p>
                </div>
                <div className={`text-lg font-black ${colorInternet}`}>{estadoInternet}</div>
              </div>
            </div>
          )}

          {tabActiva === 'db' && (
            <div className="animate-in fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border border-zinc-200 rounded-xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700">
                <h3 className="font-bold text-zinc-800 dark:text-white mb-4">1. Seleccionar Tabla</h3>
                <select value={tablaSeleccionada} onChange={(e) => setTablaSeleccionada(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-3 text-sm font-bold bg-white mb-4 outline-none focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-600 dark:text-white">
                  {Object.keys(infoTablas).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1"><strong>Descripción:</strong> {infoTablas[tablaSeleccionada].descripcion}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400"><strong>Uso:</strong> {infoTablas[tablaSeleccionada].uso}</p>
                
                <button type="button" onClick={descargarRespaldo} disabled={procesandoDB} className="mt-6 w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50">
                  ⬇️ Descargar Respaldo JSON
                </button>
              </div>

              <div className="p-6 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-900">
                <h3 className="font-bold text-red-800 dark:text-red-400 mb-4">2. Zona de Peligro (Limpieza)</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">Elimina registros antiguos para liberar espacio. <strong>¡Descarga un respaldo antes!</strong></p>
                
                <label className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1">Eliminar todo lo anterior a:</label>
                <input type="date" value={fechaLimpieza} onChange={(e) => setFechaLimpieza(e.target.value)} className="w-full rounded-lg border border-red-300 p-3 text-sm mb-4 outline-none focus:border-red-500 bg-white dark:bg-zinc-900 dark:border-red-800 dark:text-white" />
                
                <button type="button" onClick={limpiarTabla} disabled={procesandoDB || !fechaLimpieza} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50">
                  🗑️ Ejecutar Limpieza
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}