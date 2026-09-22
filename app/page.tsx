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
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-950 p-8 rounded-2xl shadow-2xl border border-zinc-800 text-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-wider text-emerald-500">SERDEFALCA</h1>
          <p className="text-xs text-zinc-400 mt-1">Sistema Integrado de Gestión Operativa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="usuario@serdefalca.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg text-center font-semibold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {cargando ? "Iniciando sesión..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}