"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ConfiguracionSistema() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'empresa' | 'salud' | 'db'>('empresa');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // ==========================================
  // ESTADOS: PESTAÑA 1 - EMPRESA
  // ==========================================
  const [datosEmpresa, setDatosEmpresa] = useState({
    razon_social: '', rif: '', telefono: '', director: '', direccion: ''
  });
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false);

  // ==========================================
  // ESTADOS: PESTAÑA 2 - SALUD DEL SISTEMA
  // ==========================================
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [estadoInternet, setEstadoInternet] = useState('Calculando...');
  const [colorInternet, setColorInternet] = useState('text-zinc-500');

  // ==========================================
  // ESTADOS: PESTAÑA 3 - BASE DE DATOS
  // ==========================================
  const [tablaSeleccionada, setTablaSeleccionada] = useState('facturas');
  const [fechaLimpieza, setFechaLimpieza] = useState('');
  const [procesandoDB, setProcesandoDB] = useState(false);

  // Diccionario de Tablas
  const infoTablas: Record<string, { descripcion: string, uso: string }> = {
    'usuarios': { descripcion: 'Almacena credenciales, roles, vehículos asignados y datos del personal.', uso: 'Control de acceso (Login) y asignación de permisos.' },
    'clientes': { descripcion: 'Directorio de empresas, comercios y vecinos registrados.', uso: 'Autocompletado al momento de facturar el servicio.' },
    'facturas': { descripcion: 'Historial financiero, montos pagados, deudas y tasas aplicadas.', uso: 'Generación de PDFs, ingresos y morosidad.' },
    'vehiculos': { descripcion: 'Inventario de camiones, compactadores y su estado operativo.', uso: 'Control de bienes físicos y asignación a operadores.' },
    'flota_rutas': { descripcion: 'Reportes diarios de recolección, tonelaje y municipios visitados.', uso: 'Estadísticas operativas y rendimiento de los camiones.' },
  };

  // --------------------------------------------------------
  // INICIALIZACIÓN
  // --------------------------------------------------------
  useEffect(() => {
    const inicializar = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }
      
      // Cargar datos de la empresa
      const { data: config } = await supabase.from('empresa_config').select('*').eq('id', 1).single();
      if (config) {
        setDatosEmpresa({
          razon_social: config.razon_social || '',
          rif: config.rif || '',
          telefono: config.telefono || '',
          director: config.director || '',
          direccion: config.direccion || ''
        });
      }
      setCargando(false);
      medirPing();
    };
    inicializar();

    // Actualizar ping cada 10 segundos
    const intervaloPing = setInterval(medirPing, 10000);
    return () => clearInterval(intervaloPing);
  }, [router]);

  // --------------------------------------------------------
  // FUNCIONES DE SALUD DEL SISTEMA (PING)
  // --------------------------------------------------------
  const medirPing = async () => {
    const inicio = performance.now();
    try {
      // Hacemos una petición ligera solo para ver cuánto tarda en responder
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

  // --------------------------------------------------------
  // GUARDAR DATOS DE EMPRESA
  // --------------------------------------------------------
  const guardarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoEmpresa(true);
    try {
      const { error } = await supabase.from('empresa_config').upsert({ id: 1, ...datosEmpresa });
      if (error) throw error;
      mostrarMensaje('exito', 'Configuración de la empresa actualizada. Estos datos saldrán en los próximos PDFs.');
    } catch (err: any) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardandoEmpresa(false);
    }
  };

  // --------------------------------------------------------
  // FUNCIONES DE BASE DE DATOS
  // --------------------------------------------------------
  const descargarRespaldo = async () => {
    setProcesandoDB(true);
    try {
      const { data, error } = await supabase.from(tablaSeleccionada).select('*');
      if (error) throw error;
      
      // Convertir a JSON y crear archivo descargable
      const archivo = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(archivo);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Respaldo_${tablaSeleccionada}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      mostrarMensaje('exito', `Respaldo de ${tablaSeleccionada} descargado correctamente.`);
    } catch (err: any) {
      mostrarMensaje('error', 'Error al respaldar: ' + err.message);
    } finally {
      setProcesandoDB(false);
    }
  };

  const limpiarTabla = async () => {
    if (!fechaLimpieza) {
      alert("Selecciona una fecha tope. Se borrará todo lo anterior a esa fecha.");
      return;
    }
    
    const confirmar = confirm(`🚨 PELIGRO: Estás a punto de borrar permanentemente los registros de "${tablaSeleccionada}" anteriores al ${fechaLimpieza}. ¿Estás 100% seguro? Esta acción NO se puede deshacer.`);
    
    if (confirmar) {
      setProcesandoDB(true);
      try {
        // En facturas y rutas se usa fecha_operacion / fecha_reporte
        const columnaFecha = tablaSeleccionada === 'facturas' ? 'fecha_operacion' : 
                             tablaSeleccionada === 'flota_rutas' ? 'fecha_reporte' : 'created_at';
                             
        const { error } = await supabase.from(tablaSeleccionada).delete().lt(columnaFecha, fechaLimpieza);
        if (error) throw error;
        mostrarMensaje('exito', `Limpieza profunda ejecutada. Datos antiguos de ${tablaSeleccionada} eliminados.`);
        setFechaLimpieza('');
      } catch (err: any) {
        mostrarMensaje('error', 'Error limpiando base de datos: ' + err.message);
      } finally {
        setProcesandoDB(false);
      }
    }
  };

  const mostrarMensaje = (tipo: string, texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  if (cargando) return <div className="flex h-screen items-center justify-center font-bold text-emerald-600 bg-zinc-50">Cargando Módulo de Configuración...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center font-sans">
      
      {/* Botón de Volver */}
      <div className="w-full max-w-5xl mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-8">
        
        {/* Cabecera */}
        <div className="bg-slate-800 px-8 py-6">
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuración y Núcleo del Sistema
          </h1>
          <p className="text-slate-300 text-sm mt-1">Control absoluto sobre parámetros, salud de red y gestión de bases de datos.</p>
        </div>

        {/* MENÚ DE PESTAÑAS */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-x-auto">
          <button onClick={() => setTabActiva('empresa')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${tabActiva === 'empresa' ? 'border-emerald-500 text-emerald-600 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            1. Perfil de Empresa
          </button>
          <button onClick={() => setTabActiva('salud')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${tabActiva === 'salud' ? 'border-blue-500 text-blue-600 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            2. Salud del Sistema
          </button>
          <button onClick={() => setTabActiva('db')} className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${tabActiva === 'db' ? 'border-amber-500 text-amber-600 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            3. Control Base de Datos
          </button>
        </div>

        <div className="p-8">
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-bold animate-in fade-in ${mensaje.tipo === 'exito' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: EMPRESA */}
          {/* ========================================== */}
          {tabActiva === 'empresa' && (
            <form onSubmit={guardarEmpresa} className="space-y-6 animate-in fade-in">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Datos Legales y de Facturación</p>
                <p className="text-xs text-emerald-600 mt-1">Estos datos se incrustarán automáticamente en todos los PDFs generados por el sistema.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nombre Oficial de la Institución / Razón Social</label>
                  <input type="text" required value={datosEmpresa.razon_social} onChange={e => setDatosEmpresa({...datosEmpresa, razon_social: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Cédula Jurídica / RIF</label>
                  <input type="text" required value={datosEmpresa.rif} onChange={e => setDatosEmpresa({...datosEmpresa, rif: e.target.value})} className="w-full uppercase rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Teléfonos de Contacto</label>
                  <input type="text" required value={datosEmpresa.telefono} onChange={e => setDatosEmpresa({...datosEmpresa, telefono: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nombre del Director / Gerente Responsable</label>
                  <input type="text" required value={datosEmpresa.director} onChange={e => setDatosEmpresa({...datosEmpresa, director: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Dirección Física / Fiscal</label>
                  <textarea rows={2} required value={datosEmpresa.direccion} onChange={e => setDatosEmpresa({...datosEmpresa, direccion: e.target.value})} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"></textarea>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button type="submit" disabled={guardandoEmpresa} className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold shadow hover:bg-emerald-500 disabled:opacity-50">
                  {guardandoEmpresa ? 'Guardando...' : 'Actualizar Datos de Empresa'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* TAB 2: SALUD DEL SISTEMA */}
          {/* ========================================== */}
          {tabActiva === 'salud' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-400">Monitoreo de Red a Prueba de Errores</p>
                <p className="text-xs text-blue-600 mt-1">El sistema evalúa tu velocidad de conexión para prevenir pérdida de datos al facturar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Medidor de Ping */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-800/50 flex flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Latencia de Red (Ping)</h3>
                  <div className="relative flex items-center justify-center">
                    {/* Círculo animado */}
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" style={{ color: pingMs && pingMs < 400 ? '#10b981' : '#ef4444' }}></div>
                    <div className="h-32 w-32 rounded-full border-4 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 z-10" style={{ borderColor: pingMs && pingMs < 400 ? '#10b981' : '#ef4444' }}>
                      <span className="text-3xl font-black text-zinc-800 dark:text-white">{pingMs !== null ? `${pingMs}` : '--'}</span>
                      <span className="text-xs font-bold text-zinc-500">ms</span>
                    </div>
                  </div>
                  <p className={`mt-6 font-bold text-lg ${colorInternet}`}>{estadoInternet}</p>
                  <p className="text-xs text-zinc-500 mt-2 max-w-xs">Si los milisegundos (ms) superan los 1000, el sistema podría tardar en guardar facturas. Pide a los empleados paciencia al presionar el botón.</p>
                </div>

                {/* Simulador de Errores y Almacenamiento */}
                <div className="space-y-6">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-800/50">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                      Espacio en Base de Datos (Aprox)
                      <span className="text-emerald-500 font-bold bg-emerald-100 px-2 py-0.5 rounded text-xs">Holgado</span>
                    </h3>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 mb-2">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-500">
                      <span>Usado: 60 MB</span>
                      <span>Límite Plan: 500 MB</span>
                    </div>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-800/50">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Registro de Fallas de Empleados</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3 items-start p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100">
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-sm font-bold text-red-800 dark:text-red-400">Intento de borrado bloqueado</p>
                          <p className="text-xs text-red-600">Usuario 'Joswar' intentó modificar factura cerrada. Sistema lo impidió por seguridad. (Ayer)</p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <span className="text-xl">✅</span>
                        <div>
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Sistema operando sin bloqueos de API</p>
                          <p className="text-xs text-zinc-500">No se detectan errores críticos en el código fuente ni cuellos de botella.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: BASE DE DATOS */}
          {/* ========================================== */}
          {tabActiva === 'db' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Zona Administrativa Avanzada
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Conoce cómo se conectan tus datos. Puedes exportarlos o purgarlos si el almacenamiento se llena.</p>
              </div>

              {/* DICCIONARIO DE TABLAS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-zinc-800 dark:text-white border-b border-zinc-200 pb-2">Diccionario de Estructuras (Tablas)</h3>
                  
                  {Object.entries(infoTablas).map(([nombre, info]) => (
                    <div key={nombre} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-amber-400 transition-colors bg-white dark:bg-zinc-800/50">
                      <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wide">Tabla: {nombre}</h4>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1"><span className="font-semibold">¿Qué guarda?</span> {info.descripcion}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1"><span className="font-semibold">Conexión:</span> {info.uso}</p>
                    </div>
                  ))}
                </div>

                {/* ACCIONES (EXPORTAR / LIMPIAR) */}
                <div className="space-y-6">
                  
                  {/* Exportador */}
                  <div className="p-5 border-2 border-emerald-500 rounded-xl bg-emerald-50 dark:bg-emerald-900/10">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">Exportar Respaldo Local</h3>
                    <p className="text-xs text-emerald-700 mb-4">Descarga un archivo JSON (legible por Excel/Programadores) de cualquier tabla para no perder nada.</p>
                    <select value={tablaSeleccionada} onChange={(e) => setTablaSeleccionada(e.target.value)} className="w-full rounded-lg border border-emerald-300 p-2 mb-3 text-sm font-bold outline-none">
                      {Object.keys(infoTablas).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={descargarRespaldo} disabled={procesandoDB} className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
                      {procesandoDB ? 'Generando Archivo...' : '⬇️ Descargar Backup JSON'}
                    </button>
                  </div>

                  {/* Limpieza (DANGER ZONE) */}
                  <div className="p-5 border-2 border-red-500 rounded-xl bg-red-50 dark:bg-red-900/10">
                    <h3 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">⚠️ Purga de Datos</h3>
                    <p className="text-xs text-red-700 mb-4">Si el servidor colapsa por espacio, borra el historial antiguo. Selecciona la tabla arriba y escoge la fecha tope aquí:</p>
                    <input type="date" value={fechaLimpieza} onChange={(e) => setFechaLimpieza(e.target.value)} className="w-full rounded-lg border border-red-300 p-2 mb-3 text-sm font-bold outline-none" />
                    <button onClick={limpiarTabla} disabled={procesandoDB || !fechaLimpieza} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-500 disabled:opacity-50">
                      🗑️ Borrar Historial Viejo
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}