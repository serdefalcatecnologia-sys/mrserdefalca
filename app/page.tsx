'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; // Asegúrate de que esta ruta apunte a tu cliente de Supabase

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Autenticar con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('No se pudo obtener el usuario.');

      // 2. Consultar el rol del usuario en tu tabla personalizada (ej. 'usuarios' o 'profiles')
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios') // Cambia 'usuarios' por el nombre real de tu tabla de roles
        .select('rol')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('No se encontró el rol asignado para este usuario.');
      }

      const rol = profileData.rol?.toLowerCase();

      // 3. Redirección dinámica basada estricamente en el rol
      switch (rol) {
        case 'administrador':
          router.push('/admin');
          break;
        case 'comercial':
          router.push('/comercial');
          break;
        case 'desechos':
          router.push('/desechos'); // Ajusta la ruta según tu estructura de carpetas
          break;
        default:
          router.push('/');
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-login">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          {/* Asegúrate de que logo1.png esté en la carpeta public */}
          <img src="/logo1.png" alt="Logo" className="h-20 object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Portal Serdefalca</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email5"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}