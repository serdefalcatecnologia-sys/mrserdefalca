"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError("Correo o contraseña incorrectos. Verifica tus credenciales.");
        setCargando(false);
        return;
      }

      if (data.session) {
        router.push("/admin");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setCargando(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-zinc-200">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <img 
              src="/logo1.png" 
              alt="Logo Serdefalca" 
              className="h-24 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-[#004d3d]">SERDEFALCA</h1>
          <p className="mt-2 text-sm text-zinc-500">Sistema Central de Monitoreo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@serdefalca.com"
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none transition-colors focus:border-[#004d3d] focus:ring-1 focus:ring-[#004d3d]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none transition-colors focus:border-[#004d3d] focus:ring-1 focus:ring-[#004d3d]"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-[#004d3d] py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#00382c] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {cargando ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Iniciando Sesión...
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}