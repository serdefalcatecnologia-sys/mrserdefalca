"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargandoRol, setCargandoRol] = useState(true);

  useEffect(() => {
    async function verificarAcceso() {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        router.push("/");
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id_usuario", authData.session.user.id)
        .single();

      const rolNorm = usuario?.rol?.toLowerCase().trim() || "";
      setRolUsuario(rolNorm);

      // Restricción estricta de rutas para roles no-administradores
      if (rolNorm === "comercial" && !pathname.startsWith("/admin/comercial")) {
        router.push("/admin/comercial");
      } else if (rolNorm === "flota" && !pathname.startsWith("/admin/flota")) {
        router.push("/admin/flota");
      } else if (rolNorm === "desechos" && !pathname.startsWith("/admin/desechos")) {
        router.push("/admin/desechos");
      }

      setCargandoRol(false);
    }

    verificarAcceso();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (cargandoRol) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-emerald-600 font-semibold text-sm animate-pulse">
          Verificando permisos de acceso...
        </p>
      </div>
    );
  }

  const esAdmin = rolUsuario === "administrador" || rolUsuario === "admin" || rolUsuario === "super usuario";

  // Si el usuario pertenece a una categoría operativa, sólo ve el contenido del reporte/formulario sin menú administrativo
  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="flex justify-between items-center bg-white dark:bg-zinc-900 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h1 className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
            SERDEFALCA - Módulo Operativo
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  // Vista completa con menú lateral para administradores
  const menuItems = [
    {
      name: "Panel Principal",
      href: "/admin",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Registro de Empleados",
      href: "/admin/empleados/registro",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      name: "Visualización de Empleados",
      href: "/admin/empleados",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Vista Comercialización",
      href: "/admin/comercial",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Vista Flota de Rutas",
      href: "/admin/flota",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "Control de Desechos",
      href: "/admin/desechos",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      name: "Configuración",
      href: "/admin/configuracion",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950">
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shrink-0">
        <div>
          <div className="mb-8 p-2">
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">SERDEFALCA</h2>
            <p className="text-xs text-slate-400">Sistema Administrativo</p>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const activo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activo
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-xl transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}