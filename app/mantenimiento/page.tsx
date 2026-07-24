"use client";

import Image from "next/image";
import Link from "next/link";

export default function MantenimientoPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 font-sans text-center relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image src="/imagen1.png" alt="Fondo SERDEFALCA" fill className="object-cover" />
      </div>

      <div className="relative z-10 max-w-lg bg-zinc-950/80 backdrop-blur-md p-10 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-amber-500 tracking-tight mb-4">SISTEMA EN MANTENIMIENTO</h1>
        
        <p className="text-zinc-300 text-lg mb-6 leading-relaxed">
          El portal de operaciones de <span className="font-bold text-white">SERDEFALCA</span> se encuentra temporalmente fuera de servicio por labores de actualización y sincronización de bases de datos.
        </p>

        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 mb-8">
          <p className="text-sm text-zinc-400">
            Agradecemos su paciencia. El equipo técnico de la sede central en Coro está trabajando para restablecer el servicio a la brevedad posible.
          </p>
        </div>

        <Link href="/" className="inline-block px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-colors border border-zinc-700">
          Intentar Nuevamente
        </Link>
      </div>
    </div>
  );
}