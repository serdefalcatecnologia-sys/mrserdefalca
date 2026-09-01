"use client";

import { useState, useEffect, useTransition } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ComercialPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Datos del usuario logueado
  const [usuarioNombre, setUsuarioNombre] = useState("Cargando...");
  const [usuarioIniciales, setUsuarioIniciales] = useState("--");

  // Formulario de Comercialización
  const [numFactura, setNumFactura] = useState("");
  const [cliente, setCliente] = useState("");
  const [cedulaRif, setCedulaRif] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [estado, setEstado] = useState("Pagado");
  const [concepto, setConcepto] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const email = session.user.email || "";
    const nombre = email.split("@")[0].toUpperCase();
    setUsuarioNombre(nombre);
    setUsuarioIniciales(nombre.substring(0, 2));
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGuardarFactura = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const { error } = await supabase.from("facturas").insert([
          {
            num_factura: numFactura || `FES-${Math.floor(10000 + Math.random() * 90000)}`,
            cliente,
            cedula_rif: cedulaRif,
            monto: parseFloat(monto),
            fecha,
            estado,
            concepto,
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Factura registrada exitosamente en el sistema.", tipo: "exito" });
        setNumFactura("");
        setCliente("");
        setCedulaRif("");
        setMonto("");
        setConcepto("");
        setEstado("Pagado");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al guardar factura: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      {/* Sidebar Lateral Estilo SERDEFALCA */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="py-4 px-2 border-b border-emerald-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-emerald-300 font-medium">Gestión Integral de Desechos</p>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-800 text-white shadow-inner">
              <span className="text-lg">📝</span>
              <span>Registro de Facturación</span>
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

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-emerald-900 text-white px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-lg font-bold tracking-wide">SERDEFALCA | Módulo Comercial</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Operador Comercial</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        {/* Área del Formulario */}
        <section className="p-8 max-w-4xl w-full mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-emerald-900">Registro de Factura y Recaudación</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ingresa los datos para registrar un cobro o factura en el sistema comercial.
              </p>
            </div>

            <form onSubmit={handleGuardarFactura} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">N° de Factura / Control</label>
                  <input
                    type="text"
                    placeholder="Ej: FES-61427 (Opcional)"
                    value={numFactura}
                    onChange={(e) => setNumFactura(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Cédula / RIF del Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: J-12345678-0"
                    value={cedulaRif}
                    onChange={(e) => setCedulaRif(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Cliente o Razon Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Comercial Falcón C.A."
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Monto Total (USD $) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Fecha de Emisión *</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Estado de Pago *</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Concepto / Servicio</label>
                  <input
                    type="text"
                    placeholder="Ej: Tarifas de recolección comercial"
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {mensaje.texto && (
                <div
                  className={`p-3.5 rounded-lg text-xs font-semibold text-center ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 shadow-md"
              >
                {isPending ? "Guardando Factura..." : "Registrar Factura"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}