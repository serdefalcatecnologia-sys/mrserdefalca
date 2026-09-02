"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Asegúrate de usar tus variables de entorno correctas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroFlota() {
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [cedulaConductor, setCedulaConductor] = useState("");
  const [ruta, setRuta] = useState("");
  const [turno, setTurno] = useState("Mañana");
  const [kilometraje, setKilometraje] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Guardando...");

    const { error } = await supabase.from("flota_rutas").insert([
      {
        placa: placa,
        conductor: conductor,
        cedula_conductor: cedulaConductor,
        ruta: ruta,
        turno: turno,
        kilometraje: kilometraje ? parseFloat(kilometraje) : null,
        observaciones: observaciones,
        estatus: "En Ruta", // Por defecto
        tonelaje: 0,        // Inicializado en 0
      },
    ]);

    if (error) {
      console.error(error);
      setMensaje("Error al guardar el registro.");
    } else {
      setMensaje("¡Registro guardado exitosamente!");
      // Limpiar el formulario
      setPlaca(""); setConductor(""); setCedulaConductor("");
      setRuta(""); setKilometraje(""); setObservaciones("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registro de Flota y Rutas</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Placa del Vehículo</label>
            <input type="text" required value={placa} onChange={(e) => setPlaca(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Conductor</label>
            <input type="text" required value={conductor} onChange={(e) => setConductor(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cédula del Conductor</label>
            <input type="text" value={cedulaConductor} onChange={(e) => setCedulaConductor(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ruta / Sector</label>
            <input type="text" required value={ruta} onChange={(e) => setRuta(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Turno</label>
            <select value={turno} onChange={(e) => setTurno(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kilometraje Inicial</label>
            <input type="number" step="0.1" value={kilometraje} onChange={(e) => setKilometraje(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2"></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          Registrar Salida
        </button>

        {mensaje && <p className="mt-4 text-center font-medium text-gray-700">{mensaje}</p>}
      </form>
    </div>
  );
}