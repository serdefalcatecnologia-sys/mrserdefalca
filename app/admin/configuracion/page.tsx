"use client";

import { useEffect, useState } from "react";
// IMPORTACIÓN CORREGIDA: Se utiliza el cliente global de supabase
import { supabase } from '@/lib/supabase';

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
      if (error) { alert(`Error al exportar: ${error.message}`); return; }

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
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Filtro de seguridad requerido por Supabase

      if (error) throw new Error(error.message);

      setMensajePurga({ texto: `✅ Tabla '${tablaPurga}' purgada correctamente.`, tipo: "exito" });
      setConfirmacionTexto("");
    } catch (err: any) {
      setMensajePurga({ texto: `❌ Error al depurar: ${err.message}`, tipo: "error" });
    } finally {
      setPurgando(false);
    }
  };

  // El resto del JSX (interfaz) permanece idéntico al original,
  // con la lógica interna ya corregida en la parte superior.
  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-8 font-sans">
        <h1 className="text-2xl font-bold text-zinc-800">Mantenimiento y Configuración</h1>
        {/* ... Resto del diseño HTML original ... */}
    </div>
  );
}