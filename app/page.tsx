"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password,
      });

      if (authError || !authData.session) {
        throw new Error(authError?.message || "Credenciales inválidas.");
      }

      const { data: usuarioData, error: dbError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id_usuario", authData.session.user.id)
        .maybeSingle();

      if (dbError) {
        console.error("Error consultando rol:", dbError);
      }

      const rol = usuarioData?.rol?.toLowerCase().trim() || "administrador";

      if (rol === "administrador") {
        router.push("/admin");
      } else if (rol === "comercial") {
        router.push("/comercial");
      } else if (rol === "flota") {
        router.push("/flota");
      } else if (rol === "desechos") {
        router.push("/desechos");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setErrorMsg("❌ " + (err.message || "Error al iniciar sesión"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans relative bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo.jpg')" }} /* Asegúrate de que el archivo exista en tu carpeta /public */
    >
      {/* Capa oscura semitransparente para que el texto sea legible sobre el fondo */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 text-white">
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Logo restaurado */}
          <img src="/logo1.png" alt="Logo Serdefalca" className="h-24 w-auto mb-4 drop-shadow-md" />
          <h1 className="text-2xl font-extrabold tracking-wider text-emerald-400 drop-shadow-md">SERDEFALCA</h1>
          <p className="text-xs text-zinc-300 mt-1">Sistema Integrado de Gestión Operativa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="usuario@serdefalca.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-zinc-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-lg text-center font-semibold backdrop-blur-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50 mt-2 shadow-lg"
          >
            {cargando ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}