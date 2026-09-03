'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase' 

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
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
        startTransition(() => {
          if (rol === 'administrador' || userEmail === 'serdefalcatecnologia@gmail.com') {
            router.push('/admin') 
          } 
          else if (rol === 'comercial') {
            router.push('/comercial')
          } 
          else if (rol === 'flota') {
            router.push('/admin/flota')
          } 
          else if (rol === 'desechos') {
            // AQUÍ ESTABA EL ERROR: Ahora apunta al formulario correcto
            router.push('/desechos') 
          } 
          else {
            setError(`El rol "${rol}" no es válido.`)
          }
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      
      <Image
        src="/imagen1.png"
        alt="Fondo Serdefalca"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center -z-10"
      />

      <div className="absolute inset-0 bg-black/10 z-0"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] p-6 relative z-10">
        
        <div className="relative flex justify-center mb-3 h-20 w-full">
          <Image 
            src="/logo1.png" 
            alt="Logos Institucionales" 
            fill 
            priority
            className="object-contain" 
          />
        </div>

        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-green-800 tracking-wide mb-0.5">SERDEFAL, C.A</h1>
          <p className="text-[11px] text-gray-500 px-1 leading-tight">
            Sistema Regional de Gestión de Desechos Sólidos del Estado Falcón
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-shadow text-xs"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-xs"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2.5 rounded-lg flex items-center gap-2 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isPending}
            className="w-full bg-[#008f5d] hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-gray-400 shadow-md text-xs mt-1"
          >
            {(loading || isPending) ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-gray-400">
          <p>© 2026 Gobernación del Estado Falcón.</p>
          <p>Trabajando por un estado más limpio.</p>
        </div>
      </div>
    </div>
  )
}