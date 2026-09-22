import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idUsuario = searchParams.get("id");

    if (!idUsuario) {
      return NextResponse.json({ error: "Falta el ID del usuario a eliminar." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Faltan credenciales de servidor." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Eliminar acceso de Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(idUsuario);
    if (authError) {
      throw new Error("Error al borrar credenciales de acceso: " + authError.message);
    }

    // 2. Eliminar registro de la tabla pública
    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id_usuario", idUsuario);

    if (dbError) {
      throw new Error("Error al borrar registro de la base de datos: " + dbError.message);
    }

    return NextResponse.json({ success: true, message: "Empleado eliminado definitivamente." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}