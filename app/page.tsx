'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Asegúrate de que esta ruta apunte a tu configuración de Supabase
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
      // 1. Autenticar al usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw new Error('Correo o contraseña incorrectos.')

      if (authData.session) {
        const userEmail = authData.session.user.email

        // 2. Buscar el rol del usuario en la base de datos
        const { data: usuario, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('correo', userEmail)
          .single()

        if (userError || !usuario || !usuario.rol) {
          throw new Error('El usuario no tiene un rol asignado en el sistema.')
        }

        const rol = usuario.rol.toLowerCase().trim()

        // 3. Control de Acceso y Redirección
        // El correo de tecnología o el rol de administrador tienen acceso maestro
        if (rol === 'administrador' || userEmail === 'serdefalcatecnologia@gmail.com') {
          router.push('/admin') 
        } 
        // Personal Comercial: Registro de facturas
        else if (rol === 'comercial') {
          router.push('/admin/comercial')
        } 
        // Personal de Flota: Registro de vehículos
        else if (rol === 'flota') {
          router.push('/admin/flota')
        } 
        // Personal de Desechos: Registro de tipos de desechos
        else if (rol === 'desechos') {
          router.push('/admin/desechos')
        } 
        else {
          throw new Error(`El rol "${rol}" no es válido.`)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center relative"
      // Aquí se carga tu imagen de fondo desde la carpeta public
      style={{ backgroundImage: "url('/imagen1.png')" }} 
    >
      {/* Capa oscura semitransparente para resaltar la tarjeta de login */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"></div>

      {/* Contenedor principal de la tarjeta */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
        
        {/* Logos institucionales */}
        <div className="flex justify-center gap-6 mb-4 items-center">
          {/* Asegúrate de que el nombre de los logos coincida con tu carpeta public */}
          <img src="/logo1.png" alt="Falcón" className="h-12 object-contain" />
          <img src="/logo-serdefalca.png" alt="Serdefalca" className="h-12 object-contain" />
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
            <label className="block text-sm text-gray-600 mb-1 font-medium">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-shadow"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
              />
              {/* Icono decorativo de contraseña */}
              <button 
                type="button" 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Manejo de Errores */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008f5d] hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 shadow-md"
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