"use client";

import { useState, useTransition } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
          } else if (rol === "desechos") {
            setErrorMsg("Acceso denegado: El rol \"desechos\" no está configurado en el sistema.");
            await supabase.auth.signOut();
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
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-200">
      
      {/* Fondo de pantalla usando imagen1.png */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('/imagen1.png')" }} 
      />
      <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-[2px]" />

      {/* Tarjeta de Login Principal */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] p-8 sm:p-10 mb-8">
        
        {/* Cabecera con Logo */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo1.png" alt="SERDEFALCA" className="h-14 w-auto object-contain" />
        </div>

        {/* Título y Subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-emerald-800 tracking-wide mb-2">SERDEFAL, C.A</h1>
          <p className="text-[13px] text-zinc-500 leading-snug px-4">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="serdefalcatecnologia@gmail.com"
              className="w-full rounded-xl border border-zinc-200 bg-[#f4f7fb] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-600 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-[#f4f7fb] pl-4 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-3 text-center text-xs text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 rounded-xl bg-[#009b62] hover:bg-[#008050] text-white py-3 px-4 text-sm font-medium transition-all disabled:opacity-50"
          >
            {isPending ? "Validando..." : "Ingresar al Sistema"}
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] text-zinc-400 leading-relaxed">
          <p>© 2026 Gobernación del Estado Falcón.</p>
          <p>Trabajando por un estado más limpio.</p>
        </div>
      </div>

      {/* Pie de página exterior */}
      <div className="absolute bottom-0 w-full bg-zinc-200/90 backdrop-blur-sm py-2 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-zinc-600 border-t border-zinc-300">
        <p>© Gobernación del Estado Falcón. Trabajando por un estado más limpio.</p>
        <div className="flex items-center gap-3 font-semibold">
          <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span className="ml-1">SERDEFAL_VE</span>
          </div>
        </div>
      </div>
    </div>
  );
}