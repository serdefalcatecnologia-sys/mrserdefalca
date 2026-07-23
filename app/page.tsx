"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 1. Inicializamos Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  // 2. Creamos los estados para guardar lo que el usuario escribe
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  
  // Estado para mostrar/ocultar la contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  // 3. Inicializamos el enrutador para poder cambiar de página
  const router = useRouter();

  // 4. Función maestra que se ejecuta al darle al botón
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setCargando(true);
    setError("");

    // Paso A: Autenticar al usuario en Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setError("❌ Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    // Paso B: Verificar ROL en tu tabla
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

      // Paso C: Filtro de seguridad (Solo admin y super usuario)
      if (userData.rol === 'super usuario' || userData.rol === 'admin') {
        router.push('/admin'); 
      } else {
        setError("⛔ Acceso denegado: Esta área es exclusiva para administradores.");
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
          alt="Fondo de recolección y reciclaje Serdefalca"
          fill
          sizes="100vw" /* 👈 Agregado para que no se queje Next.js */
          className="object-cover opacity-40"
          priority
        />
      </div>

      {/* Tarjeta de Inicio de Sesión */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:bg-zinc-950/90 sm:p-10">
        
        {/* Encabezado y Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-6 h-20 w-full max-w-[200px]">
            <Image
              src="/logo1.png"
              alt="Logo Oficial Serdefalca"
              fill
              sizes="(max-width: 768px) 200px, 200px" /* 👈 Agregado para optimizar el logo */
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

        {/* Formulario conectado a la función handleLogin */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 pr-12 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
              />
              
              {/* Botón del ojito */}
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Caja de mensajes de error */}
          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 text-center dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Botón de Acción configurado como 'submit' */}
          <button
            type="submit"
            disabled={cargando}
            className={`mt-2 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
              cargando ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
            }`}
          >
            {cargando ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

        {/* Pie de página */}
        <div className="mt-8 border-t border-zinc-200 pt-6 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Gobernación del Estado Falcón. <br />
            Trabajando por un estado más limpio.
          </p>
        </div>
        
      </div>
    </div>
  );
}
