import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { USER_ROLES } from "@/lib/user-roles";

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

    const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return NextResponse.json({ error: "Se requiere iniciar sesión." }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: "La sesión no es válida." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id_usuario", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error al comprobar los permisos del usuario:", profileError);
      return NextResponse.json({ error: "No se pudieron comprobar los permisos." }, { status: 500 });
    }

    if (typeof profile?.rol !== "string" || profile.rol.trim().toLowerCase() !== USER_ROLES.ADMINISTRATOR) {
      return NextResponse.json({ error: "No tienes permisos para eliminar usuarios." }, { status: 403 });
    }

    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    if (targetProfileError) {
      console.error("Error al obtener el registro de usuario:", targetProfileError);
      return NextResponse.json({ error: "No se pudo preparar la eliminación del usuario." }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id_usuario", idUsuario);

    if (dbError) {
      console.error("Error al borrar el registro de usuario:", dbError);
      return NextResponse.json({ error: "No se pudo eliminar el registro del usuario." }, { status: 500 });
    }

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(idUsuario);
    if (deleteAuthError) {
      console.error("Error al borrar credenciales de acceso:", deleteAuthError);

      if (targetProfile) {
        const { error: restoreError } = await supabaseAdmin.from("usuarios").insert(targetProfile);
        if (restoreError) {
          console.error("Error al restaurar el registro de usuario:", restoreError);
          return NextResponse.json(
            { error: "No se pudieron eliminar las credenciales y tampoco restaurar el registro del usuario." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { error: "No se pudieron eliminar las credenciales del usuario; el registro se restauró." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Empleado eliminado definitivamente." }, { status: 200 });
  } catch (error) {
    console.error("Error inesperado al eliminar el usuario:", error);
    return NextResponse.json({ error: "Ocurrió un error al eliminar el usuario." }, { status: 500 });
  }
}