"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VistaFlotaRutas() {
  const [datosFlota, setDatosFlota] = useState<any[]>([]);
  const [datosVehiculos, setDatosVehiculos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [flotaSeleccionada, setFlotaSeleccionada] = useState<any>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: flotaData, error: flotaError } = await supabase
          .from('flota_rutas')
          .select('*')
          .order('fecha', { ascending: false });

        if (flotaError) {
          console.error("Error obteniendo flota_rutas:", flotaError);
        } else {
          setDatosFlota(flotaData || []);
        }

        const { data: vehiculosData, error: vehiculosError } = await supabase
          .from('vehiculos')
          .select('*');

        if (vehiculosError) {
          console.error("Error obteniendo vehículos:", vehiculosError);
        } else {
          setDatosVehiculos(vehiculosData || []);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const datosFiltrados = datosFlota.filter(item => {
    const cumpleFechaInicio = fechaInicio === '' || item.fecha >= fechaInicio;
    const cumpleFechaFin = fechaFin === '' || item.fecha <= fechaFin;
    return cumpleFechaInicio && cumpleFechaFin;
  });

  const totalTonelaje = datosFiltrados.reduce((acc, curr) => acc + Number(curr.tonelaje || 0), 0);
  const totalViajes = datosFiltrados.length;
  const unidadesActivas = datosVehiculos.length;

  const generarReporteGeneral = async () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos para exportar con estos filtros.");
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logo1.png';
    await new Promise((resolve) => {
      img.onload = resolve; img.onerror = resolve;
    });

    if (img.complete && img.naturalWidth > 0) doc.addImage(img, 'PNG', 0, 0, 210, 35);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Reporte de Flota y Control de Rutas', 14, 48);

    if (fechaInicio || fechaFin) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rango de fechas | Desde: ${fechaInicio || 'Inicio'} Hasta: ${fechaFin || 'Hoy'}`, 14, 54);
    }

    const columnas = ["Placa", "Conductor", "Ruta / Municipio", "Toneladas", "Estatus", "Fecha"];
    const filas = datosFiltrados.map(item => [
      item.placa || 'S/N', item.conductor, item.ruta, Number(item.tonelaje || 0).toFixed(2), item.estatus, item.fecha
    ]);

    autoTable(doc, { head: [columnas], body: filas, startY: 60, theme: 'grid', headStyles: { fillColor: [16, 185, 129] } });
    doc.save('Reporte_Flota_Rutas.pdf');
  };

  const verDetalles = (item: any) => {
    setFlotaSeleccionada(item);
    setModalAbierto(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 relative">
      
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Menú Principal
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Supervisión de Flota y Rutas</h1>
          <p className="text-sm text-zinc-500">Monitoreo de camiones, tonelajes y estatus logístico.</p>
        </div>
        
        <button onClick={generarReporteGeneral} disabled={cargando} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all disabled:opacity-50">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar Reporte General
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Tonelaje Total Procesado</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{totalTonelaje.toFixed(2)} Ton</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Viajes Registrados</p>
          <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">{totalViajes}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Unidades en Flota</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{unidadesActivas}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4 sm:flex-row sm:items-end w-full max-w-2xl">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="p-8 text-center text-zinc-500">Cargando base de datos de flota...</div>
          ) : datosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No se encontraron registros logísticos.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Placa</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Conductor</th>
                  <th className="px-6 py-4 font-semibold">Ruta</th>
                  <th className="px-6 py-4 font-semibold">Tonelaje (Ton)</th>
                  <th className="px-6 py-4 font-semibold">Estatus</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {datosFiltrados.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold font-mono text-zinc-900 dark:text-zinc-100 uppercase">{item.placa || 'S/N'}</td>
                    <td className="px-6 py-4">{item.fecha}</td>
                    <td className="px-6 py-4">{item.conductor}</td>
                    <td className="px-6 py-4">{item.ruta}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{Number(item.tonelaje || 0).toFixed(2)} Ton</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold
                        ${item.estatus === 'Completado' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${item.estatus === 'En Ruta' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.estatus === 'Incidencia' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {item.estatus || 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => verDetalles(item)}
                          title="Ver Detalles"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-blue-100 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalAbierto && flotaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Detalles del Viaje / Flota
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-emerald-200 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase">Conductor</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{flotaSeleccionada.conductor}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Placa</p>
                  <p className="text-lg font-bold text-emerald-600 font-mono uppercase">{flotaSeleccionada.placa || 'S/N'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">FECHA</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{flotaSeleccionada.fecha}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">RUTA ASIGNADA</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{flotaSeleccionada.ruta}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">ESTATUS</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold
                    ${flotaSeleccionada.estatus === 'Completado' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${flotaSeleccionada.estatus === 'En Ruta' ? 'bg-blue-100 text-blue-800' : ''}
                    ${flotaSeleccionada.estatus === 'Incidencia' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {flotaSeleccionada.estatus}
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">TONELAJE</p>
                  <p className="text-sm font-semibold text-emerald-600">{Number(flotaSeleccionada.tonelaje || 0).toFixed(2)} Ton</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="px-6 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}