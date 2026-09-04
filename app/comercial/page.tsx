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

  // Cálculo automático
  const montoBsCalculado = (parseFloat(montoUsd || "0") * parseFloat(tasaBcv || "0")).toFixed(2);

  const handleGuardarFactura = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const usd = parseFloat(montoUsd) || 0;
        const bcv = parseFloat(tasaBcv) || 0;
        const bs = usd * bcv;

        const { error } = await supabase.from("registro_comercial").insert([
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
            responsable: usuarioNombre
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Registro comercial guardado exitosamente.", tipo: "exito" });
        
        // Limpiar campos, pero mantener la tasa BCV por comodidad
        setCliente("");
        setRif("");
        setMontoUsd("");
        setEstatusPago("Pagado");
        
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
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

                {/* Este campo es visual y de solo lectura */}
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
                  className={`p-3.5 rounded-lg text-sm font-bold text-center shadow-sm ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {mensaje.texto}
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