// cSpell:disable
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export async function POST(request: Request) {
  try {
    // Recibimos todos los datos que envías desde el formulario del frontend
    const { cedula, telefono, nombres, apellidos, email, password, rol } = await request.json();

    // 1. Crear el usuario en Supabase Auth sin cerrar la sesión del administrador
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2. Registrar los datos personales en tu tabla pública de 'usuarios'
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id: authData.user.id, // Vincula el registro con el ID único de Auth
          cedula: cedula,
          telefono: telefono,
          nombres: nombres,
          apellidos: apellidos,
          correo: email,
          rol: rol
        }
      ]);

    if (dbError) throw dbError;

    // Si todo sale bien, responde con éxito
    return NextResponse.json({ success: true, user: authData.user });
    
  } catch (error: any) {
    // Captura cualquier error (ya sea de Auth o de la base de datos)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}