"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConfiguracionPage() {
  const [estadoDb, setEstadoDb] = useState<"cargando" | "conectado" | "error">("cargando");
  const [latencia, setLatencia] = useState<number | null>(null);
  const [calidadConexion, setCalidadConexion] = useState<"Buena" | "Media" | "Lenta" | null>(null);

  const [tablaSeleccionada, setTablaSeleccionada] = useState("registro_comercial");
  const [descargando, setDescargando] = useState(false);

  const [tablaPurga, setTablaPurga] = useState("registro_comercial");
  const [confirmacionTexto, setConfirmacionTexto] = useState("");
  const [purgando, setPurgando] = useState(false);
  const [mensajePurga, setMensajePurga] = useState<{ texto: string; tipo: "exito" | "error" } | null>(null);

  useEffect(() => {
    async function verificarSalud() {
      try {
        const inicio = performance.now();
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
          if (tiempoMs < 200) setCalidadConexion("Buena");
          else if (tiempoMs <= 500) setCalidadConexion("Media");
          else setCalidadConexion("Lenta");
        }
      } catch (err) {
        setEstadoDb("error");
      }
    }
    verificarSalud();
  }, []);

  const handleDescargarRespaldo = async () => {
    setDescargando(true);
    try {
      const { data, error } = await supabase.from(tablaSeleccionada).select("*");
      if (error) {
        alert(`Error al exportar: ${error.message}`);
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

  const handlePurgaBaseDeDatos = async () => {
    if (confirmacionTexto.trim().toUpperCase() !== "BORRAR") return;
    const confirmacion = window.confirm(`⚠️ ¿ESTÁS SEGURO?\n\nSe eliminarán TODOS los registros de '${tablaPurga}'.`);
    if (!confirmacion) return;

    setPurgando(true);
    try {
      const { error } = await supabase
        .from(tablaPurga)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw new Error(error.message);

      setMensajePurga({ texto: `✅ Tabla '${tablaPurga}' purgada correctamente.`, tipo: "exito" });
      setConfirmacionTexto("");
    } catch (err: any) {
      setMensajePurga({ texto: `❌ Error al depurar: ${err.message}`, tipo: "error" });
    } finally {
      setPurgando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">
              ← Volver al Menú Principal
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-zinc-800">Mantenimiento y Configuración</h1>
            <p className="text-xs text-zinc-500">Herramientas de diagnóstico, respaldos y purga de base de datos.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-800 mb-4">Estado de la Base de Datos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-xs text-zinc-500 block">Conexión</span>
              <span className={`text-sm font-bold ${estadoDb === "conectado" ? "text-emerald-600" : estadoDb === "error" ? "text-red-600" : "text-amber-600"}`}>
                {estadoDb === "cargando" && "Verificando..."}
                {estadoDb === "conectado" && "● En Línea"}
                {estadoDb === "error" && "✕ Error de Conexión"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-xs text-zinc-500 block">Latencia</span>
              <span className="text-sm font-bold text-zinc-800">
                {latencia !== null ? `${latencia} ms` : "N/A"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
              <span className="text-xs text-zinc-500 block">Calidad de Respuesta</span>
              <span className="text-sm font-bold text-zinc-800">
                {calidadConexion || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-800 mb-1">Exportar Respaldos (JSON)</h2>
          <p className="text-xs text-zinc-500 mb-4">Descarga una copia local con la información de las tablas seleccionadas.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={tablaSeleccionada}
              onChange={(e) => setTablaSeleccionada(e.target.value)}
              className="w-full sm:w-auto flex-1 rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600"
            >
              <option value="registro_comercial">Comercialización y Facturación</option>
              <option value="registro_flota">Flota de Rutas</option>
              <option value="registro_desechos">Control de Desechos</option>
              <option value="usuarios">Usuarios del Sistema</option>
            </select>
            <button
              onClick={handleDescargarRespaldo}
              disabled={descargando}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {descargando ? "Generando..." : "Descargar Respaldo"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-red-50/50 border border-red-200 p-6">
          <h2 className="text-lg font-bold text-red-800 mb-1">Zona de Peligro: Depurar Tablas</h2>
          <p className="text-xs text-red-600 mb-4">Escribe la palabra <strong className="font-bold">BORRAR</strong> para habilitar la eliminación de registros.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tabla a vaciar</label>
                <select
                  value={tablaPurga}
                  onChange={(e) => setTablaPurga(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-red-600"
                >
                  <option value="registro_comercial">Comercialización y Facturación</option>
                  <option value="registro_flota">Flota de Rutas</option>
                  <option value="registro_desechos">Control de Desechos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirmación</label>
                <input
                  type="text"
                  value={confirmacionTexto}
                  onChange={(e) => setConfirmacionTexto(e.target.value)}
                  placeholder="Escribe BORRAR"
                  className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-red-600"
                />
              </div>
            </div>

            {mensajePurga && (
              <div className={`p-3 rounded-lg text-xs font-medium ${mensajePurga.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {mensajePurga.texto}
              </div>
            )}

            <button
              onClick={handlePurgaBaseDeDatos}
              disabled={confirmacionTexto.trim().toUpperCase() !== "BORRAR" || purgando}
              className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {purgando ? "Vaciando tabla..." : "Vaciar Tabla Seleccionada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}