"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PanelComercial() {
  const router = useRouter();

  // Estados base
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [tasaBcv, setTasaBcv] = useState<number>(0);
  const [cargandoTasa, setCargandoTasa] = useState(true);

  // Estados de la Factura (Manuales)
  const [numFactura, setNumFactura] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [municipio, setMunicipio] = useState('Miranda');
  const [estadoCobro, setEstadoCobro] = useState('Pagado');
  const [metodoPago, setMetodoPago] = useState('Transferencia Bs');
  const [montoUsd, setMontoUsd] = useState<string>('');
  const [montoBs, setMontoBs] = useState<string>('');

  // Estados del Buscador Autocompletado
  const [busquedaRif, setBusquedaRif] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  // Estados del Modal de Nuevo Cliente
  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoRif, setNuevoRif] = useState('');
  const [nuevaRazonSocial, setNuevaRazonSocial] = useState('');
  const [nuevoRepresentante, setNuevoRepresentante] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [guardandoCliente, setGuardandoCliente] = useState(false);

  const [guardandoFactura, setGuardandoFactura] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // 1. Inicialización
  useEffect(() => {
    const inicializarPanel = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }
      const { data: perfil } = await supabase.from('usuarios').select('*').eq('id_usuario', authData.session.user.id).single();
      if (perfil) setUsuario(perfil);

      try {
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const datos = await respuesta.json();
        if (datos && datos.promedio) setTasaBcv(datos.promedio);
      } catch (error) {
        console.error("Error tasa BCV:", error);
      } finally {
        setCargandoTasa(false);
        setCargando(false);
      }
    };
    inicializarPanel();
  }, [router]);

  // 2. Lógica del Buscador Autocompletado (Tipo Google)
  useEffect(() => {
    if (clienteSeleccionado && busquedaRif === clienteSeleccionado.razon_social) {
      setMostrarDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (busquedaRif.trim().length >= 3) {
        setBuscandoCliente(true);
        const { data } = await supabase
          .from('clientes')
          .select('*')
          .or(`cedula_rif.ilike.%${busquedaRif}%,razon_social.ilike.%${busquedaRif}%`)
          .limit(5); 

        setResultadosBusqueda(data || []);
        setMostrarDropdown(true);
        setBuscandoCliente(false);
      } else {
        setResultadosBusqueda([]);
        setMostrarDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaRif, clienteSeleccionado]);

  const seleccionarClienteDelDropdown = (cliente: any) => {
    setClienteSeleccionado(cliente);
    setBusquedaRif(cliente.razon_social); 
    setMostrarDropdown(false);
  };

  const abrirModalParaRegistrar = () => {
    setNuevoRif(busquedaRif.toUpperCase()); 
    setMostrarDropdown(false);
    setModalCliente(true);
  };

  // 3. Cálculos bidireccionales
  const manejarCambioUsd = (valor: string) => {
    setMontoUsd(valor);
    const usd = parseFloat(valor);
    if (!isNaN(usd) && tasaBcv > 0) setMontoBs((usd * tasaBcv).toFixed(2));
    else setMontoBs('');
  };

  const manejarCambioBs = (valor: string) => {
    setMontoBs(valor);
    const bs = parseFloat(valor);
    if (!isNaN(bs) && tasaBcv > 0) setMontoUsd((bs / tasaBcv).toFixed(2));
    else setMontoUsd('');
  };

  // 4. Registrar Cliente
  const registrarNuevoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoCliente(true);
    try {
      const { data, error } = await supabase.from('clientes').insert([{
          cedula_rif: nuevoRif, razon_social: nuevaRazonSocial, nombre_representante: nuevoRepresentante, telefono: nuevoTelefono, direccion: nuevaDireccion
      }]).select().single();
      
      if (error) throw error;
      
      alert("Cliente registrado exitosamente.");
      seleccionarClienteDelDropdown(data);
      cerrarModalCliente();
    } catch (error: any) {
      alert("Error al registrar cliente: " + error.message);
    } finally {
      setGuardandoCliente(false);
    }
  };

  const cerrarModalCliente = () => {
    setModalCliente(false);
    setNuevaRazonSocial(''); setNuevoRepresentante(''); setNuevoTelefono(''); setNuevaDireccion('');
  };

  // 5. Generar PDF (Ahora es asíncrono para cargar la imagen correctamente)
  const generarYDescargarPDF = async () => {
    const doc = new jsPDF();

    // -- A. CARGAR MEMBRETE (logo1.png) --
    const img = new Image();
    img.src = '/logo1.png';
    
    // Esperamos a que la imagen cargue en el navegador
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Si no la encuentra, que siga el proceso
    });

    // Si la imagen cargó bien, la pintamos como membrete
    if (img.complete && img.naturalWidth > 0) {
      // Ajusta x, y, ancho, alto según las proporciones de tu logo
      doc.addImage(img, 'PNG', 15, 10, 180, 25);
    } else {
      // Texto de respaldo si la imagen falla
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(4, 120, 87); 
      doc.text("SERDEFALCA", 105, 20, { align: "center" });
    }

    // -- B. TABLA DE DATOS DE LA EMPRESA --
    // Dibujamos un rectángulo de fondo gris claro para la cabecera
    doc.setFillColor(245, 245, 245); 
    doc.rect(15, 40, 180, 35, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("DATOS DE LA EMPRESA", 20, 47);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nombre: Servicio Regional de Gestión de Desechos Sólidos (SERDEFALCA)", 20, 53);
    doc.text("RIF: G-20000000-0 (Pendiente de Configuración)", 20, 59);
    doc.text("Teléfono: 0268-0000000", 20, 65);
    doc.text("Director / Gerente Actual: Por Asignar", 20, 71);

    // -----------------------------------------------------------------------
    // ✅ CAMBIO APLICADO AQUÍ: Número de Factura y Fecha a la derecha
    // -----------------------------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(4, 120, 87);
    // Subimos la Y a 47 (misma línea del título) y alineamos a la derecha (X=190)
    doc.text(`Factura / Recibo N°: ${numFactura}`, 190, 47, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    // Subimos la Y a 54 y alineamos a la derecha
    doc.text(`Fecha: ${fecha}`, 190, 54, { align: "right" });

    // -- C. DATOS DEL CLIENTE --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DATOS DEL CLIENTE", 20, 90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Razón Social: ${clienteSeleccionado.razon_social}`, 20, 98);
    doc.text(`Cédula / RIF: ${clienteSeleccionado.cedula_rif}`, 20, 104);
    doc.text(`Teléfono: ${clienteSeleccionado.telefono}`, 20, 110);
    doc.text(`Dirección: ${clienteSeleccionado.direccion}`, 20, 116);

    // Línea separadora
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 122, 195, 122);

    // -- D. DETALLES DE LA OPERACIÓN --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DETALLES DE LA OPERACIÓN", 20, 132);
    doc.setFont("helvetica", "normal");
    doc.text(`Servicio: Recolección de Desechos Sólidos - Municipio ${municipio}`, 20, 140);
    doc.text(`Método de Pago: ${metodoPago}`, 20, 146);
    doc.text(`Estado del Cobro: ${estadoCobro}`, 20, 152);
    
    // -- E. MONTOS Y TOTALES --
    doc.setFillColor(236, 253, 245); // Fondo verde muy clarito
    doc.rect(15, 160, 180, 25, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(4, 120, 87);
    doc.text(`Monto Total (Divisas): $ ${montoUsd}`, 20, 170);
    doc.text(`Monto Total (Bolívares): Bs. ${montoBs}`, 20, 178);
    
    // Tasa BCV al pie
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Tasa BCV Aplicada: 1 USD = Bs. ${tasaBcv}`, 20, 190);
    
    // Mensaje de agradecimiento centrado
    doc.setFontSize(10);
    doc.text("¡Gracias por su contribución para un estado más limpio!", 105, 210, { align: "center" });

    // Descarga del PDF
    doc.save(`Factura_SERDEFALCA_${numFactura}_${clienteSeleccionado.cedula_rif}.pdf`);
  };

  const abrirWhatsApp = () => {
    let phone = clienteSeleccionado.telefono.replace(/\D/g,'');
    if (phone.startsWith('0')) phone = '58' + phone.substring(1);
    else if (!phone.startsWith('58')) phone = '58' + phone;

    const mensajeWhatsApp = encodeURIComponent(`Hola ${clienteSeleccionado.razon_social}, le escribimos de SERDEFALCA. Hemos registrado su operación N° ${numFactura} por el monto de $${montoUsd} (Bs. ${montoBs}). Por aquí le adjuntamos su factura en formato PDF.`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${mensajeWhatsApp}`, '_blank');
  };

  // 6. Registrar Factura
  const registrarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      setMensaje({ tipo: 'error', texto: 'Debes buscar y seleccionar un cliente de la lista primero.' });
      return;
    }
    if (!numFactura.trim()) {
      setMensaje({ tipo: 'error', texto: 'El número de factura es obligatorio.' });
      return;
    }

    setGuardandoFactura(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.from('facturas').insert([{
          num_factura: numFactura,
          fecha_operacion: fecha,
          cliente: clienteSeleccionado.razon_social,
          municipio: municipio,
          estado_cobro: estadoCobro,
          metodo_pago: metodoPago,
          monto_usd: parseFloat(montoUsd),
          monto_bs: parseFloat(montoBs),
          tasa_bcv_aplicada: tasaBcv,
          registrado_por: usuario.id_usuario
      }]);

      if (error) throw error;

      setMensaje({ tipo: 'exito', texto: '¡Factura registrada con éxito! Generando PDF...' });
      
      // Como el PDF ahora carga imagen (asíncrono), ponemos un await
      await generarYDescargarPDF();
      abrirWhatsApp();

      setNumFactura(''); setMontoUsd(''); setMontoBs(''); setClienteSeleccionado(null); setBusquedaRif('');
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar factura: ' + error.message });
    } finally {
      setGuardandoFactura(false);
    }
  };

  const obtenerIniciales = (n = '', a = '') => `${n.charAt(0) || ''}${a.charAt(0) || ''}`.toUpperCase();
  const cerrarSesion = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (cargando) return <div className="flex h-screen items-center justify-center bg-zinc-100 font-bold text-emerald-600">Cargando Módulo Comercial...</div>;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 font-sans flex flex-col relative">
      
      {/* HEADER */}
      <header className="flex h-20 items-center justify-between bg-emerald-900 px-8 text-white shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide">SERDEFALCA | Comercial</h1>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-800/80 px-4 py-1.5 rounded-full border border-emerald-700">
            <span className="text-xs text-emerald-200">TASA BCV HOY:</span>
            {cargandoTasa ? <span className="text-sm font-bold animate-pulse">Cargando...</span> : <span className="text-sm font-bold text-emerald-50">Bs. {tasaBcv.toFixed(2)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold capitalize">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-xs text-emerald-300 capitalize">{usuario?.rol}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
            {usuario?.foto ? <img src={usuario.foto} alt="Perfil" className="h-full w-full object-cover" /> : obtenerIniciales(usuario?.nombre, usuario?.apellido)}
          </div>
          <button onClick={cerrarSesion} className="ml-2 text-emerald-200 hover:text-white transition-colors" title="Cerrar Sesión">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-4">
          
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Facturación y Cobranza</h2>
            <p className="text-sm text-zinc-500 mt-1">Busca al cliente y registra la operación en el sistema.</p>
          </div>

          <form onSubmit={registrarFactura} className="p-6 space-y-6">
            
            {mensaje.texto && (
              <div className={`p-4 rounded-lg text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {mensaje.texto}
              </div>
            )}

            {/* BUSCADOR AUTOCOMPLETADO DE CLIENTES */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <label className="block text-sm font-bold text-blue-800 dark:text-blue-400 mb-2">1. Buscar Cliente (Cédula, RIF o Nombre)</label>
              
              <div className="relative">
                <input 
                  type="text" 
                  value={busquedaRif} 
                  onChange={(e) => {
                    setBusquedaRif(e.target.value);
                    if (clienteSeleccionado) setClienteSeleccionado(null); 
                  }} 
                  placeholder="Ej. Juan Pérez o 25925548..." 
                  className="w-full rounded-lg border border-zinc-300 p-3 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" 
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                
                {buscandoCliente && (
                  <div className="absolute right-3 top-3 text-xs text-blue-600 font-bold animate-pulse">Buscando...</div>
                )}

                {/* MENÚ DESPLEGABLE TIPO GOOGLE */}
                {mostrarDropdown && (
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                    {resultadosBusqueda.length > 0 ? (
                      resultadosBusqueda.map((cliente) => (
                        <li 
                          key={cliente.cedula_rif} 
                          onClick={() => seleccionarClienteDelDropdown(cliente)}
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-zinc-100 dark:border-zinc-700 last:border-0 transition-colors"
                        >
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{cliente.razon_social}</p>
                          <p className="text-xs text-zinc-500">RIF: {cliente.cedula_rif}</p>
                        </li>
                      ))
                    ) : (
                      <li 
                        onClick={abrirModalParaRegistrar}
                        className="px-4 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-2"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        "{busquedaRif}" no existe. Clic aquí para registrarlo.
                      </li>
                    )}
                  </ul>
                )}
              </div>
              
              {/* Confirmación Visual del Cliente Seleccionado */}
              {clienteSeleccionado && (
                <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-emerald-300 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {clienteSeleccionado.razon_social}
                    </p>
                    <p className="text-xs text-zinc-500">RIF: {clienteSeleccionado.cedula_rif} | Tel: {clienteSeleccionado.telefono}</p>
                  </div>
                </div>
              )}
            </div>

            {/* DATOS DE LA FACTURA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="md:col-span-2"><h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">2. Datos de la Operación</h3></div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">N° Factura / Recibo <span className="text-red-500">* (Manual Obligatorio)</span></label>
                <input required type="text" value={numFactura} onChange={(e) => setNumFactura(e.target.value)} placeholder="Ej. FAC-1005" className="w-full rounded-lg border border-emerald-400 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-800 dark:text-white font-medium" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fecha de Operación *</label>
                <input required type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Municipio *</label>
                <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="Acosta">Acosta</option>
                  <option value="Bolívar">Bolívar</option>
                  <option value="Buchivacoa">Buchivacoa</option>
                  <option value="Cacique Manaure">Cacique Manaure</option>
                  <option value="Carirubana">Carirubana</option>
                  <option value="Colina">Colina</option>
                  <option value="Dabajuro">Dabajuro</option>
                  <option value="Democracia">Democracia</option>
                  <option value="Falcón">Falcón</option>
                  <option value="Federación">Federación</option>
                  <option value="Jacura">Jacura</option>
                  <option value="Los Taques">Los Taques</option>
                  <option value="Mauroa">Mauroa</option>
                  <option value="Miranda">Miranda</option>
                  <option value="Monseñor Iturriza">Monseñor Iturriza</option>
                  <option value="Palmasola">Palmasola</option>
                  <option value="Petit">Petit</option>
                  <option value="Píritu">Píritu</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Silva">Silva</option>
                  <option value="Sucre">Sucre</option>
                  <option value="Tocópero">Tocópero</option>
                  <option value="Unión">Unión</option>
                  <option value="Urumaco">Urumaco</option>
                  <option value="Zamora">Zamora</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Método de Pago *</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="Efectivo Bs">Efectivo Bolívares</option>
                  <option value="Efectivo Divisas">Efectivo Divisas ($)</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Transferencia Bs">Transferencia Bs</option>
                  <option value="Punto de Venta">Punto de Venta (Tarjeta)</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Binance">Binance</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado del Cobro *</label>
                <select value={estadoCobro} onChange={(e) => setEstadoCobro(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              {/* CALCULADORA BIDIRECCIONAL */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mt-2">
                <div>
                  <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">Monto (USD $) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                    <input required type="number" step="0.01" value={montoUsd} onChange={(e) => manejarCambioUsd(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-zinc-300 p-2.5 pl-8 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-1">Equivalente (Bs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500">Bs</span>
                    <input required type="number" step="0.01" value={montoBs} onChange={(e) => manejarCambioBs(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-zinc-300 p-2.5 pl-9 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-medium bg-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-zinc-200 dark:border-zinc-800 mt-6">
              <button type="submit" disabled={guardandoFactura || tasaBcv === 0 || !clienteSeleccionado} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50">
                {guardandoFactura ? 'Procesando...' : 'Facturar y Enviar PDF'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* MODAL DE REGISTRO DE NUEVO CLIENTE (Igual) */}
      {modalCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Registrar Nuevo Cliente</h3>
              <button onClick={cerrarModalCliente} className="text-blue-200 hover:text-white"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={registrarNuevoCliente} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Cédula o RIF *</label>
                <input required type="text" value={nuevoRif} onChange={(e) => setNuevoRif(e.target.value)} className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm uppercase outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nombre o Razón Social *</label>
                <input required type="text" value={nuevaRazonSocial} onChange={(e) => setNuevaRazonSocial(e.target.value)} placeholder="Ej. Inversiones El Sol C.A. o Juan Pérez" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nombres Apellidos (Rep.)</label>
                  <input type="text" value={nuevoRepresentante} onChange={(e) => setNuevoRepresentante(e.target.value)} placeholder="Opcional" className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Teléfono *</label>
                  <input required type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} placeholder="0414..." className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Dirección Fiscal / Local *</label>
                <textarea required rows={2} value={nuevaDireccion} onChange={(e) => setNuevaDireccion(e.target.value)} placeholder="Calle, Av, Sector..." className="w-full rounded-lg border border-zinc-300 p-2.5 text-sm outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:border-blue-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button type="button" onClick={cerrarModalCliente} className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg">Cancelar</button>
                <button type="submit" disabled={guardandoCliente} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                  {guardandoCliente ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}