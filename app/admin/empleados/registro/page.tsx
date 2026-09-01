"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegistroEmpleados() {
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("comercial");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  
  const router = useRouter();

  const handleCrearEmpleado = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        setMensaje({ texto: "❌ Error al crear credenciales: " + (authError?.message || ""), tipo: "error" });
        setCargando(false);
        return;
      }

      // CORREGIDO: Se usa 'nombre' y 'apellido' en singular para coincidir exactamente con tu base de datos
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          id_usuario: authData.user.id,
          cedula,
          telefono,
          nombre: nombres,
          apellido: apellidos,
          correo: email,
          rol,
        },
      ]);

      if (dbError) {
        setMensaje({ texto: "❌ Error al guardar datos en la tabla usuarios: " + dbError.message, tipo: "error" });
      } else {
        setMensaje({ texto: "✅ Empleado registrado con éxito.", tipo: "exito" });
        setCedula("");
        setTelefono("");
        setNombres("");
        setApellidos("");
        setEmail("");
        setPassword("");
        setRol("comercial");
      }
    } catch (err) {
      setMensaje({ texto: "❌ Ocurrió un error inesperado.", tipo: "error" });
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">
            ← Volver al Menú Principal
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-emerald-800">Alta de Personal y Asignación de Roles</h1>
          <p className="mt-1 text-xs text-zinc-500">Registra al nuevo operador para darle acceso a su módulo correspondiente.</p>

          <form onSubmit={handleCrearEmpleado} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">Cédula de Identidad *</label>
                <input
                  type="text"
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej: 21357148"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">Teléfono *</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 04123571468"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">Nombres *</label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Nombres del empleado"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos del empleado"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">Correo Electrónico (Para Login) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@serdefalca.com"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">Contraseña Provisional *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700">Rol / Módulo Asignado *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="administrador">Administrador del Sistema (Acceso Total)</option>
                <option value="comercial">Operador de Comercialización y Facturación</option>
                <option value="flota">Operador de Flota de Rutas</option>
                <option value="desechos">Operador de Control de Desechos</option>
              </select>
            </div>

            {mensaje.texto && (
              <div className={`rounded-lg p-3 text-center text-xs font-medium ${
                mensaje.tipo === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}>
                {mensaje.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                cargando ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {cargando ? 'Registrando en el sistema...' : 'Guardar y Registrar Empleado'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}