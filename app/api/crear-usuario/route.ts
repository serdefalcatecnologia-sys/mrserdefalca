import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, cedula, telefono, nombres, apellidos, rol } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Faltan credenciales de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Crear usuario en Auth de Supabase sin alterar la sesión cliente actual
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Error al crear credenciales.");
    }

    // 2. Insertar información del empleado en la tabla pública "usuarios"
    const { error: dbError } = await supabaseAdmin.from("usuarios").insert([
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
      throw new Error("El usuario se autenticó, pero falló al guardar en la base de datos: " + dbError.message);
    }

    return NextResponse.json(
      { success: true, message: "Empleado registrado exitosamente." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}