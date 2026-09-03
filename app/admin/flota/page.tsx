"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function VistaFlotaAdmin() {
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
        .from("flota_rutas")
        .select("*")
        .order("fecha_hora", { ascending: false });

      if (!error && data) {
        setRegistros(data);
      } else if (error) {
        console.error("Error cargando flota:", error);
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
      <div className="mx-auto max-w-7xl">
        {esAdmin && (
          <div className="mb-4">
            <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:underline">
              ← Volver al Menú Principal
            </Link>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md border border-zinc-200">
          <h1 className="text-2xl font-bold text-blue-900">Control General de Flota y Rutas</h1>
          <p className="mt-1 text-sm text-zinc-500">Supervisión en tiempo real de unidades recolectoras y tonelajes.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-b border-zinc-200 bg-blue-50 text-blue-900">
              <tr>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Fecha y Hora</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Vehículo</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Conductor</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Ruta y Sector</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Tonelaje</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Estado</th>
                <th className="px-4 py-4 font-semibold uppercase tracking-wider text-xs">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    Cargando registros de rutas...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No hay registros de flota aún.
                  </td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="transition-colors hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-zinc-800">
                      {reg.fecha_hora ? new Date(reg.fecha_hora).toLocaleString("es-VE") : 'N/A'}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold uppercase text-zinc-700">{reg.placa}</td>
                    <td className="px-4 py-4 capitalize">{reg.conductor}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-zinc-800">{reg.municipio}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{reg.ruta_sector}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-blue-700">{reg.tonelaje} T</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold
                        ${reg.estado_ruta === 'Completada' ? 'bg-green-100 text-green-800' : ''}
                        ${reg.estado_ruta === 'En Proceso' ? 'bg-amber-100 text-amber-800' : ''}
                        ${reg.estado_ruta === 'Incompleta' ? 'bg-orange-100 text-orange-800' : ''}
                        ${reg.estado_ruta === 'Suspendida' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {reg.estado_ruta}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-500">{reg.responsable || 'N/A'}</td>
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