import React from 'react';

// --- DATOS DE PRUEBA (MOCKS) BASADOS EN TUS IMÁGENES ---

const mockFlota = [
  { id: 'REP-001', fecha: '2026-07-15 08:30', unidad: 'COMP-01', chofer: 'Carlos Pérez', ruta: 'Eje Central - Colina', toneladas: 12.5, estatus: 'Operativo' },
  { id: 'REP-002', fecha: '2026-07-15 09:15', unidad: 'VOLQ-03', chofer: 'Luis Gómez', ruta: 'Eje Occidente', toneladas: 8.2, estatus: 'Mantenimiento' },
  { id: 'REP-003', fecha: '2026-07-14 15:45', unidad: 'COMP-02', chofer: 'José Silva', ruta: 'Eje Sur - Falcón', toneladas: 14.1, estatus: 'Operativo' },
];

const mockComercial = [
  { id: 'TR-105', fecha: '2026-07-15 10:20', rif: 'J-30123456-7', tramite: 'Cobranza', tipo: 'Comercial', divisas: 150.00, bs: 5400.00, pago: 'Transferencia', estatus: 'Procesado' },
  { id: 'TR-106', fecha: '2026-07-15 11:05', rif: 'V-15123456-0', tramite: 'Nuevo Contrato', tipo: 'Residencial', divisas: 20.00, bs: 720.00, pago: 'Pago Móvil', estatus: 'Pendiente' },
  { id: 'TR-107', fecha: '2026-07-14 14:30', rif: 'J-40987654-1', tramite: 'Cobranza', tipo: 'Jurídico', divisas: 450.00, bs: 16200.00, pago: 'Punto de Venta', estatus: 'Procesado' },
];

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-zinc-100 font-sans dark:bg-zinc-950">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="hidden w-64 flex-col bg-emerald-900 text-white md:flex shadow-xl z-10">
        <div className="flex h-20 items-center justify-center border-b border-emerald-800">
          <h2 className="text-xl font-bold tracking-wider">SERDEFALCA</h2>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-emerald-800 px-4 py-3 text-sm font-medium transition-colors hover:bg-emerald-700">
            {/* Icono Dashboard */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Panel Principal
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Flota y Rutas
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Comercialización
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100 transition-colors hover:bg-emerald-800 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Usuarios y Personal
          </a>
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/50 hover:text-red-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header Superior */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm dark:bg-zinc-900 dark:border-b dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Panel de Administración</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Resumen de Operaciones y Comercialización</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-zinc-600 dark:text-zinc-300 md:block">Admin: María Rodríguez</span>
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
              MR
            </div>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div className="p-8">
          
          {/* Tarjetas de Resumen (KPIs) */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Toneladas Recolectadas (Hoy)</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">34.8 t</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Unidades Operativas</h3>
              <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">12 / 15</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ingresos Divisas (Hoy)</h3>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">$620.00</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Trámites Procesados</h3>
              <p className="mt-2 text-3xl font-bold text-zinc-800 dark:text-zinc-100">45</p>
            </div>
          </div>

          {/* TABLA 1: MÓDULO DE FLOTA Y RUTAS */}
          <div className="mb-8 rounded-xl bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Reportes Recientes: Flota y Rutas</h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">Ver todos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Unidad</th>
                    <th className="px-6 py-3 font-medium">Chofer</th>
                    <th className="px-6 py-3 font-medium">Ruta Ejecutada</th>
                    <th className="px-6 py-3 font-medium">Toneladas</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {mockFlota.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">{item.fecha}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.unidad}</td>
                      <td className="px-6 py-4">{item.chofer}</td>
                      <td className="px-6 py-4">{item.ruta}</td>
                      <td className="px-6 py-4 font-semibold">{item.toneladas} t</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.estatus === 'Operativo' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA 2: MÓDULO DE COMERCIALIZACIÓN */}
          <div className="rounded-xl bg-white shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Transacciones Recientes: Comercialización</h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Cliente (RIF)</th>
                    <th className="px-6 py-3 font-medium">Trámite</th>
                    <th className="px-6 py-3 font-medium">Monto Divisas</th>
                    <th className="px-6 py-3 font-medium">Método Pago</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {mockComercial.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 whitespace-nowrap">{item.fecha}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{item.rif}</td>
                      <td className="px-6 py-4">
                        {item.tramite} <span className="block text-xs text-zinc-400">{item.tipo}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${item.divisas.toFixed(2)} <span className="block text-xs text-zinc-400 font-normal">Bs. {item.bs.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">{item.pago}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.estatus === 'Procesado' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}