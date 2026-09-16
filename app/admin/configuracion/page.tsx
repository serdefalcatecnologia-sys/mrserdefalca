'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const infoTablas: Record<string, { descripcion: string; uso: string }> = {
  'usuarios': {
    descripcion: 'Almacena credenciales, roles y accesos del personal.',
    uso: 'Gestión de autenticación y privilegios.',
  },
  'registro_comercial': {
    descripcion: 'Historial de pagos, recaudación y facturación comercial.',
    uso: 'Generación de reportes contables y comprobantes.',
  },
  'flota_rutas': {
    descripcion: 'Bitácora operativa diaria de camiones, conductores y rutas.',
    uso: 'Estadísticas y control de cobertura de recolección.',
  },
  'registro_desechos': {
    descripcion: 'Control de tonelaje y pesaje a la entrada del vertedero.',
    uso: 'Monitoreo de volumen de desechos procesados.',
  },
};

export default function ConfiguracionPage() {
  const [tablaSeleccionada, setTablaSeleccionada] = useState<string>('registro_comercial');
  const [fechaLimpieza, setFechaLimpieza] = useState<string>('');
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState<boolean>(false);
  const [procesandoDB, setProcesandoDB] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'exito' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const ejecutarLimpiezaConfirmada = async () => {
    if (!fechaLimpieza) {
      mostrarMensaje('error', 'Seleccione una fecha límite para continuar.');
      return;
    }

    setMostrarModalConfirmacion(false);
    setProcesandoDB(true);

    try {
      // Determinación dinámica de la columna de fecha según el esquema real
      const columnaFecha =
        tablaSeleccionada === 'registro_comercial'
          ? 'fecha'
          : tablaSeleccionada === 'flota_rutas' || tablaSeleccionada === 'registro_desechos'
          ? 'fecha_hora'
          : 'created_at';

      const { error } = await supabase
        .from(tablaSeleccionada)
        .delete()
        .lt(columnaFecha, fechaLimpieza);

      if (error) throw error;

      mostrarMensaje('exito', `Registros anteriores a ${fechaLimpieza} eliminados correctamente.`);
      setFechaLimpieza('');
    } catch (err: unknown) {
      mostrarMensaje('error', 'Error en la purga: ' + (err as Error).message);
    } finally {
      setProcesandoDB(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mantenimiento y Configuración</h1>

      {mensaje && (
        <div
          className={`p-4 rounded-md ${
            mensaje.tipo === 'exito'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Selector de Tabla */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <label className="block text-sm font-medium">Seleccionar Tabla:</label>
        <select
          value={tablaSeleccionada}
          onChange={(e) => setTablaSeleccionada(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {Object.keys(infoTablas).map((tabla) => (
            <option key={tabla} value={tabla}>
              {tabla}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600">
          <strong>Descripción:</strong> {infoTablas[tablaSeleccionada]?.descripcion}
        </p>
      </div>

      {/* Control de Purga */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Depuración de Registros Antiguos</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full">
            <label className="block text-sm font-medium">Eliminar registros anteriores a:</label>
            <input
              type="date"
              value={fechaLimpieza}
              onChange={(e) => setFechaLimpieza(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            onClick={() => setMostrarModalConfirmacion(true)}
            disabled={procesandoDB || !fechaLimpieza}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {procesandoDB ? 'Procesando...' : 'Iniciar Purga'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-red-600">Confirmación Requerida</h3>
            <p className="text-sm text-gray-700">
              ¿Confirmas la eliminación permanente de todos los registros en la tabla{' '}
              <strong>{tablaSeleccionada}</strong> anteriores a la fecha <strong>{fechaLimpieza}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalConfirmacion(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarLimpiezaConfirmada}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}