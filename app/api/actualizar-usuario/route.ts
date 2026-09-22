import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { idUsuario, password, rol } = body;

    if (!idUsuario) {
      return NextResponse.json({ error: "Se requiere el ID del usuario." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Faltan credenciales en el servidor." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Actualizar contraseña si fue proporcionada
    if (password && password.trim() !== "") {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(idUsuario, {
        password: password,
      });

      if (authError) {
        throw new Error("Error al cambiar la contraseña: " + authError.message);
      }
    }

    // 2. Actualizar rol en la tabla usuarios si fue especificado
    if (rol) {
      const { error: dbError } = await supabaseAdmin
        .from("usuarios")
        .update({ rol })
        .eq("id_usuario", idUsuario);

      if (dbError) {
        throw new Error("Error al actualizar la tabla de usuarios: " + dbError.message);
      }
    }

    return NextResponse.json({ success: true, message: "Usuario actualizado correctamente." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}