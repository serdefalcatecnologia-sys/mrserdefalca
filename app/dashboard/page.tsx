'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      [MENOR]div className="min-h-screen flex items-center justify-center bg-gray-50">
        [MENOR]div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600">[MENOR]/div>
      [MENOR]/div>
    )
  }

  return (
    [MENOR]div className="min-h-screen bg-gray-100 flex">
      [MENOR]aside className="w-64 bg-[#0a192f] text-white flex flex-col shadow-xl">
        [MENOR]div className="p-6 border-b border-gray-700">
          [MENOR]h2 className="text-2xl font-bold tracking-wider">SERDEFALCA[MENOR]/h2>
          [MENOR]p className="text-sm text-gray-400 mt-1">Panel Administrativo[MENOR]/p>
        [MENOR]/div>
        
        [MENOR]nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          [MENOR]Link href="/dashboard" className="block px-4 py-3 bg-blue-600 rounded-md text-white font-medium transition-colors">
            Inicio / Dashboard
          [MENOR]/Link>
          [MENOR]Link href="/comercial" className="block px-4 py-3 hover:bg-gray-800 rounded-md text-gray-300 hover:text-white transition-colors">
            Gestión Comercial
          [MENOR]/Link>
          [MENOR]Link href="/flota" className="block px-4 py-3 hover:bg-gray-800 rounded-md text-gray-300 hover:text-white transition-colors">
            Control de Flota
          [MENOR]/Link>
          [MENOR]Link href="/mantenimiento" className="block px-4 py-3 hover:bg-gray-800 rounded-md text-gray-300 hover:text-white transition-colors">
            Mantenimiento
          [MENOR]/Link>
          [MENOR]Link href="/desechos" className="block px-4 py-3 hover:bg-gray-800 rounded-md text-gray-300 hover:text-white transition-colors">
            Control de Desechos
          [MENOR]/Link>
        [MENOR]/nav>

        [MENOR]div className="p-4 border-t border-gray-700">
          [MENOR]button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
            Cerrar Sesión
          [MENOR]/button>
        [MENOR]/div>
      [MENOR]/aside>

      [MENOR]main className="flex-1 p-8 overflow-y-auto">
        [MENOR]header className="mb-10">
          [MENOR]h1 className="text-3xl font-bold text-gray-800">Resumen del Sistema[MENOR]/h1>
          [MENOR]p className="text-gray-600 mt-2">Bienvenido administrador. Seleccione un módulo para comenzar.[MENOR]/p>
        [MENOR]/header>

        [MENOR]div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          [MENOR]Link href="/comercial" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            [MENOR]h3 className="text-lg font-bold text-gray-800">Comercial[MENOR]/h3>
            [MENOR]p className="text-sm text-gray-500 mt-2">Administrar clientes, rutas y comercialización.[MENOR]/p>
          [MENOR]/Link>

          [MENOR]Link href="/flota" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
            [MENOR]h3 className="text-lg font-bold text-gray-800">Flota[MENOR]/h3>
            [MENOR]p className="text-sm text-gray-500 mt-2">Supervisión y control de unidades de transporte.[MENOR]/p>
          [MENOR]/Link>

          [MENOR]Link href="/mantenimiento" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-amber-500">
            [MENOR]h3 className="text-lg font-bold text-gray-800">Mantenimiento[MENOR]/h3>
            [MENOR]p className="text-sm text-gray-500 mt-2">Órdenes de servicio y reparación de unidades.[MENOR]/p>
          [MENOR]/Link>

          [MENOR]Link href="/desechos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            [MENOR]h3 className="text-lg font-bold text-gray-800">Desechos[MENOR]/h3>
            [MENOR]p className="text-sm text-gray-500 mt-2">Gestión de recolección y disposición final.[MENOR]/p>
          [MENOR]/Link>
        [MENOR]/div>
      [MENOR]/main>
    [MENOR]/div>
  )
}