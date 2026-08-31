"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ControlDesechos() {
  const router = useRouter();

  const [tipoDesecho, setTipoDesecho] = useState("");
  const [tipoTransporte, setTipoTransporte] = useState("");
  const [placa, setPlaca] = useState("");
  const [responsable, setResponsable] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const [fechaHoraActual, setFechaHoraActual] = useState("");

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date();
      setFechaHoraActual(ahora.toLocaleString("es-VE"));
    };
    actualizarFechaHora();
    const intervalo = setInterval(actualizarFechaHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: "", tipo: "" });

    const { error } = await supabase.from("registro_desechos").insert([
      {
        tipo_desecho: tipoDesecho,
        tipo_transporte: tipoTransporte,
        placa: placa.toUpperCase(),
        responsable: responsable,
      },
    ]);

    if (error) {
      setMensaje({ texto: "❌ Error al guardar el registro. Intente de nuevo.", tipo: "error" });
      console.error(error);
    } else {
      setMensaje({ texto: "✅ Registro guardado exitosamente.", tipo: "exito" });
      setTipoDesecho("");
      setTipoTransporte("");
      setPlaca("");
      setResponsable("");
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 font-sans sm:p-8">
      {/* Botón de Cerrar Sesión */}
      <div className="mx-auto mb-4 flex max-w-2xl justify-end">
        <button
          onClick={handleCerrarSesion}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Encabezado */}
        <div className="bg-emerald-700 px-6 py-8 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-auto rounded bg-white px-4 py-2">
              <img src="/logo1.png" alt="Logo Serdefalca" className="h-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Control de Ingreso al Botadero</h1>
          <p className="mt-2 text-emerald-100">Registro oficial de recepción de desechos</p>
          <div className="mt-4 inline-block rounded-full bg-emerald-800 px-4 py-1 text-sm font-medium">
            🕒 {fechaHoraActual}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Tipo de Desecho */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-zinc-700">Clasificación del Desecho *</label>
              <select
                required
                value={tipoDesecho}
                onChange={(e) => setTipoDesecho(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-3 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Seleccione una categoría...</option>
                <option value="Desechos domésticos">Desechos domésticos</option>
                <option value="Desechos comerciales">Desechos comerciales</option>
                <option value="Desechos sólidos generales">Desechos sólidos generales</option>
                <option value="Desechos vegetales">Desechos vegetales</option>
                <option value="Desechos industriales">Desechos industriales</option>
                <option value="Desechos orgánicos">Desechos orgánicos</option>
              </select>
            </div>

            {/* Tipo de Transporte */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-700">Tipo de Transporte *</label>
              <input
                type="text"
                required
                placeholder="Ej: Camión Compactador, Volteo..."
                value={tipoTransporte}
                onChange={(e) => setTipoTransporte(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-3 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Placa */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-700">Número de Placa *</label>
              <input
                type="text"
                required
                placeholder="Ej: A12B34C"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-3 text-zinc-800 uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Responsable */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-zinc-700">Nombre del Controlador (Responsable) *</label>
              <input
                type="text"
                required
                placeholder="Nombre y Apellido de quien registra"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 p-3 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {mensaje.texto && (
            <div className={`mt-6 rounded-lg p-4 text-center font-medium ${
              mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className={`mt-8 w-full rounded-lg py-4 text-lg font-bold text-white transition-colors ${
              cargando ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {cargando ? 'Procesando registro...' : 'Registrar Ingreso de Desechos'}
          </button>
        </form>
      </div>
    </div>
  );
}