import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-zinc-700">Seleccione el módulo de administración</h2>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Registro de Empleados */}
        <Link href="/admin/empleados/registro" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">1. Registro de Empleados</h3>
            <p className="text-sm text-zinc-500">Dar de alta nuevo personal y asignar roles al sistema.</p>
          </div>
        </Link>

        {/* 2. Visualización de Empleados */}
        <Link href="/admin/empleados" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">2. Visualización de Empleados</h3>
            <p className="text-sm text-zinc-500">Directorio general y control de la plantilla de trabajo.</p>
          </div>
        </Link>

        {/* 3. Vista de Comercialización */}
        <Link href="/admin/comercializacion" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">3. Vista de Comercialización</h3>
            <p className="text-sm text-zinc-500">Monitoreo de ingresos, taquilla y todos los registros financieros.</p>
          </div>
        </Link>

        {/* 4. Vista Flota de Rutas */}
        <Link href="/admin/rutas" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">4. Vista Flota de Rutas</h3>
            <p className="text-sm text-zinc-500">Supervisión de camiones, tonelajes y estatus logístico.</p>
          </div>
        </Link>

        {/* 5. NUEVO: Registro de Desechos */}
        <Link href="/desechos/registro" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">5. Registro de Desechos</h3>
            <p className="text-sm text-zinc-500">Dar de alta ingresos de camiones al botadero.</p>
          </div>
        </Link>

        {/* 6. NUEVO: Visualización de Desechos */}
        <Link href="/admin/desechos" className="block rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mb-2 font-bold text-zinc-800">6. Visualización de Desechos</h3>
            <p className="text-sm text-zinc-500">Historial y tabla general de desechos procesados.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}