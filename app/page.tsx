"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError("❌ Correo o contraseña incorrectos.");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id_usuario", authData.user.id)
        .single();

      if (userError || !userData) {
        setError("❌ Error al verificar los permisos en la base de datos.");
        await supabase.auth.signOut();
        return;
      }

      const rolEmpleado = userData.rol?.toLowerCase().trim();

      if (rolEmpleado === "administrador" || rolEmpleado === "admin" || rolEmpleado === "super usuario") {
        router.push("/admin");
      } else if (rolEmpleado === "comercial") {
        router.push("/comercial");
      } else if (rolEmpleado === "flota") {
        router.push("/flota");
      } else if (rolEmpleado === "desechos") {
        router.push("/desechos");
      } else {
        setError(`⛔ Acceso denegado: El rol "${userData.rol}" no está configurado.`);
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError("❌ Ocurrió un error inesperado de red.");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-900 p-4">
      {/* Fondo de pantalla */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/imagen1.png"
          alt="Fondo Serdefalca"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Tarjeta de Login */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo1.png"
            alt="Logo Serdefalca"
            width={180}
            height={60}
            className="h-auto w-auto object-contain"
          />
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-emerald-800">
          SERDEFAL C.A.
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@serdefalca.gob.ve"
              className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
              className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
              cargando ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {cargando ? "Verificando credenciales..." : "Ingresar al Sistema"}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-zinc-400">
          © 2026 Gobernación del Estado Falcón. Trabajando por un estado más limpio.
        </p>
      </div>
    </div>
  );
}