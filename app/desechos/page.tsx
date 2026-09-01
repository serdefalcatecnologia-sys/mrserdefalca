"use client";

import { useState, useEffect, useTransition } from "react";
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

  // Formulario de Desechos / Balanza
  const [placaVehiculo, setPlacaVehiculo] = useState("");
  const [tipoDesecho, setTipoDesecho] = useState("Sólidos Urbanos");
  const [pesoBruto, setPesoBruto] = useState("");
  const [tara, setTara] = useState("");
  const [origenMunicipio, setOrigenMunicipio] = useState("Municipio Miranda");
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

  const pesoNetoCalculado = () => {
    const bruto = parseFloat(pesoBruto) || 0;
    const pesoTara = parseFloat(tara) || 0;
    return Math.max(0, bruto - pesoTara).toFixed(2);
  };

  const handleGuardarPesaje = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const bruto = parseFloat(pesoBruto) || 0;
        const pesoTara = parseFloat(tara) || 0;
        const neto = bruto - pesoTara;

        const { error } = await supabase.from("registro_desechos").insert([
          {
            placa_vehiculo: placaVehiculo,
            tipo_desecho: tipoDesecho,
            peso_bruto_kg: bruto,
            tara_kg: pesoTara,
            peso_neto_kg: neto,
            origen_municipio: origenMunicipio,
            observaciones,
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Pesaje y recepción registrados exitosamente.", tipo: "exito" });
        setPlacaVehiculo("");
        setPesoBruto("");
        setTara("");
        setObservaciones("");
        setTipoDesecho("Sólidos Urbanos");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al registrar pesaje: " + (err.message || "Error inesperado"), tipo: "error" });
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
              <span className="text-lg">⚖️</span>
              <span>Recepción y Pesaje</span>
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
          <h2 className="text-lg font-bold tracking-wide">SERDEFALCA | Módulo Control de Desechos</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Operador de Planta</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-8 max-w-4xl w-full mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-emerald-900">Registro de Pesaje en Balanza</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ingresa el peso bruto y tara para la recepción de desechos en planta de disposición final.
              </p>
            </div>

            <form onSubmit={handleGuardarPesaje} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Placa del Vehículo Recolector *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A82BK9"
                    value={placaVehiculo}
                    onChange={(e) => setPlacaVehiculo(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Clasificación de Desecho *</label>
                  <select
                    value={tipoDesecho}
                    onChange={(e) => setTipoDesecho(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Sólidos Urbanos">Sólidos Urbanos (Domiciliario)</option>
                    <option value="Comercial e Industrial">Comercial e Industrial</option>
                    <option value="Orgánicos">Orgánicos</option>
                    <option value="Plástico/Reciclable">Plástico / Reciclable</option>
                    <option value="Hospitalarios/Peligrosos">Hospitalarios / Biológicos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Peso Bruto (Kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ej: 12500"
                    value={pesoBruto}
                    onChange={(e) => setPesoBruto(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tara del Vehículo (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 4500"
                    value={tara}
                    onChange={(e) => setTara(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Peso Neto Calculado de Desechos:</span>
                  <span className="text-xl font-black text-emerald-800">{pesoNetoCalculado()} Kg</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Origen / Municipio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Municipio Miranda"
                    value={origenMunicipio}
                    onChange={(e) => setOrigenMunicipio(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej: Entrada por Balanza N° 1"
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
                {isPending ? "Registrando Pesaje..." : "Guardar Ingreso de Desechos"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}