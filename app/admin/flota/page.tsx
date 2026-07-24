"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VistaFlotaRutas() {
  const [datosFlota, setDatosFlota] = useState<any[]>([]);
  const [datosVehiculos, setDatosVehiculos] = useState<any[]>([]); // Para las estadísticas de arriba
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal (Ventana de Detalles)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<any>(null);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // 1. CARGAR DATOS DESDE SUPABASE (Con los nombres correctos de tus tablas)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resRutas, resVehiculos] = await Promise.all([
          supabase.from('flota_rutas').select('*').order('fecha', { ascending: false }),
          supabase.from('vehiculos').select('*')
        ]);

        if (resRutas.error) {
          console.error("Error obteniendo datos de la flota:", resRutas.error);
        } else {
          setDatosFlota(resRutas.data || []);
        }

        if (resVehiculos.data) {
          setDatosVehiculos(resVehiculos.data);
        }

      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 2. APLICAR FILTROS (Mapeado a 'estatus')
  const datosFiltrados = datosFlota.filter(item => {
    const cumpleFechaInicio = fechaInicio === '' || item.fecha >= fechaInicio;
    const cumpleFechaFin = fechaFin === '' || item.fecha <= fechaFin;
    const cumpleEstado = estadoFiltro === '' || item.estatus?.includes(estadoFiltro);
    return cumpleFechaInicio && cumpleFechaFin && cumpleEstado;
  });

  // 3. CÁLCULO DE ESTADÍSTICAS (Mapeado a 'toneladas' y leyendo la tabla de vehículos para mayor exactitud)
  const totalTonelaje = datosFiltrados.reduce((acc, curr) => acc + Number(curr.toneladas || 0), 0);
  const vehiculosOperativos = datosVehiculos.filter(v => v.estado_operativo === 'Operativo').length;
  const vehiculosMantenimiento = datosVehiculos.filter(v => v.estado_operativo === 'En Mantenimiento' || v.estado_operativo === 'Inoperativo').length;

  // 4. GENERAR PDF CON MEMBRETE
  const generarPDF = () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos para exportar con estos filtros.");
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logo1.png';
    doc.addImage(img, 'PNG', 0, 0, 210, 35);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Reporte de Flota y Tonelaje Recolectado', 14, 48);

    if (fechaInicio || fechaFin || estadoFiltro) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Filtros: ${estadoFiltro || 'Todos los estados'} | Desde: ${fechaInicio || 'Inicio'} Hasta: ${fechaFin || 'Hoy'}`, 14, 54);
    }

    // Configurar tabla (Nombres de BD corregidos)
    const columnas = ["Código", "Vehículo", "Conductor", "Municipio", "Tonelaje", "Estado", "Fecha"];
    const filas = datosFiltrados.map(item => [
      item.codigo || item.id,
      item.unidad,
      item.chofer || 'No asignado',
      item.municipio,
      `${Number(item.toneladas || 0).toFixed(2)} T`,
      item.estatus,
      item.fecha
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, 
    });

    doc.save('Reporte_Flota_SERDEFALCA.pdf');
  };

  // Funciones para manejar el Modal
  const abrirModal = (registro: any) => {
    setRegistroSeleccionado(registro);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRegistroSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 relative">
      
      {/* BOTÓN DE VOLVER */}
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Vista Flota de Rutas</h1>
          <p className="text-sm text-zinc-500">Supervisión de camiones, conductores y estatus logístico.</p>
        </div>
        
        <button 
          onClick={generarPDF}
          disabled={cargando}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Reporte PDF
        </button>
      </div>

      {/* ESTADÍSTICAS REALES */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Tonelaje Total Recolectado</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{totalTonelaje.toFixed(2)} <span className="text-lg">Toneladas</span></p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Vehículos Operativos</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{vehiculosOperativos}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Vehículos Inactivos/Mantenimiento</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">{vehiculosMantenimiento}</p>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Estado de la Ruta</label>
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="Completada">Completada al 100%</option>
            <option value="Incompleta">Incompleta</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="p-8 text-center text-zinc-500">Cargando base de datos de flota...</div>
          ) : datosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No se encontraron registros de rutas.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Código</th>
                  <th className="px-6 py-4 font-semibold">Vehículo</th>
                  <th className="px-6 py-4 font-semibold">Conductor</th>
                  <th className="px-6 py-4 font-semibold">Estado de Ruta</th>
                  <th className="px-6 py-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {datosFiltrados.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.codigo || item.id}</td>
                    <td className="px-6 py-4 font-bold uppercase">{item.unidad}</td>
                    <td className="px-6 py-4">{item.chofer || 'No asignado'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${item.estatus?.includes('Completada') ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${item.estatus?.includes('Incompleta') ? 'bg-amber-100 text-amber-800' : ''}
                        ${item.estatus?.includes('Cancelada') ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {item.estatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => abrirModal(item)}
                        title="Ver Detalles"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-blue-100 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL EMERGENTE DE DETALLES */}
      {modalAbierto && registroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Detalles de Operación</h3>
              <button onClick={cerrarModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Código de Ruta</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100 font-medium">{registroSeleccionado.codigo || registroSeleccionado.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{registroSeleccionado.fecha}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vehículo Asignado</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100 font-bold uppercase">{registroSeleccionado.unidad}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conductor Asignado</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{registroSeleccionado.chofer || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Municipio y Sector</p>
                  <p className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{registroSeleccionado.municipio}</p>
                  <p className="text-xs text-zinc-500">{registroSeleccionado.ruta}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tonelaje Recolectado</p>
                  <p className="mt-1 text-base font-bold text-emerald-600">{Number(registroSeleccionado.toneladas || 0).toFixed(2)} T</p>
                </div>
              </div>

              {/* OBSERVACIONES */}
              {registroSeleccionado.observaciones && (
                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg">
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">Observaciones del Viaje</p>
                  <p className="text-sm text-zinc-800 dark:text-zinc-300">
                    {registroSeleccionado.observaciones}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-right">
              <button 
                onClick={cerrarModal}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}