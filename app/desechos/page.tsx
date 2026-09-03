"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DesechosPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [usuarioNombre, setUsuarioNombre] = useState("Cargando...");
  const [usuarioIniciales, setUsuarioIniciales] = useState("--");

  // Estados exactos solicitados para el formulario
  const [tipoDesecho, setTipoDesecho] = useState("Sólidos Urbanos");
  const [tipoTransporte, setTipoTransporte] = useState("Camión Compactador");
  const [placa, setPlaca] = useState("");
  const [municipio, setMunicipio] = useState("Miranda");
  const [observaciones, setObservaciones] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Obtener el usuario logueado para guardarlo como "Responsable"
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

  const handleGuardarIngreso = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const { error } = await supabase.from("registro_desechos").insert([
          {
            tipo_desecho: tipoDesecho,
            tipo_transporte: tipoTransporte,
            placa: placa,
            municipio: municipio,
            observaciones: observaciones,
            responsable: usuarioNombre // Guarda quién registró el ingreso
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Ingreso de desechos registrado exitosamente.", tipo: "exito" });
        
        // Limpiar el formulario para el siguiente camión
        setPlaca("");
        setObservaciones("");
        setTipoDesecho("Sólidos Urbanos");
        setTipoTransporte("Camión Compactador");
        setMunicipio("Miranda");
        
        setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 hidden md:flex">
        <div>
          <div className="py-4 px-2 border-b border-emerald-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-emerald-300 font-medium">Gestión Integral de Desechos</p>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-800 text-white shadow-inner">
              <span className="text-lg">🚛</span>
              <span>Recepción de Unidades</span>
            </div>
          </nav>
        </div>

        <button
          onClick={handleCerrarSesion}
          className="flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-100 px-3 py-2 rounded-lg hover:bg-emerald-900 transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-emerald-900 text-white px-6 md:px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-base md:text-lg font-bold tracking-wide">Módulo Control de Desechos</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Operador de Recepción</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300 shrink-0">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 w-full max-w-3xl mx-auto overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-emerald-900">Registro de Ingreso al Vertedero</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Complete los datos de la unidad recolectora para registrar su ingreso.
              </p>
            </div>

            <form onSubmit={handleGuardarIngreso} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                
                {/* 1. Tipo de Desechos */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Clasificación de Desecho *</label>
                  <select
                    value={tipoDesecho}
                    onChange={(e) => setTipoDesecho(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Sólidos Urbanos">Sólidos Urbanos (Domiciliario)</option>
                    <option value="Comercial e Industrial">Comercial e Industrial</option>
                    <option value="Orgánicos">Orgánicos</option>
                    <option value="Plástico/Reciclable">Plástico / Reciclable</option>
                    <option value="Escombros">Escombros / Construcción</option>
                    <option value="Hospitalarios/Peligrosos">Hospitalarios / Biológicos</option>
                  </select>
                </div>

                {/* 2. Tipo de Transporte */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tipo de Transporte *</label>
                  <select
                    value={tipoTransporte}
                    onChange={(e) => setTipoTransporte(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Camión Compactador">Camión Compactador</option>
                    <option value="Camión Volteo">Camión Volteo</option>
                    <option value="Camión 350 / 750">Camión 350 / 750</option>
                    <option value="Camioneta Pick-up">Camioneta Pick-up</option>
                    <option value="Vehículo Particular">Vehículo Particular</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* 3. Placa del Vehículo */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Placa del Vehículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A82BK9"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono uppercase"
                  />
                </div>

                {/* 4. Municipio de Origen */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Municipio de Origen *</label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Miranda">Miranda</option>
                    <option value="Carirubana">Carirubana</option>
                    <option value="Colina">Colina</option>
                    <option value="Zamora">Zamora</option>
                    <option value="Falcón">Falcón</option>
                    <option value="Silva">Silva</option>
                    <option value="Otro">Otro Municipio</option>
                  </select>
                </div>

                {/* 5. Observaciones */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej: Chofer no portaba carnet, carga mixta..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {mensaje.texto && (
                <div
                  className={`p-3.5 rounded-lg text-sm font-bold text-center shadow-sm ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-colors disabled:bg-emerald-400 shadow-md mt-4 flex justify-center items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  "Registrar Ingreso"
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}