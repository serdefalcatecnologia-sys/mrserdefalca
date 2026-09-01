"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Importación corregida

export default function ModuloComercial() {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data, error } = await supabase
        .from('tabla_comercial')
        .select('*');
      
      if (!error && data) {
        setDatos(data);
      }
    };
    
    cargarDatos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Módulo Comercial</h1>
      {/* Resto de tu interfaz */}
    </div>
  );
}