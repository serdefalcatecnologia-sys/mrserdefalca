"use client";

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Corrección: Importado como función principal
import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase usando las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VistaComercializacion() {
  const [datosComerciales, setDatosComerciales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros (Solo fechas)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // 1. CARGAR DATOS DESDE SUPABASE AL ABRIR LA PÁGINA
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data, error } = await supabase
          .from('facturas') 
          .select('*')
          .order('fecha', { ascending: false });

        if (error) {
          console.error("Error obteniendo datos de Supabase:", error);
        } else {
          setDatosComerciales(data || []);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 2. APLICAR FILTRO DE FECHAS EN TIEMPO REAL
  const datosFiltrados = datosComerciales.filter(item => {
    const cumpleFechaInicio = fechaInicio === '' || item.fecha >= fechaInicio;
    const cumpleFechaFin = fechaFin === '' || item.fecha <= fechaFin;
    return cumpleFechaInicio && cumpleFechaFin;
  });

  // 3. CÁLCULO DE ESTADÍSTICAS BASADO EN DATOS REALES
  const totalRecaudado = datosFiltrados
    .filter(item => item.estado === 'Pagado')
    .reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
  
  const totalFacturas = datosFiltrados.length;
  
  const facturasEnMora = datosFiltrados.filter(item => item.estado === 'Mora').length;
  const indiceMorosidad = totalFacturas > 0 ? ((facturasEnMora / totalFacturas) * 100).toFixed(1) : "0.0";

  // 4. GENERAR PDF CON MEMBRETE COMPLETO (CORREGIDO)
  const generarPDF = () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos para exportar con estos filtros.");
      return;
    }

    const doc = new jsPDF();
    
    // Agregar el membrete de esquina a esquina (x=0, y=0, ancho=210mm, alto=35mm)
    const img = new Image();
    img.src = '/logo1.png';
    doc.addImage(img, 'PNG', 0, 0, 210, 35);

    // Título del reporte
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Reporte de Comercialización y Recaudación', 14, 48);

    // Fechas de filtro si existen
    if (fechaInicio || fechaFin) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rango de fechas | Desde: ${fechaInicio || 'Inicio'} Hasta: ${fechaFin || 'Hoy'}`, 14, 54);
    }

    // Configurar tabla
    const columnas = ["N° Factura", "Cliente", "Municipio", "Monto ($)", "Estado", "Fecha"];
    const filas = datosFiltrados.map(item => [
      item.id,
      item.cliente,
      item.municipio,
      Number(item.monto || 0).toFixed(2),
      item.estado,
      item.fecha
    ]);

    // Generar la tabla llamando a la función autoTable e inyectándole el 'doc'
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }, // Verde Esmeralda SERDEFALCA
    });

    doc.save('Reporte_Comercializacion_SERDEFALCA.pdf');
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Panel de Comercialización</h1>
          <p className="text-sm text-zinc-500">Gestión de recaudación, facturación y clientes.</p>
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
          <p className="text-sm font-medium text-zinc-500">Total Recaudado (Rango Seleccionado)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${totalRecaudado.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Facturas Registradas</p>
          <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">{totalFacturas}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Índice de Morosidad</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{indiceMorosidad}%</p>
        </div>
      </div>

      {/* BARRA DE FILTROS (Solo fechas) */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col gap-4 sm:flex-row sm:items-end w-full max-w-2xl">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" 
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
            className="w-full rounded-lg border border-zinc-300 p-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-500 focus:outline-none" 
          />
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="p-8 text-center text-zinc-500">Cargando base de datos comercial...</div>
          ) : datosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No se encontraron registros en la base de datos.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">N° Factura</th>
                  <th className="px-6 py-4 font-semibold">Cliente / Entidad</th>
                  <th className="px-6 py-4 font-semibold">Municipio</th>
                  <th className="px-6 py-4 font-semibold">Monto</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {datosFiltrados.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.id || `FAC-${index}`}</td>
                    <td className="px-6 py-4">{item.cliente}</td>
                    <td className="px-6 py-4">{item.municipio}</td>
                    <td className="px-6 py-4 font-semibold">${Number(item.monto || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${item.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${item.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : ''}
                        ${item.estado === 'Mora' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {item.estado || 'No definido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        title="Ver Detalles"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400 transition-colors"
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

    </div>
  );
}