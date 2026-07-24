"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PanelFlotaOperaciones() {
  const router = useRouter();
  
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'rutas' | 'vehiculos'>('rutas');

  const [reportes, setReportes] = useState<any[]>([]);
  const [vehiculosLista, setVehiculosLista] = useState<any[]>([]);

  // ESTADOS DE RUTAS
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [vehiculoRuta, setVehiculoRuta] = useState('');
  const [conductor, setConductor] = useState('');
  const [municipio, setMunicipio] = useState('Miranda');
  const [tonelaje, setTonelaje] = useState('');
  const [estadoRuta, setEstadoRuta] = useState('Completada');
  const [observacionesRuta, setObservacionesRuta] = useState('');

  // ESTADOS DEL AUTOCOMPLETADO DE SECTORES
  const [rutaSector, setRutaSector] = useState('');
  const [sugerenciasSector, setSugerenciasSector] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // ESTADOS DE ACTUALIZACIÓN DE VEHÍCULOS
  const [placa, setPlaca] = useState('');
  const [descripcionVehiculo, setDescripcionVehiculo] = useState('');
  const [responsable, setResponsable] = useState('');
  const [estadoVehiculo, setEstadoVehiculo] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const inicializarModulo = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }

      const { data: perfil } = await supabase.from('usuarios').select('*').eq('id_usuario', authData.session.user.id).single();
      
      if (perfil) {
        setUsuario(perfil);
        setConductor(`${perfil.nombre} ${perfil.apellido}`);
      }

      await cargarDatosCompletos(perfil?.vehiculo_asignado);
      setCargando(false);
    };

    inicializarModulo();
  }, [router]);

  const cargarDatosCompletos = async (vehiculoAsignado?: string) => {
    const [resRutas, resVehiculos] = await Promise.all([
      supabase.from('flota_rutas').select('*').order('fecha_reporte', { ascending: false }).limit(50),
      supabase.from('vehiculos').select('*').order('placa', { ascending: true })
    ]);
    
    if (resRutas.data) setReportes(resRutas.data);
    
    if (resVehiculos.data) {
      setVehiculosLista(resVehiculos.data);
      const placaPorDefecto = vehiculoAsignado || (resVehiculos.data.length > 0 ? resVehiculos.data[0].placa : '');
      if (!vehiculoRuta) setVehiculoRuta(placaPorDefecto);
      if (!placa) manejarCambioVehiculoLista(placaPorDefecto, resVehiculos.data);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // =======================================================================
  // LÓGICA DE AUTOCOMPLETADO MAGNÉTICO
  // =======================================================================
  const manejarCambioSector = async (texto: string) => {
    const textoMayuscula = texto.toUpperCase();
    setRutaSector(textoMayuscula);
    
    if (textoMayuscula.length >= 3) {
      const { data } = await supabase
        .from('sectores_guardados')
        .select('nombre')
        .ilike('nombre', `%${textoMayuscula}%`)
        .limit(5);

      if (data && data.length > 0) {
        setSugerenciasSector(data.map(d => d.nombre));
        setMostrarSugerencias(true);
      } else {
        setMostrarSugerencias(false);
      }
    } else {
      setMostrarSugerencias(false);
    }
  };

  const seleccionarSugerencia = (sector: string) => {
    setRutaSector(sector);
    setMostrarSugerencias(false);
  };
  // =======================================================================

  const registrarReporteRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoRuta) { alert("Debe seleccionar un vehículo."); return; }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // MAGIA AÑADIDA: Generamos un código único para que la base de datos no dé error
      const codigoGenerado = `RUT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      // 1. Guardamos el reporte de la ruta
      const { error } = await supabase.from('flota_rutas').insert([{
        codigo: codigoGenerado, // <-- AQUÍ ENVIAMOS EL CÓDIGO A LA BASE DE DATOS
        fecha_reporte: fecha,
        vehiculo: vehiculoRuta,
        conductor: conductor,
        municipio: municipio,
        ruta_sector: rutaSector,
        tonelaje: parseFloat(tonelaje) || 0,
        estado_ruta: estadoRuta,
        observaciones: observacionesRuta || 'Sin observaciones',
        registrado_por: usuario?.id_usuario
      }]);

      if (error) throw error;

      // 2. Alimentamos el diccionario guardando el nuevo sector (Upsert evita duplicados)
      await supabase.from('sectores_guardados').upsert([{ nombre: rutaSector }], { onConflict: 'nombre' });

      setMensaje({ tipo: 'exito', texto: '¡Reporte de carga guardado exitosamente!' });
      
      setRutaSector(''); setTonelaje(''); setObservacionesRuta(''); setMostrarSugerencias(false);
      await cargarDatosCompletos(usuario?.vehiculo_asignado);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar ruta: ' + error.message });
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambioVehiculoLista = (placaSeleccionada: string, lista = vehiculosLista) => {
    setPlaca(placaSeleccionada);
    const v = lista.find(x => x.placa === placaSeleccionada);
    if (v) {
      setDescripcionVehiculo(v.descripcion);
      setResponsable(v.responsable);
      setEstadoVehiculo(v.estado_operativo);
    }
  };

  const actualizarEstadoVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa) return;

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.from('vehiculos').update({
        descripcion: descripcionVehiculo,
        responsable: responsable,
        estado_operativo: estadoVehiculo,
        updated_at: new Date().toISOString()
      }).eq('placa', placa);

      if (error) throw error;
      
      setMensaje({ tipo: 'exito', texto: '¡Estado del vehículo actualizado correctamente!' });
      await cargarDatosCompletos(usuario?.vehiculo_asignado);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar: ' + error.message });
    } finally {
      setGuardando(false);
    }
  };

  // --------------------------------------------------------
  // FUNCIONES: VEHÍCULOS (AUTOCOMPLETADO Y EDICIÓN)
  // --------------------------------------------------------
  const esEdicionVehiculo = vehiculosLista.some(v => v.placa === placa.toUpperCase());

  const manejarCambioPlaca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorPlaca = e.target.value.toUpperCase();
    setPlaca(valorPlaca);

    const vehiculoExistente = vehiculosLista.find(v => v.placa === valorPlaca);
    if (vehiculoExistente) {
      setDescripcionVehiculo(vehiculoExistente.descripcion);
      setResponsable(vehiculoExistente.responsable);
      setEstadoVehiculo(vehiculoExistente.estado_operativo);
    }
  };

  const seleccionarVehiculoParaEditar = (vehiculo: any) => {
    setPlaca(vehiculo.placa);
    setDescripcionVehiculo(vehiculo.descripcion);
    setResponsable(vehiculo.responsable);
    setEstadoVehiculo(vehiculo.estado_operativo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const registrarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.from('vehiculos').upsert([{
        placa: placa.toUpperCase(),
        descripcion: descripcionVehiculo,
        responsable: responsable,
        estado_operativo: estadoVehiculo,
        updated_at: new Date().toISOString()
      }], { onConflict: 'placa' });

      if (error) throw error;
      
      setMensaje({ 
        tipo: 'exito', 
        texto: esEdicionVehiculo ? '¡Vehículo editado y actualizado correctamente!' : '¡Nuevo vehículo guardado correctamente!' 
      });
      
      setPlaca(''); setDescripcionVehiculo(''); setResponsable(''); setEstadoVehiculo('Operativo');
      await cargarDatosCompletos();
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al procesar vehículo: ' + error.message });
    } finally {
      setGuardando(false);
    }
  };

  const obtenerIniciales = (n = '', a = '') => `${n.charAt(0) || ''}${a.charAt(0) || ''}`.toUpperCase();

  if (cargando) return <div className="flex h-screen items-center justify-center bg-zinc-100 font-sans"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col relative overflow-hidden">
      
      <header className="flex h-20 items-center justify-between bg-emerald-900 px-8 text-white shadow-md shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide">SERDEFALCA | Operaciones Flota</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold capitalize">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-xs text-emerald-300 capitalize">{usuario?.rol}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shadow-sm shrink-0">
            {usuario?.foto ? <img src={usuario.foto} alt="Perfil" className="h-full w-full object-cover" /> : obtenerIniciales(usuario?.nombre, usuario?.apellido)}
          </div>
          <button onClick={cerrarSesion} className="ml-2 text-emerald-200 hover:text-white transition-colors"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          <div className="flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setTabActiva('rutas')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tabActiva === 'rutas' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
              Reportes de Ruta y Carga
            </button>
            <button onClick={() => setTabActiva('vehiculos')} className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${tabActiva === 'vehiculos' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
              Reportar Novedad de Vehículo
            </button>
          </div>

          {mensaje.texto && (
            <div className={`p-4 rounded-lg text-sm font-bold ${mensaje.tipo === 'exito' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{mensaje.texto}</div>
          )}

          {/* VISTA 1: RUTAS */}
          {tabActiva === 'rutas' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100"><h2 className="text-lg font-bold text-emerald-800">Registrar Viaje Diario</h2></div>
                <form onSubmit={registrarReporteRuta} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Fecha *</label>
                    <input type="date" required value={fecha} onChange={(e)=>setFecha(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Vehículo Asignado *</label>
                    <select required value={vehiculoRuta} onChange={(e) => setVehiculoRuta(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-bold text-emerald-800 bg-emerald-50 outline-none focus:border-emerald-500">
                      {vehiculosLista.map(v => <option key={v.placa} value={v.placa}>{v.placa}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Conductor *</label>
                    <input type="text" required value={conductor} onChange={(e)=>setConductor(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Municipio *</label>
                    <select required value={municipio} onChange={(e)=>setMunicipio(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500">
                      <option value="Acosta">Acosta</option><option value="Carirubana">Carirubana</option><option value="Colina">Colina</option><option value="Falcón">Falcón</option><option value="Los Taques">Los Taques</option><option value="Miranda">Miranda</option><option value="Silva">Silva</option><option value="Zamora">Zamora</option>
                    </select>
                  </div>

                  {/* CAMPO DE SECTOR CON AUTOCOMPLETADO */}
                  <div className="md:col-span-2 relative">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Ruta / Sector Cubierto *</label>
                    <input 
                      type="text" 
                      required 
                      value={rutaSector} 
                      onChange={(e)=>manejarCambioSector(e.target.value)} 
                      onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                      onFocus={() => { if(rutaSector.length >= 3 && sugerenciasSector.length > 0) setMostrarSugerencias(true); }}
                      placeholder="Ej. SECTOR INDEPENDENCIA..."
                      className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500" 
                      autoComplete="off"
                    />
                    
                    {/* Caja de Sugerencias Flotante */}
                    {mostrarSugerencias && sugerenciasSector.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-emerald-200 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto animate-in slide-in-from-top-1 fade-in">
                        {sugerenciasSector.map((sugerencia, idx) => (
                          <li 
                            key={idx} 
                            onMouseDown={() => seleccionarSugerencia(sugerencia)}
                            className="p-3 text-sm text-zinc-700 hover:bg-emerald-50 cursor-pointer border-b border-zinc-100 last:border-0 font-bold transition-colors flex items-center gap-2"
                          >
                            <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {sugerencia}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Tonelaje (Tons) *</label>
                    <input type="number" step="0.01" required value={tonelaje} onChange={(e)=>setTonelaje(e.target.value)} className="w-full rounded-lg border border-emerald-300 p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Estado de Ruta *</label>
                    <select required value={estadoRuta} onChange={(e)=>setEstadoRuta(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm font-semibold outline-none focus:border-emerald-500">
                      <option value="Completada">✅ Completada al 100%</option><option value="Incompleta">⚠️ Incompleta (Faltó sector)</option><option value="Cancelada">🚨 Cancelada</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Observaciones</label>
                    <input type="text" value={observacionesRuta} onChange={(e)=>setObservacionesRuta(e.target.value)} placeholder="Novedades durante el viaje..." className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500" />
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end pt-4 border-t border-zinc-100">
                    <button type="submit" disabled={guardando} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50">
                      {guardando ? 'Guardando...' : 'Registrar Viaje'}
                    </button>
                  </div>
                </form>
              </div>

              {/* HISTORIAL */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200">
                  <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Historial de Viajes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600">
                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Fecha</th>
                        <th className="px-6 py-3 font-semibold">Vehículo</th>
                        <th className="px-6 py-3 font-semibold">Municipio / Sector</th>
                        <th className="px-6 py-3 font-semibold text-center">Tons</th>
                        <th className="px-6 py-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {reportes.map((rep) => (
                        <tr key={rep.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-3 font-medium">{rep.fecha_reporte}</td>
                          <td className="px-6 py-3 font-bold text-zinc-900">{rep.vehiculo}</td>
                          <td className="px-6 py-3">
                            <p className="text-zinc-800 font-medium">{rep.municipio}</p>
                            <p className="text-xs text-zinc-500">{rep.ruta_sector}</p>
                          </td>
                          <td className="px-6 py-3 text-center font-bold text-emerald-600">{rep.tonelaje} Tn</td>
                          <td className="px-6 py-3">{rep.estado_ruta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: VEHÍCULOS Y ESTABILIDAD */}
          {tabActiva === 'vehiculos' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className={`${esEdicionVehiculo ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50'} px-6 py-4 border-b transition-colors`}>
                  <h2 className={`text-lg font-bold ${esEdicionVehiculo ? 'text-amber-800 dark:text-amber-400' : 'text-blue-800 dark:text-blue-400'}`}>
                    {esEdicionVehiculo ? 'Editando Vehículo Existente' : 'Registrar Nuevo Vehículo'}
                  </h2>
                  <p className={`text-xs mt-1 ${esEdicionVehiculo ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-500'}`}>
                    {esEdicionVehiculo ? 'Modifica los datos y presiona Editar.' : 'Ingresa la placa para registrar la unidad en el sistema.'}
                  </p>
                </div>
                
                <form onSubmit={registrarVehiculo} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Placa o Código Interno *</label>
                      <input 
                        required 
                        type="text" 
                        value={placa} 
                        onChange={manejarCambioPlaca} 
                        placeholder="Ej. COMP-01 o A12B34C" 
                        className={`w-full uppercase rounded-lg border p-2.5 text-sm outline-none dark:bg-zinc-800 dark:text-white font-bold transition-colors ${esEdicionVehiculo ? 'border-amber-400 focus:border-amber-500 text-amber-700 dark:text-amber-400' : 'border-zinc-300 focus:border-blue-500 dark:border-zinc-700'}`} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Estado de Operatividad *</label>
                      <select required value={estadoVehiculo} onChange={(e) => setEstadoVehiculo(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white font-bold">
                        <option value="Operativo">🟢 Operativo</option>
                        <option value="En Mantenimiento">🟡 En Mantenimiento Correctivo/Preventivo</option>
                        <option value="Inoperativo">🔴 Inoperativo (Dañado)</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Descripción del Equipo *</label>
                      <input required type="text" value={descripcionVehiculo} onChange={(e) => setDescripcionVehiculo(e.target.value)} placeholder="Ej. Camión Compactador Blanco marca Ford..." className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Responsable del Bien *</label>
                      <input required type="text" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nombre del Supervisor a cargo" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      type="submit" 
                      disabled={guardando} 
                      className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 text-white ${esEdicionVehiculo ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                      {guardando ? (esEdicionVehiculo ? 'Editando...' : 'Guardando...') : (esEdicionVehiculo ? 'Editar Vehículo' : 'Guardar Vehículo')}
                    </button>
                  </div>
                </form>
              </div>

              {/* TABLA VEHICULOS */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Flota de SERDEFALCA</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Placa / ID</th>
                        <th className="px-6 py-3 font-semibold">Descripción</th>
                        <th className="px-6 py-3 font-semibold">Responsable</th>
                        <th className="px-6 py-3 font-semibold">Estatus Operativo</th>
                        <th className="px-6 py-3 font-semibold text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {vehiculosLista.map((v) => (
                        <tr key={v.placa} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-3 font-bold text-zinc-900 dark:text-zinc-100 uppercase">{v.placa}</td>
                          <td className="px-6 py-3">{v.descripcion}</td>
                          <td className="px-6 py-3 font-medium text-zinc-800 dark:text-zinc-200">{v.responsable}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full
                              ${v.estado_operativo === 'Operativo' ? 'bg-emerald-100 text-emerald-800' : ''}
                              ${v.estado_operativo === 'En Mantenimiento' ? 'bg-amber-100 text-amber-800' : ''}
                              ${v.estado_operativo === 'Inoperativo' ? 'bg-red-100 text-red-800' : ''}
                            `}>
                              {v.estado_operativo}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button 
                              onClick={() => seleccionarVehiculoParaEditar(v)}
                              title="Editar Vehículo"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-amber-100 hover:text-amber-600 dark:bg-zinc-800 dark:text-zinc-400 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
