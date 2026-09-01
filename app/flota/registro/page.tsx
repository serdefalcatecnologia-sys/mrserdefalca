"use client";

import { useState, useTransition } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegistroFlota() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [vehiculo, setVehiculo] = useState("");
  const [chofer, setChofer] = useState("");
  const [ruta, setRuta] = useState("");
  const [turno, setTurno] = useState("Mañana");

  const handleGuardarRuta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        // NOTA: Ajusta 'rutas_flota' al nombre real de tu tabla
        const { error } = await supabase.from("rutas_flota").insert([
          { vehiculo, chofer, ruta, turno },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Asignación de ruta registrada con éxito.", tipo: "exito" });
        setVehiculo(""); setChofer(""); setRuta(""); setTurno("Mañana");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + err.message, tipo: "error" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-800">SERDEFALCA | Módulo de Flota</h1>
          <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="text-sm font-semibold text-red-600 hover:underline">
            Cerrar Sesión
          </button>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-800">Control y Asignación de Rutas</h2>
          <p className="mt-1 text-xs text-zinc-500">Registra la salida de los vehículos y la ruta asignada.</p>

          <form onSubmit={handleGuardarRuta} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Placa o ID del Vehículo *</label>
                <input type="text" required value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Nombre del Chofer *</label>
                <input type="text" required value={chofer} onChange={(e) => setChofer(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Ruta / Sector Asignado *</label>
                <input type="text" required value={ruta} onChange={(e) => setRuta(e.target.value)} placeholder="Ej: Sector Centro" className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Turno *</label>
                <select value={turno} onChange={(e) => setTurno(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>

            {mensaje.texto && (
              <div className={`rounded-lg p-3 text-center text-xs font-medium ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {mensaje.texto}
              </div>
            )}

            <button type="submit" disabled={isPending} className="mt-4 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-400">
              {isPending ? 'Guardando...' : 'Registrar Salida de Flota'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}