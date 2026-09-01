'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Asegúrate de que esta ruta apunte a donde tienes configurado tu cliente de Supabase
import { supabase } from '@/lib/supabase' 

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Autenticar con el módulo de Auth de Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error('Correo o contraseña incorrectos.')

      if (authData.session) {
        // 2. ¡LA CORRECCIÓN ESTÁ AQUÍ! Buscar en la tabla 'usuarios' usando la columna 'correo'
        const { data: usuario, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('correo', authData.session.user.email)
          .single()

        if (userError || !usuario || !usuario.rol) {
          // Si no encuentra el usuario o el rol está vacío
          throw new Error(`El rol "${usuario?.rol}" no tiene un formulario asignado.`)
        }

        // 3. Redirigir según el rol definido en la base de datos
        const rol = usuario.rol.toLowerCase().trim()
        
        switch (rol) {
          case 'administrador':
            router.push('/admin') // Ajusta esta ruta si tu panel de admin es diferente
            break
          case 'comercial':
            router.push('/admin/comercial')
            break
          case 'flota':
            router.push('/admin/flota')
            break
          case 'desechos':
            router.push('/admin/desechos')
            break
          default:
            throw new Error(`El rol "${rol}" no tiene un formulario asignado.`)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Contenedor principal de la tarjeta */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative z-10">
        
        {/* Logos institucionales */}
        <div className="flex justify-center gap-4 mb-4">
          <img src="/logo-falcon.png" alt="Falcón" className="h-12" />
          <img src="/logo-serdefalca.png" alt="Serdefalca" className="h-12" />
        </div>

        {/* Títulos */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-800 tracking-wide mb-1">SERDEFAL, C.A</h1>
          <p className="text-sm text-gray-500 px-4">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder="••••••••"
                required
              />
              {/* Icono de ojito (opcional) */}
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mensaje de error (se muestra solo si hay error) */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008f5d] hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© 2026 Gobernación del Estado Falcón.</p>
          <p>Trabajando por un estado más limpio.</p>
        </div>
      </div>
    </div>
  )
}