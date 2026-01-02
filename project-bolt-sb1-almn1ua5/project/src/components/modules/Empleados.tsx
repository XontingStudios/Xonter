import { useState, useEffect } from 'react';
import { Plus, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  salario: number;
  email: string | null;
  telefono: string | null;
  fecha_contratacion: string;
  activo: boolean;
}

interface EmpleadosProps {
  onUpdate: () => void;
}

export function Empleados({ onUpdate }: EmpleadosProps) {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    cargo: '',
    salario: '',
    email: '',
    telefono: '',
    fecha_contratacion: new Date().toISOString().split('T')[0],
    activo: true,
  });

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmpleados(data || []);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('empleados').insert({
        usuario_id: user.id,
        nombre: nuevoEmpleado.nombre,
        cargo: nuevoEmpleado.cargo,
        salario: parseFloat(nuevoEmpleado.salario),
        email: nuevoEmpleado.email || null,
        telefono: nuevoEmpleado.telefono || null,
        fecha_contratacion: nuevoEmpleado.fecha_contratacion,
        activo: nuevoEmpleado.activo,
      });
      if (error) throw error;
      setMostrarModal(false);
      setNuevoEmpleado({
        nombre: '',
        cargo: '',
        salario: '',
        email: '',
        telefono: '',
        fecha_contratacion: new Date().toISOString().split('T')[0],
        activo: true,
      });
      cargarEmpleados();
      onUpdate();
    } catch (error) {
      console.error('Error agregando empleado:', error);
    }
  };

  const toggleEstadoEmpleado = async (empleadoId: string, estadoActual: boolean) => {
    try {
      const { error } = await supabase
        .from('empleados')
        .update({ activo: !estadoActual })
        .eq('id', empleadoId);
      if (error) throw error;
      cargarEmpleados();
      onUpdate();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const empleadosActivos = empleados.filter((e) => e.activo);
  const empleadosInactivos = empleados.filter((e) => !e.activo);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Gestión de Empleados</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">
            No hay empleados registrados.
            <br />
            Haz clic en "Nuevo Empleado" para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-300 mb-4">
              Empleados Activos ({empleadosActivos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empleadosActivos.map((empleado) => (
                <div
                  key={empleado.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{empleado.nombre}</h4>
                      <p className="text-cyan-400 font-medium">{empleado.cargo}</p>
                    </div>
                    <button
                      onClick={() => toggleEstadoEmpleado(empleado.id, empleado.activo)}
                      className="p-2 rounded-lg bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-all"
                    >
                      <UserCheck className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 mb-4">
                    {empleado.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{empleado.email}</span>
                      </div>
                    )}
                    {empleado.telefono && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{empleado.telefono}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Salario:</span>
                      <span className="text-white font-semibold">{formatCurrency(Number(empleado.salario))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Contratación:</span>
                      <span className="text-white">{formatDate(empleado.fecha_contratacion)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {empleadosInactivos.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-300 mb-4">
                Empleados Inactivos ({empleadosInactivos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {empleadosInactivos.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 opacity-60 hover:opacity-100 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-400">{empleado.nombre}</h4>
                        <p className="text-gray-500 font-medium">{empleado.cargo}</p>
                      </div>
                      <button
                        onClick={() => toggleEstadoEmpleado(empleado.id, empleado.activo)}
                        className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all"
                      >
                        <UserX className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="border-t border-gray-800 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Salario:</span>
                        <span className="text-gray-400 font-semibold">
                          {formatCurrency(Number(empleado.salario))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Nuevo Empleado</h3>
            <form onSubmit={agregarEmpleado} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={nuevoEmpleado.nombre}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Cargo"
                value={nuevoEmpleado.cargo}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, cargo: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="number"
                placeholder="Salario"
                step="0.01"
                value={nuevoEmpleado.salario}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, salario: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={nuevoEmpleado.email}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={nuevoEmpleado.telefono}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="date"
                value={nuevoEmpleado.fecha_contratacion}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, fecha_contratacion: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
