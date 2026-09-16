"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ConfiguracionPage() {
  // Estados para Salud del Sistema
  const [estadoDb, setEstadoDb] = useState<"cargando" | "conectado" | "error">("cargando");
  const [latencia, setLatencia] = useState<number | null>(null);
  const [calidadConexion, setCalidadConexion] = useState<"Buena" | "Media" | "Lenta" | null>(null);

  // Estados para Respaldo y Exportación
  const [tablaSeleccionada, setTablaSeleccionada] = useState("registro_comercial");
  const [descargando, setDescargando] = useState(false);

  // Estados para Depuración y Purga
  const [tablaPurga, setTablaPurga] = useState("registro_comercial");
  const [confirmacionTexto, setConfirmacionTexto] = useState("");
  const [purgando, setPurgando] = useState(false);
  const [mensajePurga, setMensajePurga] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  useEffect(() => {
    async function verificarSalud() {
      try {
        const inicio = performance.now();
        
        // Consulta ligera de prueba a la base de datos
        const { error } = await supabase.from("registro_desechos").select("*").limit(1);
        
        const fin = performance.now();
        const tiempoMs = Math.round(fin - inicio);

        if (error && error.message.includes("Failed to fetch")) {
          setEstadoDb("error");
          setLatencia(null);
          setCalidadConexion(null);
        } else {
          setEstadoDb("conectado");
          setLatencia(tiempoMs);

          if (tiempoMs < 200) {
            setCalidadConexion("Buena");
          } else if (tiempoMs <= 500) {
            setCalidadConexion("Media");
          } else {
            setCalidadConexion("Lenta");
          }
        }
      } catch (err) {
        setEstadoDb("error");
        setLatencia(null);
        setCalidadConexion(null);
      }
    }

    verificarSalud();
  }, []);

  // Función para descargar respaldos
  const handleDescargarRespaldo = async () => {
    setDescargando(true);
    try {
      const { data, error } = await supabase.from(tablaSeleccionada).select("*");

      if (error) {
        alert(`Error al exportar la tabla ${tablaSeleccionada}: ${error.message}`);
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `respaldo_${tablaSeleccionada}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Ocurrió un error inesperado al generar la descarga.");
    } finally {
      setDescargando(false);
    }
  };

  // Función para depurar/limpiar datos antiguos
  const handlePurgaBaseDeDatos = async () => {
    if (confirmacionTexto.trim().toUpperCase() !== "BORRAR") {
      setMensajePurga({
        texto: "Debe escribir la palabra 'BORRAR' para confirmar la depuración.",
        tipo: "error",
      });
      return;
    }

    const confirmacionNavegador = window.confirm(
      `⚠️ ¿ESTÁS SEGURO?\n\nEsta acción eliminará TODOS los registros de la tabla '${tablaPurga}'. Esta operación no se puede deshacer.`
    );

    if (!confirmacionNavegador) return;

    setPurgando(true);
    setMensajePurga(null);

    try {
      // Elimina todos los registros de la tabla seleccionada (donde id no sea nulo/vacío)
      const { error } = await supabase
        .from(tablaPurga)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        throw new Error(error.message);
      }

      setMensajePurga({
        texto: `✅ La tabla '${tablaPurga}' ha sido purgada correctamente.`,
        tipo: "exito",
      });
      setConfirmacionTexto("");
    } catch (err: any) {
      setMensajePurga({
        texto: `❌ Error al depurar la tabla: ${err.message || "Error desconocido. Verifique permisos RLS."}`,
        tipo: "error",
      });
    } finally {
      setPurgando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Mantenimiento y Configuración</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Monitoreo del sistema, respaldos y purga de base de datos.
          </p>
        </div>

        {/* 1. Salud del Sistema */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-800 mb-4">Salud del Sistema</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Estado DB */}
            <div
              className={`rounded-xl p-4 border ${
                estadoDb === "conectado"
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                  : estadoDb === "error"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">Conexión Supabase DB</p>
              <p className="mt-2 text-base font-semibold flex items-center gap-2">
                {estadoDb === "conectado" && (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Conectado
                  </>
                )}
                {estadoDb === "error" && (
                  <>
                    <span className="text-rose-600">✕</span> Error de Conexión
                  </>
                )}
                {estadoDb === "cargando" && "Midiendo..."}
              </p>
            </div>

            {/* Latencia e Internet */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-blue-900">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Latencia / Conexión Internet</p>
              <div className="mt-2 text-base font-semibold">
                {latencia !== null && calidadConexion !== null ? (
                  <div className="flex items-center gap-2">
                    <span>{latencia} ms</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        calidadConexion === "Buena"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : calidadConexion === "Media"
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-rose-100 text-rose-700 border border-rose-300"
                      }`}
                    >
                      {calidadConexion}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-normal text-zinc-500">Midiendo...</span>
                )}
              </div>
            </div>

            {/* Servicio Auth */}
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 text-purple-900">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-700">Servicio Autenticación</p>
              <p className="mt-2 text-base font-semibold text-purple-800">Activo (Auth & Admin)</p>
            </div>
          </div>
        </div>

        {/* 2. Respaldo y Exportación */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-800">Respaldo y Exportación</h2>
            <p className="text-sm text-zinc-500">
              Exporta una copia completa de los registros seleccionados en formato JSON.
            </p>
          </div>

          <div>
            <button
              onClick={handleDescargarRespaldo}
              disabled={descargando}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {descargando ? "Generando respaldo..." : `Descargar Respaldo de ${tablaSeleccionada}`}
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Seleccionar Tabla:</label>
            <select
              value={tablaSeleccionada}
              onChange={(e) => setTablaSeleccionada(e.target.value)}
              className="w-full max-w-md rounded-xl border border-zinc-300 p-3 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="registro_comercial">registro_comercial</option>
              <option value="registro_desechos">registro_desechos</option>
              <option value="flota_rutas">flota_rutas</option>
              <option value="usuarios">usuarios</option>
            </select>
            <p className="mt-2 text-xs text-zinc-400">
              Descripción: Historial de datos, recaudación y registros del módulo seleccionado.
            </p>
          </div>
        </div>

        {/* 3. Depuración y Purga de Base de Datos */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-rose-800">
              <span className="text-xl">⚠️</span>
              <h2 className="text-lg font-bold">Depuración y Limpieza de Base de Datos</h2>
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              Permite vaciar las tablas con datos antiguos o de prueba para reiniciar el sistema. <strong>Se recomienda descargar un respaldo antes de purgar.</strong>
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 mb-1">
                Tabla a Depurar / Vaciar:
              </label>
              <select
                value={tablaPurga}
                onChange={(e) => setTablaPurga(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-3 text-sm text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="registro_comercial">registro_comercial</option>
                <option value="registro_desechos">registro_desechos</option>
                <option value="flota_rutas">flota_rutas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-600 mb-1">
                Confirmación de Seguridad:
              </label>
              <input
                type="text"
                placeholder="Escribe BORRAR para habilitar"
                value={confirmacionTexto}
                onChange={(e) => setConfirmacionTexto(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
              />
            </div>

            {mensajePurga && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold ${
                  mensajePurga.tipo === "exito"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {mensajePurga.texto}
              </div>
            )}

            <button
              onClick={handlePurgaBaseDeDatos}
              disabled={purgando || confirmacionTexto.trim().toUpperCase() !== "BORRAR"}
              className="w-full rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purgando ? "Purgando tabla..." : `Purgar Tabla ${tablaPurga}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}