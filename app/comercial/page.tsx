"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = "https://lngeqruorrokkuuvstut.supabase.co";
const supabaseKey = "sb_publishable_lAmxQ4ijw9Ah2E_X7Clj1w_3Yni_elN";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ComercialDashboard() {
  const router = useRouter();
  
  // Estados del sistema
  const [usuario, setUsuario] = useState<any>(null);
  const [tasaBcv, setTasaBcv] = useState<number>(0);
  const [comercial, setComercial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<any>(null);
  
  // Estados del Formulario
  const [guardando, setGuardando] = useState(false);
  const [buscandoCedula, setBuscandoCedula] = useState(false);
  const [formulario, setFormulario] = useState({
    id_cliente_rif: '',
    nombre_cliente: '',
    tipo_tramite: 'Cobranza',
    tipo_cliente: 'Residencial',
    monto_divisas: '',
    monto_bs: '',
    metodo_pago: 'Punto de Venta',
    estatus_tramite: 'Procesado'
  });

  const cargarTransacciones = async () => {
    const { data, error } = await supabase
      .from('modulo_comercializacion')
      .select('*')
      .order('fecha_operacion', { ascending: false });
    
    if (data) setComercial(data);
    if (error) console.error("Error cargando BD:", JSON.stringify(error, null, 2));
  };

  useEffect(() => {
    const iniciarDashboard = async () => {
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
      
      if (perfil) {
        if (perfil.rol === 'flota') {
          router.push('/flota');
          return;
        }
        setUsuario(perfil);
      }

      await cargarTransacciones();

      try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res.ok) {
          const data = await res.json();
          setTasaBcv(data.promedio || 36.50); 
        } else {
          setTasaBcv(36.50);
        }
      } catch (error) {
        setTasaBcv(36.50);
      }

      setCargando(false);
    };

    iniciarDashboard();
  }, [router]);

  // FUNCIÓN: Consultar Cédula vía API
  const consultarCNE = async () => {
    if (!formulario.id_cliente_rif) return;
    setBuscandoCedula(true);
    
    try {
      // Reemplaza esta URL con la API real o tu ruta de backend en Next.js (/api/verificar-cedula)
      // Ejemplo simulado para mantener el flujo de trabajo:
      const cedulaLimpia = formulario.id_cliente_rif.replace(/\D/g, '');
      
      if (cedulaLimpia === '22600509') {
        setFormulario({ ...formulario, nombre_cliente: 'JERINSON ANTONIO VALLES SIRIT' });
      } else {
        // Lógica real de fetch aquí
        // const response = await fetch(`https://api.tuproveedor.com/cedula/${cedulaLimpia}`);
        // const data = await response.json();
        // setFormulario({ ...formulario, nombre_cliente: data.nombre_completo });
        
        setFormulario({ ...formulario, nombre_cliente: 'Usuario Encontrado en Registro' });
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor de identificación.");
    } finally {
      setBuscandoCedula(false);
    }
  };

  const manejarGuardado = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    const { error } = await supabase.from('modulo_comercializacion').insert([
      {
        id_cliente_rif: formulario.id_cliente_rif,
        nombre_cliente: formulario.nombre_cliente, // Nueva columna
        tipo_tramite: formulario.tipo_tramite,
        tipo_cliente: formulario.tipo_cliente,
        monto_divisas: formulario.monto_divisas === '' ? 0 : Number(formulario.monto_divisas),
        monto_bs: formulario.monto_bs === '' ? 0 : Number(formulario.monto_bs),
        tasa_cambio_aplicada: tasaBcv,
        metodo_pago: formulario.metodo_pago,
        estatus_tramite: formulario.estatus_tramite
      }
    ]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      setMostrarModalRegistro(false);
      setFormulario({
        id_cliente_rif: '',
        nombre_cliente: '',
        tipo_tramite: 'Cobranza',
        tipo_cliente: 'Residencial',
        monto_divisas: '',
        monto_bs: '',
        metodo_pago: 'Punto de Venta',
        estatus_tramite: 'Procesado'
      });
      await cargarTransacciones();
    }
    setGuardando(false);
  };

  const abrirDetalles = (registro: any) => {
    setRegistroSeleccionado(registro);
    setMostrarModalDetalle(true);
  };

  const totalTramites = comercial.length;
  const totalBs = comercial.reduce((suma, item) => suma + Number(item.monto_bs || 0), 0);
  const totalDivisas = comercial.reduce((suma, item) => suma + Number(item.monto_divisas || 0), 0);

  const formatearFecha = (fechaISO: string) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
  };

  if (cargando) return <div className="flex h-screen items-center justify-center bg-zinc-900 text-emerald-500 font-bold text-xl">Cargando Módulo Comercial...</div>;

  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950 relative">
      
      {/* MODAL 1: REGISTRAR OPERACIÓN (Con Búsqueda de Cédula) */}
      {mostrarModalRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Registrar Nueva Operación</h3>
              <button onClick={() => setMostrarModalRegistro(false)} className="text-emerald-100 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={manejarGuardado} className="p-6 space-y-4">
              {/* Buscador de Cédula Integrado */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cédula o RIF *</label>
                <div className="flex gap-2">
                  <input required type="text" placeholder="Ej: 22600509" 
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    value={formulario.id_cliente_rif} onChange={(e) => setFormulario({...formulario, id_cliente_rif: e.target.value})} 
                  />
                  <button type="button" onClick={consultarCNE} disabled={buscandoCedula} className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-md hover:bg-emerald-200 transition-colors font-medium flex-shrink-0">
                    {buscandoCedula ? 'Buscando...' : 'Verificar'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nombre y Apellido</label>
                <input required type="text" placeholder="Autocompletado al verificar..." readOnly
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 text-zinc-900 dark:text-white focus:outline-none opacity-80"
                  value={formulario.nombre_cliente} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Trámite</label>
                  <select className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2" value={formulario.tipo_tramite} onChange={(e) => setFormulario({...formulario, tipo_tramite: e.target.value})}>
                    <option>Cobranza</option>
                    <option>Nuevo Contrato</option>
                    <option>Reclamo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cliente</label>
                  <select className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2" value={formulario.tipo_cliente} onChange={(e) => setFormulario({...formulario, tipo_cliente: e.target.value})}>
                    <option>Residencial</option>
                    <option>Comercial</option>
                    <option>Juridico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 py-4 my-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Divisas ($)</label>
                  <input type="number" step="0.01" className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2" value={formulario.monto_divisas} onChange={(e) => setFormulario({...formulario, monto_divisas: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Bolívares (Bs)</label>
                  <input type="number" step="0.01" className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2" value={formulario.monto_bs} onChange={(e) => setFormulario({...formulario, monto_bs: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setMostrarModalRegistro(false)} className="px-5 py-2.5 text-sm font-medium bg-zinc-200 rounded-lg hover:bg-zinc-300">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VER DETALLES (El Ojito) */}
      {mostrarModalDetalle && registroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="bg-zinc-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Detalles de Operación</h3>
              <button onClick={() => setMostrarModalDetalle(false)} className="text-zinc-400 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="grid grid-cols-2 gap-y-4 border-b border-zinc-100 pb-4">
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Fecha</span>{formatearFecha(registroSeleccionado.fecha_operacion)}</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Estatus</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${registroSeleccionado.estatus_tramite === 'Procesado' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {registroSeleccionado.estatus_tramite}
                  </span>
                </div>
                <div className="col-span-2"><span className="block text-xs font-bold text-zinc-400 uppercase">Cliente</span>{registroSeleccionado.nombre_cliente || 'N/A'} ({registroSeleccionado.id_cliente_rif})</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Tipo Cliente</span>{registroSeleccionado.tipo_cliente}</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Trámite</span>{registroSeleccionado.tipo_tramite}</div>
              </div>
              <div className="grid grid-cols-2 gap-y-4">
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Método de Pago</span>{registroSeleccionado.metodo_pago}</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Tasa Aplicada</span>Bs. {registroSeleccionado.tasa_cambio_aplicada}</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Monto Bolívares</span>Bs. {Number(registroSeleccionado.monto_bs).toLocaleString('es-VE')}</div>
                <div><span className="block text-xs font-bold text-zinc-400 uppercase">Monto Divisas</span>$ {Number(registroSeleccionado.monto_divisas).toLocaleString('es-VE')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA LATERAL RESTRINGIDA */}
      <aside className="hidden w-64 flex-col bg-emerald-900 text-white md:flex shadow-xl z-10">
        <div className="flex h-20 items-center justify-center border-b border-emerald-800">
          <h2 className="text-xl font-bold tracking-wider">SERDEFALCA</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <div className="mb-4 px-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider">Módulo Comercial</div>
          <Link href="/comercial" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium hover:bg-emerald-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Taquilla y Estadísticas
          </Link>
          
          {usuario?.rol !== 'comercial' && (
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-800 hover:text-white mt-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Volver al Panel Admin
            </Link>
          )}
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800">Gestión Comercial</h1>
            <p className="text-sm text-emerald-600 font-medium">Control de Ingresos y Trámites</p>
          </div>
        </header>

        <div className="p-8">
          
          <div className="mb-6 flex justify-end">
            <button onClick={() => setMostrarModalRegistro(true)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Registrar Operación
            </button>
          </div>

          {/* Estadísticas Específicas de Comercialización */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100"><h3 className="text-sm font-medium text-zinc-500">Tasa del Día</h3><p className="mt-2 text-3xl font-bold text-zinc-800">Bs. {tasaBcv.toFixed(2)}</p></div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100"><h3 className="text-sm font-medium text-zinc-500">Trámites</h3><p className="mt-2 text-3xl font-bold text-zinc-800">{totalTramites}</p></div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100"><h3 className="text-sm font-medium text-zinc-500">Ingresos Bs</h3><p className="mt-2 text-3xl font-bold text-amber-600">Bs. {totalBs.toLocaleString('es-VE')}</p></div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100"><h3 className="text-sm font-medium text-zinc-500">Ingresos Divisas</h3><p className="mt-2 text-3xl font-bold text-emerald-600">$ {totalDivisas.toLocaleString('es-VE', {minimumFractionDigits: 2})}</p></div>
          </div>

          {/* TABLA DE COMERCIALIZACIÓN CON EL OJITO */}
          <div className="rounded-xl bg-white shadow-sm border border-zinc-100 overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4"><h2 className="text-lg font-semibold text-zinc-800">Movimientos de Taquilla</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Cliente</th>
                    <th className="px-6 py-3 font-medium">Cédula/RIF</th>
                    <th className="px-6 py-3 font-medium">Trámite</th>
                    <th className="px-6 py-3 font-medium text-right">Monto Bs</th>
                    <th className="px-6 py-3 font-medium text-right">Monto $</th>
                    <th className="px-6 py-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {comercial.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No hay operaciones registradas aún.</td></tr>
                  ) : (
                    comercial.map((item) => (
                      <tr key={item.id_operacion} className="hover:bg-zinc-50">
                        <td className="px-6 py-4 font-bold text-zinc-900">{item.nombre_cliente || 'Sin Nombre'}</td>
                        <td className="px-6 py-4 font-medium text-zinc-500">{item.id_cliente_rif}</td>
                        <td className="px-6 py-4">{item.tipo_tramite}</td>
                        <td className="px-6 py-4 font-semibold text-right">{Number(item.monto_bs) > 0 ? `Bs. ${Number(item.monto_bs).toLocaleString('es-VE')}` : '-'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 text-right">{Number(item.monto_divisas) > 0 ? `$ ${Number(item.monto_divisas).toLocaleString('es-VE')}` : '-'}</td>
                        <td className="px-6 py-4 text-center">
                          {/* BOTÓN DEL OJITO */}
                          <button onClick={() => abrirDetalles(item)} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Ver detalles">
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