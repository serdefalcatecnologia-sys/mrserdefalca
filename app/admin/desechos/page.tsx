"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function VistaDesechosAdmin() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(true);

  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (authData.session) {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id_usuario", authData.session.user.id)
          .single();

        const r = perfil?.rol?.toLowerCase().trim();
        if (r === "comercial" || r === "flota" || r === "desechos") {
          setEsAdmin(false);
        }
      }

      const { data, error } = await supabase
        .from("registro_desechos")
        .select("*")
        .order("fecha_hora", { ascending: false });

      if (!error && data) {
        setRegistros(data);
      } else if (error) {
        console.error("Error cargando desechos:", error);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {esAdmin && (
          <div className="mb-4">
            <Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">
              ← Volver al Menú Principal
            </Link>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md border border-zinc-200">
          <h1 className="text-2xl font-bold text-emerald-800">Control de Desechos Sólidos</h1>
          <p className="mt-1 text-sm text-zinc-500">Historial general de recepciones e ingresos al botadero.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-emerald-50 text-emerald-800">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Fecha y Hora</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Clasificación</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Transporte</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Placa</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Cargando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No hay registros de desechos aún.
                  </td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-800">
                      {reg.fecha_hora ? new Date(reg.fecha_hora).toLocaleString("es-VE") : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {reg.tipo_desecho}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{reg.tipo_transporte || 'No especificado'}</td>
                    <td className="px-6 py-4 font-mono font-bold uppercase text-zinc-700">{reg.placa}</td>
                    <td className="px-6 py-4 text-zinc-600">{reg.responsable || 'N/A'}</td>
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