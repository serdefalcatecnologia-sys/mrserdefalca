"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setCargando(true);

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("Credenciales inválidas o usuario no registrado.");
      }

      if (data.user) {
        // 2. Verificar rol en la tabla usuarios
        const { data: usuarioData, error: userError } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id_usuario", data.user.id)
          .single();

        if (userError || !usuarioData) {
          throw new Error("No se encontraron los datos del perfil en la base de datos.");
        }

        // 3. Validar permisos de acceso al área administrativa
        if (usuarioData.rol === "administrador") {
          router.push("/admin");
          router.refresh();
        } else {
          setErrorMsg("Su cuenta no cuenta con privilegios de administrador.");
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al intentar iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-zinc-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">Portal SERDEFALCA</h1>
          <p className="mt-1 text-xs text-zinc-500">Sistema Regional de Gestión de Desechos Sólidos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@serdefalca.com"
              className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-xs font-medium text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {cargando ? "Iniciando sesión..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}