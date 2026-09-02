"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroComercial() {
  const [cliente, setCliente] = useState("");
  const [rif, setRif] = useState("");
  const [servicio, setServicio] = useState("Recolección Especial");
  const [monto, setMonto] = useState("");
  const [estatusPago, setEstatusPago] = useState("Pendiente");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("Procesando registro...");

    const { error } = await supabase.from("registro_comercial").insert([
      {
        cliente: cliente,
        rif_cedula: rif,
        tipo_servicio: servicio,
        monto_bs: monto ? parseFloat(monto) : 0,
        estatus_pago: estatusPago,
      },
    ]);

    setCargando(false);

    if (error) {
      console.error(error);
      setMensaje("Error al guardar el registro comercial.");
    } else {
      setMensaje("¡Registro comercial creado exitosamente!");
      setCliente(""); 
      setRif(""); 
      setMonto(""); 
      setEstatusPago("Pendiente");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Registro de Servicios Comerciales</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente / Empresa</label>
            <input type="text" required value={cliente} onChange={(e) => setCliente(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RIF / Cédula</label>
            <input type="text" required value={rif} onChange={(e) => setRif(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="J-12345678-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
            <select value={servicio} onChange={(e) => setServicio(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Recolección Especial">Recolección Especial</option>
              <option value="Alquiler de Maquinaria">Alquiler de Maquinaria</option>
              <option value="Disposición Final">Disposición Final</option>
              <option value="Asesoría Ambiental">Asesoría Ambiental</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto (Bs)</label>
            <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estatus de Pago</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input type="radio" value="Pendiente" checked={estatusPago === "Pendiente"} onChange={(e) => setEstatusPago(e.target.value)} className="text-blue-600 form-radio focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Pendiente</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="Pagado" checked={estatusPago === "Pagado"} onChange={(e) => setEstatusPago(e.target.value)} className="text-blue-600 form-radio focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Pagado</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="Exonerado" checked={estatusPago === "Exonerado"} onChange={(e) => setEstatusPago(e.target.value)} className="text-blue-600 form-radio focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-700">Exonerado</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={cargando} className="w-full bg-blue-800 text-white font-bold py-2 px-4 rounded hover:bg-blue-900 disabled:opacity-50 transition-colors mt-4">
          {cargando ? "Procesando..." : "Procesar Facturación / Servicio"}
        </button>

        {mensaje && (
          <p className={`mt-4 text-center font-medium ${mensaje.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}