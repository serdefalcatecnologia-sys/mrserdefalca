"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MantenimientoConfiguracionPage() {
  const [tablaSeleccionada, setTablaSeleccionada] = useState("registro_comercial");
  const [fechaPurga, setFechaPurga] = useState("");
  const [estadoDb, setEstadoDb] = useState<"conectado" | "error" | "cargando">("cargando");
  const [latencia, setLatencia] = useState<number | null>(null);

  useEffect(() => {
    async function verificarSalud() {
      const inicio = performance.now();
      const { error } = await supabase.from("usuarios").select("id").limit(1);
      const fin = performance.now();

      if (error) {
        setEstadoDb("error");
      } else {
        setEstadoDb("conectado");
        setLatencia(Math.round(fin - inicio));
      }
    }
    verificarSalud();
  }, []);

  const descargarRespaldo = async () => {
    const { data, error } = await supabase.from(tablaSeleccionada).select("*");
    if (error) {
      alert("Error al descargar respaldo");
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respaldo_${tablaSeleccionada}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Mantenimiento y Configuración</h1>
          <p className="text-xs text-zinc-500">Monitoreo del sistema, respaldos y purga de base de datos.</p>
        </div>

        {/* 1. Salud del Sistema */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800 mb-4">Salud del Sistema</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <span className="text-xs font-semibold uppercase text-emerald-700">Conexión Supabase DB</span>
              <p className="mt-1 text-sm font-bold text-emerald-900">
                {estadoDb === "conectado" ? "● Operativo / Conectado" : estadoDb === "error" ? "✕ Error de Conexión" : "Verificando..."}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <span className="text-xs font-semibold uppercase text-blue-700">Latencia API</span>
              <p className="mt-1 text-sm font-bold text-blue-900">
                {latencia !== null ? `${latencia} ms` : "Midiendo..."}
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
              <span className="text-xs font-semibold uppercase text-purple-700">Servicio Autenticación</span>
              <p className="mt-1 text-sm font-bold text-purple-900">Activo (Auth & Admin)</p>
            </div>
          </div>
        </div>

        {/* 2. Respaldo de Seguridad */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800">Respaldo y Exportación</h2>
          <p className="mt-1 text-xs text-zinc-500">Exporta una copia completa de los registros seleccionados en formato JSON.</p>
          <button
            onClick={descargarRespaldo}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Descargar Respaldo de {tablaSeleccionada}
          </button>
        </div>

        {/* 3. Selección de Tabla */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold text-zinc-800 mb-2">Seleccionar Tabla:</label>
          <select
            value={tablaSeleccionada}
            onChange={(e) => setTablaSeleccionada(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 p-3 text-sm focus:border-emerald-600 focus:outline-none"
          >
            <option value="registro_comercial">registro_comercial</option>
            <option value="registro_desechos">registro_desechos</option>
            <option value="flota_rutas">flota_rutas</option>
            <option value="usuarios">usuarios</option>
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            <strong>Descripción:</strong> Historial de datos, recaudación y registros del módulo seleccionado.
          </p>
        </div>

        {/* 4. Depuración de Registros */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800">Depuración de Registros Antiguos</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Eliminar registros anteriores a:</label>
              <input
                type="date"
                value={fechaPurga}
                onChange={(e) => setFechaPurga(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-2.5 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => alert(`Iniciando depuración en ${tablaSeleccionada}`)}
              className="rounded-xl bg-red-500 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-600"
            >
              Iniciar Purga
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}