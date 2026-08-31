"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function VistaDesechosAdmin() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarRegistros() {
      const { data, error } = await supabase
        .from("registro_desechos")
        .select("*")
        .order("fecha_hora", { ascending: false });

      if (!error && data) {
        setRegistros(data);
      }
      setCargando(false);
    }
    cargarRegistros();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">
            ← Volver al Menú Principal
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-bold text-emerald-800">Control de Desechos Sólidos</h1>
          <p className="text-zinc-500 text-sm mt-1">Historial general de recepciones e ingresos al botadero.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-emerald-50 text-emerald-800 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-4 font-semibold">Clasificación</th>
                <th className="px-6 py-4 font-semibold">Transporte</th>
                <th className="px-6 py-4 font-semibold">Placa</th>
                <th className="px-6 py-4 font-semibold">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Cargando registros...</td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No hay registros de desechos aún.</td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(reg.fecha_hora).toLocaleString('es-VE')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        {reg.tipo_desecho}
                      </span>
                    </td>
                    <td className="px-6 py-4">{reg.tipo_transporte}</td>
                    <td className="px-6 py-4 font-mono uppercase">{reg.placa}</td>
                    <td className="px-6 py-4">{reg.responsable}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}