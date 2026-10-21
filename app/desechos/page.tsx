"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DesechosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }

      setUsuario(user);
      setCargando(false);
    };

    verificarSesion();
  }, [router]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-white">
        Cargando módulo de Desechos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8 dark:bg-zinc-900 dark:text-white">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-md dark:bg-zinc-800">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Módulo de Gestión de Desechos Sólidos
          </h1>
          <button
            onClick={handleCerrarSesion}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-6">
          <p className="text-gray-700 dark:text-gray-300">
            Bienvenido al panel operativo de recolección y control de desechos.
          </p>
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Usuario activo: <strong>{usuario?.email}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}