"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 1. Inicializamos Supabase utilizando las variables de entorno públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  // 2. Creamos los estados para gestionar los campos del formulario y errores
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // 3. Inicializamos el enrutador para la redirección de páginas
  const router = useRouter();

  // 4. Función principal que procesa el inicio de sesión
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    // Paso A: Autenticar credenciales en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setError("❌ Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    // Paso B: Verificar el rol del usuario en la tabla personalizada 'usuarios'
    if (authData.user) {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id_usuario', authData.user.id)
        .single();

      if (userError || !userData) {
        setError("❌ Error al verificar los permisos en la base de datos.");
        await supabase.auth.signOut();
        setCargando(false);
        return;
      }

      // Paso C: Redirección inteligente basada en el rol del usuario
      const rolEmpleado = userData.rol?.toLowerCase().trim();

      if (rolEmpleado === 'administrador' || rolEmpleado === 'admin' || rolEmpleado === 'super usuario') {
        router.push('/admin');
      } else if (rolEmpleado === 'comercial') {
        router.push('/comercial');
      } else if (rolEmpleado === 'flota') {
        router.push('/flota');
      } else {
        setError(`⛔ Acceso denegado: El rol "${userData.rol}" no está configurado en el sistema.`);
        await supabase.auth.signOut();
      }
    }

    setCargando(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-900 font-sans">
      {/* Imagen de fondo a pantalla completa */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/imagen1.png"
          alt="Fondo institucional"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          priority
        />
      </div>

      {/* Tarjeta de Inicio de Sesión */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:bg-zinc-950/90 sm:p-10">
        
        {/* Encabezado y Logotipo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-6 h-20 w-full max-w-[200px]">
            <Image
              src="/logo1.png"
              alt="Logotipo oficial"
              fill
              sizes="(max-width: 768px) 200px, 200px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Portal Serdefalca
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>

        {/* Formulario de Acceso */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@serdefalca.gob.ve"
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {mostrarPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
          >
            {cargando ? "Iniciando sesión..." : "Ingresar al Sistema"}
          </button>
        </form>

      </div>
    </div>
  );
}