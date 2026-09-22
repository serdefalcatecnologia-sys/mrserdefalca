"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DesechosPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [usuarioNombre, setUsuarioNombre] = useState("");
  const [usuarioIniciales, setUsuarioIniciales] = useState("--");

  // Formulario
  const [tipoDesecho, setTipoDesecho] = useState("Desechos Domiciliarios");
  const [tipoTransporte, setTipoTransporte] = useState("Compactador");
  const [placa, setPlaca] = useState("");
  const [origenMunicipio, setOrigenMunicipio] = useState("Miranda");
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    let isMounted = true;

    const verificarUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (isMounted) router.push("/");
        return;
      }

      if (isMounted) {
        const email = session.user.email || "";
        const nombre = email.split("@")[0].toUpperCase();
        setUsuarioNombre(nombre);
        setUsuarioIniciales(nombre.substring(0, 2));
        setCargandoSesion(false);
      }
    };

    verificarUsuario();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/");
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGuardarRegistro = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    startTransition(async () => {
      try {
        const { error } = await supabase.from("registro_desechos").insert([
          {
            tipo_desecho: tipoDesecho,
            tipo_transporte: tipoTransporte,
            placa: placa.toUpperCase(),
            origen_municipio: origenMunicipio,
            observaciones,
            responsable: usuarioNombre,
            fecha_hora: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        setMensaje({ texto: "✅ Recepción de desechos registrada correctamente.", tipo: "exito" });
        setPlaca("");
        setObservaciones("");
      } catch (err: any) {
        setMensaje({ texto: "❌ Error al guardar: " + (err.message || "Error inesperado"), tipo: "error" });
      }
    });
  };

  if (cargandoSesion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 text-zinc-600">
        Verificando sesión...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 font-sans">
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between p-4 shadow-xl shrink-0 hidden md:flex">
        <div>
          <div className="py-4 px-2 border-b border-emerald-800/60 mb-6">
            <h1 className="text-xl font-black tracking-wider text-white">SERDEFALCA</h1>
            <p className="text-[10px] text-emerald-300 font-medium">Control de Desechos</p>
          </div>
          <nav className="space-y-1 text-sm font-medium">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-800 text-white shadow-inner">
              <span>♻️</span>
              <span>Recepción de Desechos</span>
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-emerald-900 text-white px-6 md:px-8 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-base md:text-lg font-bold tracking-wide">Módulo de Desechos Sólidos</h2>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-white">{usuarioNombre}</p>
              <p className="text-emerald-200">Operador de Botadero</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-emerald-950 font-bold flex items-center justify-center text-xs border-2 border-emerald-300 shrink-0">
              {usuarioIniciales}
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 w-full max-w-4xl mx-auto overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-zinc-200/80">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="text-xl md:text-2xl font-extrabold text-emerald-900">Registro de Ingreso a Vertedero</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Complete la clasificación y procedencia del transporte que ingresa.
              </p>
            </div>

            <form onSubmit={handleGuardarRegistro} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Clasificación de Desecho *</label>
                  <select
                    value={tipoDesecho}
                    onChange={(e) => setTipoDesecho(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Desechos Domiciliarios">Desechos Domiciliarios</option>
                    <option value="Desechos Comerciales">Desechos Comerciales</option>
                    <option value="Desechos Industriales">Desechos Industriales</option>
                    <option value="Escombros y Vegetal">Escombros y Vegetal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tipo de Transporte *</label>
                  <select
                    value={tipoTransporte}
                    onChange={(e) => setTipoTransporte(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Compactador">Camión Compactador</option>
                    <option value="Volteo">Camión Volteo</option>
                    <option value="Chasis Largo">Camión Chasis Largo</option>
                    <option value="Particular / Particular">Particular / Pick-Up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Placa del Vehículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A82BK9"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Municipio de Origen *</label>
                  <select
                    value={origenMunicipio}
                    onChange={(e) => setOrigenMunicipio(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Miranda">Miranda</option>
                    <option value="Carirubana">Carirubana</option>
                    <option value="Colina">Colina</option>
                    <option value="Zamora">Zamora</option>
                    <option value="Falcón">Falcón</option>
                    <option value="Silva">Silva</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Observaciones</label>
                  <textarea
                    rows={3}
                    placeholder="Detalles adicionales del estado de la carga o vehículo..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-zinc-300 text-sm text-zinc-800 outline-none focus:border-emerald-600"
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
                className="w-full py-3.5 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-colors disabled:bg-emerald-400 shadow-md mt-4"
              >
                {isPending ? "Guardando..." : "Registrar Recepción de Desechos"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}