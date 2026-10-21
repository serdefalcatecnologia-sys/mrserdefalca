"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Autenticación con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Credenciales inválidas. Verifique su correo y contraseña.");

      if (authData.user) {
        // 2. Consulta de rol en la tabla de usuarios
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("rol")
          .eq("id_usuario", authData.user.id)
          .single();

        if (userError || !userData) {
          throw new Error("El usuario no tiene un rol asignado en la base de datos.");
        }

        const userRol = userData.rol?.toLowerCase();

        // 3. Redirección según rol
        switch (userRol) {
          case "administrador":
          case "admin":
          case "superuser":
            router.push("/admin");
            break;
          case "desechos":
            router.push("/llave");
            break;
          case "comercial":
            router.push("/comercial");
            break;
          case "transporte":
            router.push("/admin/empleados");
            break;
          default:
            setErrorMessage(`Acceso denegado: El rol "${userRol}" no está configurado en el sistema.`);
            break;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center bg-gray-900 p-4">
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
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-100">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Image src="/logo1.png" alt="Serdefalca Logo" width={180} height={60} className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-center text-emerald-900">Portal Serdefalca</h1>
        <p className="text-xs text-center text-gray-500 mt-1 mb-6">
          Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <span>⛔</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-gray-50 text-gray-900 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-700 hover:text-emerald-900"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}