"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Empleado {
  id_usuario: string;
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: string;
}

export default function GestionEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [empleadoEditar, setEmpleadoEditar] = useState<Empleado | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarEmpleados = async () => {
    setCargando(true);
    const { data, error } = await supabase.from("usuarios").select("*");
    if (!error && data) {
      setEmpleados(data);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoEditar) return;

    setProcesando(true);
    try {
      const res = await fetch("/api/actualizar-usuario", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: empleadoEditar.id_usuario,
          password: nuevaPassword,
          rol: nuevoRol,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        alert("Usuario actualizado correctamente.");
        setEmpleadoEditar(null);
        setNuevaPassword("");
        cargarEmpleados();
      }
    } catch (err) {
      alert("Ocurrió un error inesperado al actualizar.");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarEmpleado = async (idUsuario: string) => {
    if (!confirm("¿Deseas eliminar este usuario permanentemente del sistema?")) return;

    try {
      const res = await fetch(`/api/eliminar-usuario?id=${idUsuario}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + data.error);
      } else {
        alert("Empleado eliminado con éxito.");
        cargarEmpleados();
      }
    } catch (err) {
      alert("Ocurrió un error al intentar eliminar el empleado.");
    }
  };

  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.cedula?.includes(busqueda) ||
      emp.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-100 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">
              ← Volver al Menú Principal
            </Link>
            <h1 className="text-2xl font-bold text-zinc-800">Listado y Gestión de Personal</h1>
          </div>
          <Link
            href="/admin/empleados/registro"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            + Registrar Nuevo Empleado
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, apellido o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 p-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-zinc-200">
          {cargando ? (
            <div className="p-8 text-center text-sm text-zinc-500">Cargando usuarios...</div>
          ) : empleadosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">No se encontraron empleados registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-zinc-50 text-zinc-800 uppercase font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="p-4">Cédula</th>
                    <th className="p-4">Nombre Completo</th>
                    <th className="p-4">Correo</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {empleadosFiltrados.map((emp) => (
                    <tr key={emp.id_usuario} className="hover:bg-zinc-50">
                      <td className="p-4 font-semibold">{emp.cedula}</td>
                      <td className="p-4">{emp.nombre} {emp.apellido}</td>
                      <td className="p-4">{emp.correo}</td>
                      <td className="p-4">{emp.telefono}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                          {emp.rol}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEmpleadoEditar(emp);
                            setNuevoRol(emp.rol);
                            setNuevaPassword("");
                          }}
                          className="rounded-md bg-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-300 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarEmpleado(emp.id_usuario)}
                          className="rounded-md bg-red-100 px-3 py-1 font-semibold text-red-600 hover:bg-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {empleadoEditar && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-zinc-800">Editar Empleado</h2>
              <p className="text-xs text-zinc-500 mb-4">{empleadoEditar.nombre} {empleadoEditar.apellido} ({empleadoEditar.correo})</p>

              <form onSubmit={handleGuardarCambios} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Rol Asignado</label>
                  <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-sm text-zinc-800 outline-none focus:border-emerald-600"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="comercial">Comercialización</option>
                    <option value="flota">Flota de Rutas</option>
                    <option value="desechos">Control de Desechos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700">Nueva Contraseña (Opcional)</label>
                  <input
                    type="password"
                    placeholder="Dejar en blanco para mantener actual"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 p-2.5 text-sm text-zinc-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmpleadoEditar(null)}
                    className="rounded-lg bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={procesando}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {procesando ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}