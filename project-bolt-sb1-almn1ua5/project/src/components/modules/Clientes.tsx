import { useState, useEffect } from 'react';
import { Plus, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Cliente {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
}

interface ClientesProps {
  onUpdate: () => void;
}

export function Clientes({ onUpdate }: ClientesProps) {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('clientes').insert({
        usuario_id: user.id,
        nombre: nuevoCliente.nombre,
        empresa: nuevoCliente.empresa || null,
        email: nuevoCliente.email || null,
        telefono: nuevoCliente.telefono || null,
        direccion: nuevoCliente.direccion || null,
        notas: nuevoCliente.notas || null,
      });
      if (error) throw error;
      setMostrarModal(false);
      setNuevoCliente({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: '',
        notas: '',
      });
      cargarClientes();
      onUpdate();
    } catch (error) {
      console.error('Error agregando cliente:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Gestión de Clientes</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando clientes...</div>
      ) : clientes.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No hay clientes registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <h4 className="text-lg font-bold text-white mb-1">{cliente.nombre}</h4>
              {cliente.empresa && (
                <div className="flex items-center gap-2 text-sm text-cyan-400 mb-4">
                  <Building className="w-4 h-4" />
                  <span>{cliente.empresa}</span>
                </div>
              )}
              <div className="space-y-2 border-t border-gray-800 pt-4">
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{cliente.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Nuevo Cliente</h3>
            <form onSubmit={agregarCliente} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Empresa (opcional)"
                value={nuevoCliente.empresa}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, empresa: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="Notas (opcional)"
                value={nuevoCliente.notas}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, notas: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
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
