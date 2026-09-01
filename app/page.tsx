"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg("Credenciales incorrectas o usuario no registrado.");
          return;
        }

        // Obtener el rol del usuario desde la base de datos para redirigir
        const user = data.user;
        if (user) {
          const { data: perfil } = await supabase
            .from("usuarios")
            .select("rol")
            .eq("id", user.id)
            .single();

          const rol = perfil?.rol || "admin";

          if (rol === "comercial") {
            router.push("/admin/comercializacion");
          } else if (rol === "transportista" || rol === "flota") {
            router.push("/admin/flota");
          } else if (rol === "pesaje") {
            router.push("/admin/pesaje");
          } else {
            router.push("/admin");
          }
          router.refresh();
        }
      } catch (err) {
        setErrorMsg("Ocurrió un error inesperado al iniciar sesión.");
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-900 overflow-hidden px-4">
      {/* Fondo decorativo difuminado */}
      <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950/80 via-zinc-900/90 to-emerald-950/70" />

      {/* Tarjeta de Login Principal */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-8 sm:p-10 backdrop-blur-xl">
        
        {/* Cabecera con Logos */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <img src="/logo1.png" alt="Gobierno de Falcón" className="h-12 w-auto object-contain" />
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
          <img src="/logo2.png" alt="SERDEFALCA" className="h-10 w-auto object-contain" />
        </div>

        {/* Títulos */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">SERDEFALCA</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">
            Sistema Central de Monitoreo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@serdefalca.com"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 text-sm shadow-lg shadow-emerald-700/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? "Validando acceso..." : "Ingresar al Sistema"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>
      </div>
    </div>
  );
}