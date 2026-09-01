"use client";

import { useState, useEffect, useTransition } from "react";
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

  // Formulario de Flota
  const [vehiculo, setVehiculo] = useState("");
  const [chofer, setChofer] = useState("");
  const [cedulaChofer, setCedulaChofer] = useState("");
  const [rutaSector, setRutaSector] = useState("");
  const [turno, setTurno] = useState("Mañana");
  const [kilometraje, setKilometraje] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }
    const email = session.user.email || "";
    const nombre = email.split("@")[0].toUpperCase();
    setUsuarioNombre(nombre);
    setUsuarioIniciales(nombre.substring(0, 2));
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGuardarRuta = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const { error } = await supabase.from("rutas_flota").insert([
          {
            vehiculo,
            chofer,
            cedula_chofer: cedulaChofer,
            ruta_sector: rutaSector,
            turno,
            kilometraje: kilometraje ? parseFloat(kilometraje) : null,
            observaciones,
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Salida de ruta registrada exitosamente.", tipo: "exito" });
        setVehiculo("");
        setChofer("");
        setCedulaChofer("");
        setRutaSector("");
        setKilometraje("");
        setObservaciones("");
        setTurno("Mañana");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al guardar ruta: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="py-4 px-2 border-b border-emerald-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-emerald-300 font-medium">Gestión Integral de Desechos</p>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-800 text-white shadow-inner">
              <span className="text-lg">🚛</span>
              <span>Registro de Ruta / Flota</span>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-emerald-900 text-white px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-lg font-bold tracking-wide">SERDEFALCA | Módulo Flota de Rutas</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Operador de Flota</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-8 max-w-4xl w-full mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-emerald-900">Despacho y Asignación de Rutas</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Registra la asignación de unidades, conductores y sectores de recolección.
              </p>
            </div>

            <form onSubmit={handleGuardarRuta} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Unidad / Placa del Vehículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Camión Compactador #04 (A82BK9)"
                    value={vehiculo}
                    onChange={(e) => setVehiculo(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nombre del Conductor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Pedro Pérez"
                    value={chofer}
                    onChange={(e) => setChofer(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Cédula del Conductor</label>
                  <input
                    type="text"
                    placeholder="Ej: V-15487963"
                    value={cedulaChofer}
                    onChange={(e) => setCedulaChofer(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Ruta / Sector Asignado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Coro - Sector Centro / Bobare"
                    value={rutaSector}
                    onChange={(e) => setRutaSector(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Turno *</label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Kilometraje Inicial (Km)</label>
                  <input
                    type="number"
                    placeholder="Ej: 145200"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Observaciones / Estado del Vehículo</label>
                  <input
                    type="text"
                    placeholder="Ej: Nivel de cauchos ok, combustible tanque lleno"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {mensaje.texto && (
                <div
                  className={`p-3.5 rounded-lg text-xs font-semibold text-center ${
                    mensaje.tipo === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 shadow-md"
              >
                {isPending ? "Registrando Salida..." : "Registrar Salida de Ruta"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}