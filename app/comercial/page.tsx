"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroComercial() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [rif, setRif] = useState("");
  const [municipio, setMunicipio] = useState("Miranda");
  const [servicio, setServicio] = useState("Recolección Especial");
  const [montoUsd, setMontoUsd] = useState("");
  const [tasaBcv, setTasaBcv] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [estatusPago, setEstatusPago] = useState("Pendiente");
  
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Conversión automática a Bolívares
  const montoBsCalculado = (parseFloat(montoUsd || "0") * parseFloat(tasaBcv || "0")).toFixed(2);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("Procesando registro...");

    const { error } = await supabase.from("registro_comercial").insert([
      {
        cliente: cliente,
        rif_cedula: rif,
        municipio: municipio,
        tipo_servicio: servicio,
        monto_usd: parseFloat(montoUsd),
        tasa_bcv: parseFloat(tasaBcv),
        monto_bs: parseFloat(montoBsCalculado),
        metodo_pago: metodoPago,
        estatus_pago: estatusPago,
      },
    ]);

    setCargando(false);

    if (error) {
      console.error(error);
      setMensaje("Error al guardar el registro comercial.");
    } else {
      setMensaje("¡Factura / Registro creado exitosamente!");
      // Limpiar formulario tras el registro exitoso
      setCliente(""); setRif(""); setMontoUsd(""); setMetodoPago("");
      
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      
      {/* Cabecera del Operador */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-emerald-700 tracking-wide">SERDEFALCA</h1>
          <p className="text-xs text-zinc-500 font-medium">Módulo Operativo - Comercialización</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
        >
          Cerrar Sesión
        </button>
      </header>

      {/* Contenedor del Formulario */}
      <main className="p-6">
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-2xl border border-zinc-100">
          <h2 className="text-2xl font-bold mb-2 text-emerald-800">Generar Factura / Servicio Comercial</h2>
          <p className="text-sm text-gray-500 mb-6">Complete los datos para emitir la orden de recolección y cobro.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente / Razón Social *</label>
                <input type="text" required value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre de la empresa o persona" className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cédula / RIF *</label>
                <input type="text" required value={rif} onChange={(e) => setRif(e.target.value)} placeholder="Ej: J-12345678-9" className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm uppercase outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Municipio *</label>
                <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white">
                  <option value="Miranda">Miranda</option>
                  <option value="Carirubana">Carirubana</option>
                  <option value="Colina">Colina</option>
                  <option value="Zamora">Zamora</option>
                  <option value="Falcón">Falcón</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Servicio *</label>
                <select value={servicio} onChange={(e) => setServicio(e.target.value)} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white">
                  <option value="Recolección Comercial">Recolección Comercial</option>
                  <option value="Recolección Especial">Recolección Especial</option>
                  <option value="Alquiler de Maquinaria">Alquiler de Maquinaria</option>
                  <option value="Disposición Final">Disposición Final</option>
                </select>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-1">Monto en Dólares ($) *</label>
                  <input type="number" step="0.01" required value={montoUsd} onChange={(e) => setMontoUsd(e.target.value)} placeholder="0.00" className="block w-full border border-emerald-200 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-1">Tasa BCV Actual *</label>
                  <input type="number" step="0.0001" required value={tasaBcv} onChange={(e) => setTasaBcv(e.target.value)} placeholder="Ej: 36.50" className="block w-full border border-emerald-200 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Total a Pagar (Bs)</label>
                  <div className="block w-full border border-gray-200 bg-gray-100 rounded-lg p-2.5 text-sm font-bold text-gray-700 h-[42px] flex items-center">
                    Bs. {montoBsCalculado}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Método de Pago</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none bg-white">
                  <option value="">Seleccione un método...</option>
                  <option value="Transferencia Bs">Transferencia Bs</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Divisas Efectivo">Divisas Efectivo</option>
                  <option value="Zelle / Binance">Zelle / Binance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estatus del Registro *</label>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input type="radio" value="Pendiente" checked={estatusPago === "Pendiente"} onChange={(e) => setEstatusPago(e.target.value)} className="text-amber-500 form-radio focus:ring-amber-500" />
                    <span className="ml-2 text-sm font-medium text-zinc-700">Pendiente</span>
                  </label>
                  <label className="inline-flex items-center bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                    <input type="radio" value="Pagado" checked={estatusPago === "Pagado"} onChange={(e) => setEstatusPago(e.target.value)} className="text-emerald-600 form-radio focus:ring-emerald-500" />
                    <span className="ml-2 text-sm font-medium text-zinc-700">Pagado</span>
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={cargando} className="w-full bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition-colors mt-6 shadow-md">
              {cargando ? "Registrando Factura..." : "Generar Factura Comercial"}
            </button>

            {mensaje && (
              <div className={`p-4 rounded-lg mt-4 text-center font-bold text-sm border ${mensaje.includes("Error") ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}