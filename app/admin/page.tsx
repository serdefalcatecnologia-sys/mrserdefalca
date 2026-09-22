import Link from 'next/link';

export default function AdminDashboardPage() {
  const modulos = [
    {
      titulo: "1. Registro de Empleados",
      desc: "Dar de alta nuevo personal y asignar roles al sistema.",
      href: "/admin/empleados/registro",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      )
    },
    {
      titulo: "2. Visualización de Empleados",
      desc: "Directorio general y control de la plantilla de trabajo.",
      href: "/admin/empleados/lista",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      )
    },
    {
      titulo: "3. Vista de Comercialización",
      desc: "Monitoreo de ingresos, taquilla y todos los registros financieros.",
      href: "/admin/comercial",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      )
    },
    {
      titulo: "4. Vista Flota de Rutas",
      desc: "Supervisión de camiones, tonelajes y estatus logístico.",
      href: "/admin/flota",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
      )
    },
    {
      titulo: "5. Visualización de Desechos",
      desc: "Historial y tabla general de desechos procesados.",
      href: "/admin/desechos",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      )
    },
    {
      titulo: "6. Configuración",
      desc: "Mantenimiento, perfiles y parámetros del sistema.",
      href: "/admin/configuracion",
      icono: (
        <svg className="w-8 h-8 text-[#008f5d] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-50 p-8 flex flex-col items-center">
      <h1 className="text-xl font-bold text-zinc-700 mb-8 mt-4">Seleccione el módulo de administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {modulos.map((mod, i) => (
          <Link key={i} href={mod.href}>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer h-full">
              {mod.icono}
              <h2 className="text-sm font-bold text-zinc-800 mb-2">{mod.titulo}</h2>
              <p className="text-xs text-zinc-500">{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}