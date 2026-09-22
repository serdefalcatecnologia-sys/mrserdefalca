"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <header className="bg-emerald-800 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-lg">SERDEFALCA</span>
            <span className="text-xs bg-emerald-700 px-2.5 py-1 rounded-full text-emerald-100 font-medium">
              Panel Administrativo
            </span>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="text-xs bg-emerald-900 hover:bg-emerald-950 px-3 py-2 rounded-lg font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}