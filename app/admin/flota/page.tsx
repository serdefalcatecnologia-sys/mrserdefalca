"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistroDesechos() {
  const [tipoDesecho, setTipoDesecho] = useState("Residuos Domiciliarios");
  const [pesoToneladas, setPesoToneladas] = useState("");
  const [municipioOrigen, setMunicipioOrigen] = useState("");
  const [placaVehiculo, setPlacaVehiculo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Registrando entrada...");

    const { error } = await supabase.from("registro_desechos").insert([
      {
        tipo_desecho: tipoDesecho,
        peso_toneladas: pesoToneladas ? parseFloat(pesoToneladas) : 0,
        municipio_origen: municipioOrigen,
        placa_vehiculo: placaVehiculo,
        observaciones: observaciones,
        estatus: "Procesado",
      },
    ]);

    if (error) {
      console.error(error);
      setMensaje("Error al guardar el registro de desechos.");
    } else {
      setMensaje("¡Desechos registrados exitosamente!");
      setPesoToneladas(""); setMunicipioOrigen(""); setPlacaVehiculo(""); setObservaciones("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Ingreso de Desechos Sólidos</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Desecho</label>
            <select value={tipoDesecho} onChange={(e) => setTipoDesecho(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
              <option value="Residuos Domiciliarios">Residuos Domiciliarios</option>
              <option value="Desechos Comerciales">Desechos Comerciales</option>
              <option value="Desechos Biocontaminados">Desechos Biocontaminados</option>
              <option value="Escombros">Escombros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Peso (Toneladas)</label>
            <input type="number" step="0.01" required value={pesoToneladas} onChange={(e) => setPesoToneladas(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Municipio de Origen</label>
            <input type="text" required value={municipioOrigen} onChange={(e) => setMunicipioOrigen(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Placa del Vehículo</label>
            <input type="text" required value={placaVehiculo} onChange={(e) => setPlacaVehiculo(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observaciones</label>
          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2"></textarea>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
          Registrar Ingreso
        </button>

        {mensaje && <p className="mt-4 text-center font-medium text-gray-700">{mensaje}</p>}
      </form>
    </div>
  );
}