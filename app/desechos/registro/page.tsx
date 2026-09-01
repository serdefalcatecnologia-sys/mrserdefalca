"use client";

import { useState, useTransition } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegistroDesechos() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [placa, setPlaca] = useState("");
  const [tipoDesecho, setTipoDesecho] = useState("Sólidos Urbanos");
  const [peso, setPeso] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleGuardarPesaje = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        // NOTA: Ajusta 'registro_desechos' al nombre real de tu tabla
        const { error } = await supabase.from("registro_desechos").insert([
          { placa_vehiculo: placa, tipo_desecho: tipoDesecho, peso_kg: parseFloat(peso), observaciones },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Pesaje y recepción registrados con éxito.", tipo: "exito" });
        setPlaca(""); setPeso(""); setObservaciones(""); setTipoDesecho("Sólidos Urbanos");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + err.message, tipo: "error" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-800">SERDEFALCA | Control de Desechos</h1>
          <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="text-sm font-semibold text-red-600 hover:underline">
            Cerrar Sesión
          </button>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-800">Registro de Pesaje y Recepción</h2>
          <p className="mt-1 text-xs text-zinc-500">Ingresa los datos de los desechos recibidos en planta.</p>

          <form onSubmit={handleGuardarPesaje} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Placa del Vehículo Recolector *</label>
                <input type="text" required value={placa} onChange={(e) => setPlaca(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Tipo de Desecho *</label>
                <select value={tipoDesecho} onChange={(e) => setTipoDesecho(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="Sólidos Urbanos">Sólidos Urbanos</option>
                  <option value="Orgánicos">Orgánicos</option>
                  <option value="Plástico/Reciclable">Plástico / Reciclable</option>
                  <option value="Peligrosos">Peligrosos / Biológicos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Peso Total (Kg) *</label>
                <input type="number" step="0.1" required value={peso} onChange={(e) => setPeso(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Observaciones (Opcional)</label>
                <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
            </div>

            {mensaje.texto && (
              <div className={`rounded-lg p-3 text-center text-xs font-medium ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {mensaje.texto}
              </div>
            )}

            <button type="submit" disabled={isPending} className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-400">
              {isPending ? 'Guardando...' : 'Registrar Ingreso de Desechos'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}