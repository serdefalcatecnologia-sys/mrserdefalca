// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // 1. Autenticación contra Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Consulta del rol en la tabla de usuarios
        const { data: perfil, error: perfilError } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id_usuario", authData.user.id)
          .single();

        if (perfilError) throw new Error("No se pudo obtener la información del rol.");

        const rol = perfil?.rol?.toLowerCase().trim();

        // 3. Enrutamiento dinámico según el rol
        if (rol === "administrador") {
          router.push("/admin");
        } else if (rol === "comercial") {
          router.push("/comercial");
        } else if (rol === "desechos") {
          router.push("/desechos");
        } else if (rol === "flota") {
          router.push("/admin/flota");
        } else {
          setError("Acceso denegado: Rol no reconocido.");
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas o error de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/imagen1.png')" }}
    >
      {/* Capa de contraste semitransparente */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>

      {/* Tarjeta de Inicio de Sesión */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl relative z-10 border border-white/20">
        <div className="text-center mb-6 flex flex-col items-center">
          {/* Contenedor optimizado para logos horizontales */}
          <div className="relative w-64 h-20 mb-2">
            <Image 
              src="/logo1.png" 
              alt="Logo Serdefalca" 
              fill 
              className="object-contain"
              priority 
            />
          </div>
          <h1 className="text-3xl font-black text-emerald-800 tracking-wider">SERDEFAL C.A</h1>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-1">
            Sistema Regional de Gestión de Desechos Sólidos
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3.5 rounded-xl border border-zinc-300 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-zinc-800 transition-all text-sm"
              placeholder="usuario@serdefalca.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3.5 rounded-xl border border-zinc-300 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-zinc-800 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-emerald-700 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-emerald-900/20"
          >
            {cargando ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}