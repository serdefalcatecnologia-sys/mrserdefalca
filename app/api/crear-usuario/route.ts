import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol } = await request.json();

    // Crear usuario en Auth sin cerrar la sesión actual del administrador
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Registrar los datos complementarios en la tabla de usuarios
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert([
        {
          id_usuario: authData.user.id,
          nombre,
          email,
          rol,
        },
      ]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}