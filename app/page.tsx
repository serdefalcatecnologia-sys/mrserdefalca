'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [identificador, setIdentificador] = useState('') // Guarda el usuario, cédula o correo
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let emailParaAuth = identificador

      // Si el texto no contiene "@", asumimos que ingresó una Cédula o Usuario
      if (!identificador.includes('@')) {
        const { data, error: fetchError } = await supabase
          .from('usuarios')
          .select('correo')
          .eq('cedula', identificador) // Asegúrate de que la columna se llame 'cedula' en tu tabla
          .single()

        if (fetchError || !data) {
          setError('Cédula o usuario no encontrado en el sistema.')
          setLoading(false)
          return
        }
        
        // Asignamos el correo encontrado en la base de datos
        emailParaAuth = data.correo
      }

      // Iniciar sesión en Supabase con el correo (ingresado o encontrado) y la contraseña
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailParaAuth,
        password: password,
      })

      if (authError) {
        setError('Contraseña incorrecta.')
      } else {
        // Si es exitoso, redirigir al panel administrativo
        router.push('/dashboard') 
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al intentar conectar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: "url('/imagen1.jpg')" }} // Llama a public/imagen1.jpg
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md">
        
        {/* Logo de la empresa */}
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo1.png" // Llama a public/logo1.png
            alt="Logo Serdefalca" 
            width={120} 
            height={120} 
            priority
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Portal Serdefalca
        </h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario o Cédula
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="Ej: V-00000000 o correo"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md disabled:bg-blue-400"
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}