"use client";

import { useState, useTransition } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegistroComercial() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Estados del formulario
  const [cliente, setCliente] = useState("");
  const [cedulaRif, setCedulaRif] = useState("");
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState("Pagado");

  const handleGuardarFactura = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        // NOTA: Ajusta 'facturas' al nombre real de tu tabla
        const { error } = await supabase.from("facturas").insert([
          {
            cliente,
            cedula_rif: cedulaRif,
            monto: parseFloat(monto),
            estado,
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Factura registrada con éxito.", tipo: "exito" });
        setCliente("");
        setCedulaRif("");
        setMonto("");
        setEstado("Pagado");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + err.message, tipo: "error" });
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-800">SERDEFALCA | Módulo Comercial</h1>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:underline">
            Cerrar Sesión
          </button>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-800">Registro de Nueva Facturación</h2>
          <p className="mt-1 text-xs text-zinc-500">Ingresa los datos del pago o facturación del cliente.</p>

          <form onSubmit={handleGuardarFactura} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Nombre del Cliente / Entidad *</label>
                <input type="text" required value={cliente} onChange={(e) => setCliente(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Cédula o RIF *</label>
                <input type="text" required value={cedulaRif} onChange={(e) => setCedulaRif(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Monto (USD) *</label>
                <input type="number" step="0.01" required value={monto} onChange={(e) => setMonto(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Estado del Pago *</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>

            {mensaje.texto && (
              <div className={`rounded-lg p-3 text-center text-xs font-medium ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {mensaje.texto}
              </div>
            )}

            <button type="submit" disabled={isPending} className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-400">
              {isPending ? 'Guardando...' : 'Registrar Factura'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}