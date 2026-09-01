"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Importación corregida
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verificarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSesion(session);
      setCargando(false);

      // Redirección si no hay sesión y no está en la página de login
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
    };

    verificarSesion();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (cargando) {
    return (
      <html lang="es">
        <body className="flex items-center justify-center min-h-screen dark:bg-zinc-900">
          <p className="text-white">Cargando módulos...</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className="dark:bg-zinc-900 text-slate-100">
        {/* Aquí puedes incluir tu menú lateral/navegación si hay sesión */}
        {sesion && pathname !== '/login' ? (
          <div className="flex h-screen">
            <aside className="w-64 bg-zinc-800 p-4">
              {/* Navegación del Dashboard */}
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}