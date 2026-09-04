"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ComercialPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const [usuarioNombre, setUsuarioNombre] = useState("Cargando...");
  const [usuarioIniciales, setUsuarioIniciales] = useState("--");

  // Estados del formulario
  const [cliente, setCliente] = useState("");
  const [rif, setRif] = useState("");
  const [municipio, setMunicipio] = useState("Miranda");
  const [tipoServicio, setTipoServicio] = useState("Recolección Comercial");
  const [montoUsd, setMontoUsd] = useState("");
  const [tasaBcv, setTasaBcv] = useState("");
  const [metodoPago, setMetodoPago] = useState("Transferencia");
  const [estatusPago, setEstatusPago] = useState("Pagado");

  // Estado para guardar la factura recién creada y poder imprimirla
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const obtenerUsuario = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        startTransition(() => router.push("/"));
        return;
      }
      const email = session.user.email || "";
      const nombre = email.split("@")[0].toUpperCase();
      setUsuarioNombre(nombre);
      setUsuarioIniciales(nombre.substring(0, 2));
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    }
  }, [router]);

  useEffect(() => {
    obtenerUsuario();
  }, [obtenerUsuario]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    startTransition(() => router.push("/"));
  };

  const montoBsCalculado = (parseFloat(montoUsd || "0") * parseFloat(tasaBcv || "0")).toFixed(2);

  const handleGuardarFactura = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });
    setUltimaFactura(null);

    startTransition(async () => {
      try {
        const usd = parseFloat(montoUsd) || 0;
        const bcv = parseFloat(tasaBcv) || 0;
        const bs = usd * bcv;

        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaActual = `${año}-${mes}-${dia}`;

        // Hacemos el INSERT y pedimos que nos devuelva los datos guardados (.select().single())
        const { data, error } = await supabase.from("registro_comercial").insert([
          {
            cliente: cliente,
            rif_cedula: rif,
            municipio: municipio,
            tipo_servicio: tipoServicio,
            monto_usd: usd,
            tasa_bcv: bcv,
            monto_bs: bs,
            metodo_pago: metodoPago,
            estatus_pago: estatusPago,
            responsable: usuarioNombre,
            fecha: fechaActual
          },
        ]).select().single();

        if (error) throw error;

        // Guardamos los datos de la factura recién creada para habilitar el botón de impresión
        setUltimaFactura(data);
        setMensaje({ texto: "✅ Registro guardado exitosamente. Puede imprimir el comprobante.", tipo: "exito" });
        
        // Limpiamos los campos visuales para el siguiente cliente (pero mantenemos tasaBcv por comodidad)
        setCliente("");
        setRif("");
        setMontoUsd("");
        setEstatusPago("Pagado");
        
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 8000);
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  // Función idéntica a la del Administrador para generar el PDF de la factura
  const imprimirComprobante = async () => {
    if (!ultimaFactura) return;
    setGenerandoPDF(true);
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      const numRef = ultimaFactura.id.substring(0, 8).toUpperCase();
      
      const img = new Image();
      img.src = '/logo1.png';
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'PNG', 15, 10, 180, 25);
      } else {
        doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(4, 120, 87); doc.text("SERDEFALCA", 105, 20, { align: "center" });
      }

      doc.setFillColor(245, 245, 245); 
      doc.rect(15, 40, 180, 35, 'F');
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0, 0, 0); doc.text("DATOS DE LA EMPRESA", 20, 47);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text("Razón Social: SERDEFAL C.A", 20, 53);
      doc.text("Dirección: Estado Falcón", 20, 59);
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(4, 120, 87);
      doc.text(`Factura N°: ${numRef}`, 115, 53);
      doc.setFont("helvetica", "normal"); doc.setTextColor(0, 0, 0); doc.setFontSize(10);
      doc.text(`Fecha: ${ultimaFactura.fecha}`, 115, 60);

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("DATOS DEL CLIENTE", 20, 90);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`Razón Social / Nombre: ${ultimaFactura.cliente}`, 20, 98);
      doc.text(`Cédula / RIF: ${ultimaFactura.rif_cedula}`, 20, 104);
      doc.text(`Municipio: ${ultimaFactura.municipio}`, 20, 110);

      doc.setDrawColor(220, 220, 220); doc.line(15, 116, 195, 116);

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("DETALLES DEL SERVICIO", 20, 128);
      doc.setFont("helvetica", "normal");
      doc.text(`Descripción: ${ultimaFactura.tipo_servicio}`, 20, 136);
      doc.text(`Método de Pago: ${ultimaFactura.metodo_pago || 'No especificado'}`, 20, 142);
      doc.text(`Estatus: ${ultimaFactura.estatus_pago}`, 20, 148);
      
      doc.setFillColor(236, 253, 245); doc.rect(15, 155, 180, 30, 'F');
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(4, 120, 87);
      doc.text(`Total en Divisas: $ ${Number(ultimaFactura.monto_usd || 0).toFixed(2)}`, 20, 167);
      doc.text(`Total en Bolívares: Bs. ${Number(ultimaFactura.monto_bs || 0).toFixed(2)}`, 20, 178);
      
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
      doc.text(`Tasa BCV Aplicada: 1 USD = Bs. ${Number(ultimaFactura.tasa_bcv || 0).toFixed(4)}`, 115, 178);

      doc.setFontSize(10); doc.text("¡Gracias por su contribución para un estado más limpio!", 105, 210, { align: "center" });

      doc.save(`Comprobante_${numRef}.pdf`);
    } catch (error) {
      console.error("Error al imprimir comprobante:", error);
      alert("Hubo un error al generar la factura PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 hidden md:flex">
        <div>
          <div className="py-4 px-2 border-b border-emerald-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-emerald-300 font-medium">Gestión Comercial</p>
          </div>
          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-800 text-white shadow-inner">
              <span className="text-lg">💼</span>
              <span>Facturación y Cobranza</span>
            </div>
          </nav>
        </div>
        <button
          onClick={handleCerrarSesion}
          className="flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-100 px-3 py-2 rounded-lg hover:bg-emerald-900 transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-emerald-900 text-white px-6 md:px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-base md:text-lg font-bold tracking-wide">Módulo Comercial</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Analista Comercial</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300 shrink-0">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 w-full max-w-4xl mx-auto overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-emerald-900">Registro de Cobranza</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ingrese los datos del cliente y los montos de la factura o pago.
              </p>
            </div>

            <form onSubmit={handleGuardarFactura} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Razón Social / Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Inversiones Los Médanos C.A."
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">RIF / Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: J-12345678-9"
                    value={rif}
                    onChange={(e) => setRif(e.target.value.toUpperCase())}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Municipio *</label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Miranda">Miranda</option>
                    <option value="Carirubana">Carirubana</option>
                    <option value="Colina">Colina</option>
                    <option value="Zamora">Zamora</option>
                    <option value="Falcón">Falcón</option>
                    <option value="Silva">Silva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tipo de Servicio *</label>
                  <select
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Recolección Comercial">Recolección Comercial</option>
                    <option value="Recolección Industrial">Recolección Industrial</option>
                    <option value="Servicio Especial">Servicio Especial (Escombros)</option>
                    <option value="Deuda Atrasada">Deuda Atrasada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tasa BCV (Día del pago) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="Ej: 36.50"
                    value={tasaBcv}
                    onChange={(e) => setTasaBcv(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Monto en Dólares (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej: 150.00"
                    value={montoUsd}
                    onChange={(e) => setMontoUsd(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-bold text-emerald-800"
                  />
                </div>

                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-2.5 md:p-3 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Monto Total Calculado</span>
                  <span className="text-lg font-black text-emerald-900">Bs. {montoBsCalculado}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Método de Pago *</label>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Divisas Efectivo">Divisas en Efectivo</option>
                    <option value="Punto de Venta">Punto de Venta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Estatus del Pago *</label>
                  <select
                    value={estatusPago}
                    onChange={(e) => setEstatusPago(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente (Facturado)</option>
                    <option value="Abono">Abono Parcial</option>
                  </select>
                </div>
              </div>

              {mensaje.texto && (
                <div
                  className={`p-3.5 rounded-lg text-sm font-bold text-center shadow-sm flex flex-col gap-3 items-center justify-center ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <p>{mensaje.texto}</p>
                  
                  {/* BOTÓN PARA IMPRIMIR COMPROBANTE - Solo se muestra cuando es exitoso */}
                  {mensaje.tipo === "exito" && ultimaFactura && (
                    <button
                      type="button"
                      onClick={imprimirComprobante}
                      disabled={generandoPDF}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-xs disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      {generandoPDF ? 'Generando PDF...' : 'Imprimir Comprobante Ahora'}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-colors disabled:bg-emerald-400 shadow-md mt-4 flex justify-center items-center gap-2"
              >
                {isPending ? "Procesando..." : "Guardar Registro Comercial"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}