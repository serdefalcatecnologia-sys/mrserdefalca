"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FlotaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [usuarioNombre, setUsuarioNombre] = useState("Cargando...");
  const [usuarioIniciales, setUsuarioIniciales] = useState("--");

  // Estados del formulario
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [municipio, setMunicipio] = useState("Miranda");
  const [rutaSector, setRutaSector] = useState("");
  const [tonelaje, setTonelaje] = useState("");
  const [estadoRuta, setEstadoRuta] = useState("Completada");
  const [observaciones, setObservaciones] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const obtenerUsuario = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        startTransition(() => router.push("/"));
        return;
      }
      const email = session.user.email || "";
      const nombre = email.split("@")[0].toUpperCase();
      setUsuarioNombre(nombre);
      setUsuarioIniciales(nombre.substring(0, 2));
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    }
  }, [router]);

  useEffect(() => {
    obtenerUsuario();
  }, [obtenerUsuario]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    startTransition(() => router.push("/"));
  };

  const handleGuardarRuta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const peso = parseFloat(tonelaje) || 0;

        const { error } = await supabase.from("flota_rutas").insert([
          {
            placa: placa,
            conductor: conductor,
            municipio: municipio,
            ruta_sector: rutaSector,
            tonelaje: peso,
            estado_ruta: estadoRuta,
            observaciones: observaciones,
            responsable: usuarioNombre // Se registra automáticamente quién hizo el ingreso
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Ruta y recolección registrada exitosamente.", tipo: "exito" });
        
        // Limpiar formulario
        setPlaca("");
        setConductor("");
        setRutaSector("");
        setTonelaje("");
        setObservaciones("");
        setEstadoRuta("Completada");
        
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 hidden md:flex">
        <div>
          <div className="py-4 px-2 border-b border-blue-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-blue-300 font-medium">Gestión de Flota y Rutas</p>
          </div>
          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-800 text-white shadow-inner">
              <span className="text-lg">🚚</span>
              <span>Control de Rutas</span>
            </div>
          </nav>
        </div>
        <button
          onClick={handleCerrarSesion}
          className="flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-100 px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-900 text-white px-6 md:px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-base md:text-lg font-bold tracking-wide">Módulo Control de Flota</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-blue-200">Operador de Flota</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-500 text-blue-950 font-bold flex items-center justify-center text-xs border-2 border-blue-300 shrink-0">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 w-full max-w-4xl mx-auto overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-blue-900">Registro de Ruta de Recolección</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Complete los datos del vehículo y la ruta cubierta. La fecha y hora se guardarán automáticamente.
              </p>
            </div>

            <form onSubmit={handleGuardarRuta} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Vehículo Asignado (Placa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A82BK9"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Conductor Asignado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido"
                    value={conductor}
                    onChange={(e) => setConductor(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Municipio *</label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="Miranda">Miranda</option>
                    <option value="Carirubana">Carirubana</option>
                    <option value="Colina">Colina</option>
                    <option value="Zamora">Zamora</option>
                    <option value="Falcón">Falcón</option>
                    <option value="Silva">Silva</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Ruta / Sector Cubierto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Casco Central, Av. Independencia"
                    value={rutaSector}
                    onChange={(e) => setRutaSector(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tonelaje Recolectado (T)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ej: 12.5"
                    value={tonelaje}
                    onChange={(e) => setTonelaje(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Estado de la Ruta *</label>
                  <select
                    value={estadoRuta}
                    onChange={(e) => setEstadoRuta(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="Completada">Completada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Incompleta">Incompleta / Fallida</option>
                    <option value="Suspendida">Suspendida por Avería</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Detalles sobre novedades, fallas mecánicas, etc..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {mensaje.texto && (
                <div
                  className={`p-3.5 rounded-lg text-sm font-bold text-center shadow-sm ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors disabled:bg-blue-400 shadow-md mt-4 flex justify-center items-center gap-2"
              >
                {isPending ? "Procesando..." : "Registrar Control de Ruta"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}