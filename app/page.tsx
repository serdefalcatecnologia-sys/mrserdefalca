"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMsj, setErrorMsj] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsj("");
    setCargando(true);

    try {
      // 1. Iniciar sesión en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setErrorMsj("Correo o contraseña incorrectos.");
        } else {
          setErrorMsj(`Error de conexión: ${authError.message}`);
        }
        setCargando(false);
        return;
      }

      if (!authData.user) {
        setErrorMsj("No se pudo obtener la sesión del usuario.");
        setCargando(false);
        return;
      }

      // 2. Consultar el rol en la tabla 'usuarios'
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id_usuario", authData.user.id)
        .maybeSingle();

      if (usuarioError) {
        console.error("Error al consultar el rol:", usuarioError);
        setErrorMsj(`Error al consultar perfil: ${usuarioError.message}`);
        setCargando(false);
        return;
      }

      if (!usuarioData) {
        setErrorMsj("El usuario se autenticó pero no está registrado en la tabla 'usuarios'.");
        setCargando(false);
        return;
      }

      // 3. Redirección basada en el rol del usuario
      const rol = (usuarioData.rol || "").toLowerCase().trim();

      if (rol === "administrador" || rol === "admin") {
        router.push("/admin");
      } else if (rol === "desechos") {
        router.push("/desechos");
      } else if (rol === "flota" || rol === "rutas") {
        router.push("/flota");
      } else if (rol === "comercial" || rol === "comercializacion") {
        router.push("/comercializacion");
      } else {
        router.push("/admin");
      }

      router.refresh();

    } catch (err: any) {
      setErrorMsj(`Error inesperado: ${err.message || "Consulte con soporte."}`);
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-900 overflow-hidden font-sans">
      {/* Imagen de fondo con overlay suave */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transform transition-transform duration-1000"
        style={{ backgroundImage: "url('/fondo-serdefalca.jpg')" }} 
      />
      
      {/* Superposición de degradado para darle elegancia */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-black/50 to-zinc-900/80" />

      {/* Tarjeta Central del Login */}
      <main className="relative z-10 w-full max-w-md p-6 sm:p-8 mx-4 bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-md">
        
        {/* Encabezado con Logos */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center gap-6 mb-3">
            {/* Si no tienes las imágenes locales, usa img directo o los componentes de Next.js */}
            <img src="/logo-falcon.png" alt="Gobernación del Estado Falcón" className="h-12 w-auto object-contain" />
            <img src="/logo-serdefalca.png" alt="SERDEFALCA Logo" className="h-12 w-auto object-contain" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-emerald-900 uppercase">
            SERDEFAL C.A
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-zinc-500 tracking-wider uppercase mt-0.5">
            Sistema Regional de Gestión de Desechos Sólidos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Campo Correo */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@serdefalca.gob.ve"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Mensaje de Error en Pantalla */}
          {errorMsj && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center animate-shake">
              {errorMsj}
            </div>
          )}

          {/* Botón de Iniciar Sesión */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-900/20 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {cargando ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Verificando...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}