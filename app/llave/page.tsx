"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PaginaLlave() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState(""); // <-- Nuevo estado
  const [cedula, setCedula] = useState("");     // <-- Nuevo estado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [llaveSecreta, setLlaveSecreta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarSuperUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    if (llaveSecreta !== "MI_CODIGO_SECRETO_123") {
      setMensaje("❌ Acceso denegado: La llave ingresada es incorrecta.");
      setCargando(false);
      return;
    }

    // PASO 1: Registrar en la Autenticación de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'super usuario' // Ajustado al nombre exacto de tu base de datos
        }
      }
    });

    if (authError) {
      setMensaje(`❌ Error al crear credenciales: ${authError.message}`);
      setCargando(false);
      return;
    }

    // PASO 2: Guardamos en tu nueva tabla 'usuarios'
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert([
          {
            id_usuario: authData.user.id,
            nombre: nombre,
            apellido: apellido,
            cedula: cedula,
            correo: email,
            rol: 'super usuario' // Rol exacto
            // fecha_de_ingreso se pondrá automáticamente gracias al DEFAULT CURRENT_DATE de la BD
          }
        ]);

      if (dbError) {
        setMensaje(`⚠️ Se creó el acceso, pero hubo un error al guardar en la tabla: ${dbError.message}`);
      } else {
        setMensaje("✅ ¡Súper usuario creado con éxito y registrado en la base de datos principal!");
        setNombre("");
        setApellido("");
        setCedula("");
        setEmail("");
        setPassword("");
        setLlaveSecreta("");
      }
    }
    setCargando(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>🗝️ Acceso de Súper Usuario</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
        Página restringida para la creación del Administrador Principal.
      </p>

      <form onSubmit={registrarSuperUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>

        <input type="text" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <input type="password" placeholder="Llave maestra del sistema" value={llaveSecreta} onChange={(e) => setLlaveSecreta(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <button type="submit" disabled={cargando} style={{ padding: '10px', background: cargando ? '#999' : '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: cargando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {cargando ? 'Procesando...' : 'Registrar Súper Usuario'}
        </button>
      </form>

      {mensaje && (
        <div style={{ marginTop: '20px', padding: '15px', textAlign: 'center', borderRadius: '5px', background: mensaje.includes('✅') ? '#d4edda' : '#f8d7da', color: mensaje.includes('✅') ? '#155724' : '#721c24' }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}