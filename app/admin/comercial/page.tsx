"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VistaComercializacion() {
  const [datosComerciales, setDatosComerciales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [esAdmin, setEsAdmin] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          const { data: perfil } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id_usuario', authData.session.user.id)
            .single();

          const r = perfil?.rol?.toLowerCase().trim();
          if (r === 'comercial' || r === 'flota' || r === 'desechos') {
            setEsAdmin(false);
          }
        }

        // Se corrige la consulta para apuntar a registro_comercial
        const { data, error } = await supabase
          .from('registro_comercial') 
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

  const datosFiltrados = datosComerciales.filter(item => {
    const cumpleFechaInicio = fechaInicio === '' || item.fecha >= fechaInicio;
    const cumpleFechaFin = fechaFin === '' || item.fecha <= fechaFin;
    return cumpleFechaInicio && cumpleFechaFin;
  });

  const totalRecaudado = datosFiltrados
    .filter(item => item.estatus_pago === 'Pagado')
    .reduce((acc, curr) => acc + Number(curr.monto_bs || 0), 0);
  
  const totalFacturas = datosFiltrados.length;
  const facturasEnMora = datosFiltrados.filter(item => item.estatus_pago === 'Pendiente').length;
  const indiceMorosidad = totalFacturas > 0 ? ((facturasEnMora / totalFacturas) * 100).toFixed(1) : "0.0";

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
    doc.text('Reporte de Comercialización y Recaudación', 14, 48);

    if (fechaInicio || fechaFin) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rango de fechas | Desde: ${fechaInicio || 'Inicio'} Hasta: ${fechaFin || 'Hoy'}`, 14, 54);
    }

    const columnas = ["Ref", "Cliente", "Servicio", "Monto (Bs)", "Estatus", "Fecha"];
    const filas = datosFiltrados.map(item => [
      item.id.substring(0, 8).toUpperCase(), 
      item.cliente, 
      item.tipo_servicio, 
      Number(item.monto_bs || 0).toFixed(2), 
      item.estatus_pago, 
      item.fecha
    ]);

    autoTable(doc, { head: [columnas], body: filas, startY: 60, theme: 'grid', headStyles: { fillColor: [16, 185, 129] } });
    doc.save('Reporte_Comercializacion.pdf');
  };

  const verDetalles = (factura: any) => {
    setFacturaSeleccionada(factura);
    setModalAbierto(true);
  };

  const reimprimirFactura = async (factura: any) => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      const numRef = factura.id.substring(0, 8).toUpperCase();
      
      const img = new Image();
      img.src = '/logo1.png';
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'PNG', 15, 10, 180, 25);
      } else {
        doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(4, 120, 87); doc.text("SISTEMA", 105, 20, { align: "center" });
      }

      doc.setFillColor(245, 245, 245); 
      doc.rect(15, 40, 180, 35, 'F');
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0, 0, 0); doc.text("DATOS DE LA ENTIDAD", 20, 47);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text("Nombre: Gestión de Desechos Sólidos", 20, 53);
      doc.text("RIF: G-20000000-0", 20, 59);
      doc.text("Teléfono: 0268-0000000", 20, 65);
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(4, 120, 87);
      doc.text(`Recibo / Ref N°: ${numRef}`, 115, 53);
      doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0); doc.setFontSize(10);
      doc.text(`Fecha: ${factura.fecha}`, 115, 60);

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("DATOS DEL CLIENTE", 20, 90);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`Razón Social: ${factura.cliente}`, 20, 98);
      doc.text(`Cédula / RIF: ${factura.rif_cedula || 'No registrado'}`, 20, 104);

      doc.setDrawColor(220, 220, 220); doc.line(15, 112, 195, 112);

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("DETALLES DE LA OPERACIÓN", 20, 122);
      doc.setFont("helvetica", "normal");
      doc.text(`Servicio: ${factura.tipo_servicio}`, 20, 130);
      doc.text(`Estatus del Pago: ${factura.estatus_pago}`, 20, 136);
      
      doc.setFillColor(236, 253, 245); doc.rect(15, 145, 180, 20, 'F');
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(4, 120, 87);
      doc.text(`Monto Total: Bs. ${Number(factura.monto_bs || 0).toFixed(2)}`, 20, 158);
      
      doc.setFontSize(10); doc.text("¡Gracias por su contribución para un estado más limpio!", 105, 190, { align: "center" });

      doc.save(`Recibo_${numRef}_${factura.cliente}.pdf`);
    } catch (error) {
      console.error("Error al reimprimir:", error);
      alert("Hubo un error al generar la factura.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 relative">
      
      {esAdmin && (
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al Menú Principal
          </Link>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Panel de Comercialización</h1>
          <p className="text-sm text-zinc-500">Gestión de recaudación, facturación y clientes.</p>
        </div>
        
        <button onClick={generarReporteGeneral} disabled={cargando} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all disabled:opacity-50">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar Reporte General
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Total Recaudado (Bs)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">Bs. {totalRecaudado.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Registros Procesados</p>
          <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">{totalFacturas}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500">Índice de Morosidad</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{indiceMorosidad}%</p>
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
            <div className="p-8 text-center text-zinc-500">Cargando base de datos comercial...</div>
          ) : datosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No se encontraron registros en la base de datos.</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Referencia</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Cliente / Entidad</th>
                  <th className="px-6 py-4 font-semibold">Monto (Bs)</th>
                  <th className="px-6 py-4 font-semibold">Estatus</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {datosFiltrados.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{item.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">{item.fecha}</td>
                    <td className="px-6 py-4">{item.cliente}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">Bs. {Number(item.monto_bs || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold
                        ${item.estatus_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${item.estatus_pago === 'Pendiente' ? 'bg-amber-100 text-amber-800' : ''}
                        ${item.estatus_pago === 'Exonerado' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {item.estatus_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => verDetalles(item)}
                          title="Ver Detalles"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-blue-100 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button 
                          onClick={() => reimprimirFactura(item)}
                          disabled={generandoPDF}
                          title="Imprimir Factura Original"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-emerald-100 hover:text-emerald-600 dark:bg-zinc-800 dark:text-zinc-400 transition-colors disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
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

      {modalAbierto && facturaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Detalles del Recibo
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-emerald-200 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase">Cliente</p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{facturaSeleccionada.cliente}</p>
                  <p className="text-sm text-zinc-500">{facturaSeleccionada.rif_cedula}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Referencia</p>
                  <p className="text-lg font-bold text-emerald-600">{facturaSeleccionada.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">FECHA DE OPERACIÓN</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{facturaSeleccionada.fecha}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                  <p className="text-xs font-bold text-zinc-500 mb-1">TIPO DE SERVICIO</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{facturaSeleccionada.tipo_servicio}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700/50 col-span-2">
                  <p className="text-xs font-bold text-zinc-500 mb-1">ESTATUS DEL COBRO</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold
                    ${facturaSeleccionada.estatus_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${facturaSeleccionada.estatus_pago === 'Pendiente' ? 'bg-amber-100 text-amber-800' : ''}
                    ${facturaSeleccionada.estatus_pago === 'Exonerado' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {facturaSeleccionada.estatus_pago}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Monto Total</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Bs. {Number(facturaSeleccionada.monto_bs || 0).toFixed(2)}</p>
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