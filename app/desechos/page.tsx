"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ControlDesechosOperador() {
  const router = useRouter();

  // Datos del Usuario/Operador
  const [usuario, setUsuario] = useState<any>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Datos del Formulario
  const [tipoDesecho, setTipoDesecho] = useState("");
  const [tipoTransporte, setTipoTransporte] = useState("");
  const [placa, setPlaca] = useState("");
  const [responsable, setResponsable] = useState("");

  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const [fechaHoraActual, setFechaHoraActual] = useState("");

  useEffect(() => {
    // 1. Reloj en vivo
    const actualizarFechaHora = () => {
      const ahora = new Date();
      setFechaHoraActual(ahora.toLocaleString("es-VE"));
    };
    actualizarFechaHora();
    const intervalo = setInterval(actualizarFechaHora, 1000);

    // 2. Cargar perfil del operador
    const cargarPerfil = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.push('/');
        return;
      }
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', authData.session.user.id)
        .single();
      
      if (perfil) {
        setUsuario(perfil);
        // Autocompletar el nombre del responsable con el usuario logueado
        setResponsable(`${perfil.nombre} ${perfil.apellido}`);
      }
      setCargandoPerfil(false);
    };

    cargarPerfil();
    return () => clearInterval(intervalo);
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const obtenerIniciales = (n = '', a = '') => `${n.charAt(0) || ''}${a.charAt(0) || ''}`.toUpperCase();

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
      setMensaje({ texto: "✅ Registro de ingreso guardado exitosamente.", tipo: "exito" });
      setTipoDesecho("");
      setTipoTransporte("");
      setPlaca("");
      // No limpiamos el responsable porque suele ser el mismo operador
    }
    setCargando(false);
  };

  if (cargandoPerfil) return <div className="flex h-screen items-center justify-center bg-zinc-100 font-sans"><div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans flex flex-col relative overflow-hidden">
      
      {/* ENCABEZADO EXCLUSIVO PARA EL OPERADOR */}
      <header className="flex h-20 items-center justify-between bg-emerald-900 px-8 text-white shadow-md shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-wide">SERDEFALCA | Control de Desechos</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold capitalize">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="text-xs text-emerald-300 capitalize">{usuario?.rol}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shadow-sm shrink-0">
            {usuario?.foto ? <img src={usuario.foto} alt="Perfil" className="h-full w-full object-cover" /> : obtenerIniciales(usuario?.nombre, usuario?.apellido)}
          </div>
          <button onClick={cerrarSesion} title="Cerrar Sesión" className="ml-2 text-emerald-200 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
          
          <div className="bg-emerald-700 px-6 py-8 text-center text-white border-b-4 border-emerald-500">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-auto rounded-lg bg-white px-4 py-2 shadow-inner">
                <img src="/logo1.png" alt="Logo Serdefalca" className="h-full object-contain" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Control de Ingreso al Botadero</h1>
            <p className="mt-2 text-emerald-100 font-medium">Registro oficial de recepción de desechos</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-900/50 px-5 py-2 text-sm font-bold shadow-inner">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {fechaHoraActual}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-zinc-700 uppercase tracking-wide">Clasificación del Desecho *</label>
                <select
                  required
                  value={tipoDesecho}
                  onChange={(e) => setTipoDesecho(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-3.5 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-zinc-50 font-medium"
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

              <div>
                <label className="mb-1.5 block text-sm font-bold text-zinc-700 uppercase tracking-wide">Tipo de Transporte *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Camión Compactador, Volteo..."
                  value={tipoTransporte}
                  onChange={(e) => setTipoTransporte(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-3.5 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-zinc-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-zinc-700 uppercase tracking-wide">Número de Placa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: A12B34C"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-3.5 text-zinc-800 uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono font-bold bg-zinc-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-zinc-700 uppercase tracking-wide">Nombre del Controlador (Responsable) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido de quien registra"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-3.5 text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-zinc-50"
                />
              </div>
            </div>

            {mensaje.texto && (
              <div className={`mt-8 rounded-xl p-4 text-center font-bold shadow-sm ${
                mensaje.tipo === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {mensaje.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className={`mt-8 w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${
                cargando ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:-translate-y-0.5'
              }`}
            >
              {cargando ? 'Registrando en base de datos...' : 'Registrar Ingreso de Desechos'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}