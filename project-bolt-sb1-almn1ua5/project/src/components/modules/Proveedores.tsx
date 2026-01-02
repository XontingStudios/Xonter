import { useState, useEffect } from 'react';
import { Plus, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Proveedor {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

interface ProveedoresProps {
  onUpdate: () => void;
}

export function Proveedores({ onUpdate }: ProveedoresProps) {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('proveedores').insert({
        usuario_id: user.id,
        nombre: nuevo.nombre,
        empresa: nuevo.empresa || null,
        email: nuevo.email || null,
        telefono: nuevo.telefono || null,
        direccion: nuevo.direccion || null,
      });
      if (error) throw error;
      setMostrarModal(false);
      setNuevo({ nombre: '', empresa: '', email: '', telefono: '', direccion: '' });
      cargarProveedores();
      onUpdate();
    } catch (error) {
      console.error('Error agregando proveedor:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Gestión de Proveedores</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando proveedores...</div>
      ) : proveedores.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No hay proveedores registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proveedores.map((p) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all">
              <h4 className="text-lg font-bold text-white mb-1">{p.nombre}</h4>
              {p.empresa && (
                <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
                  <Building className="w-4 h-4" />
                  <span>{p.empresa}</span>
                </div>
              )}
              <div className="space-y-2 border-t border-gray-800 pt-4">
                {p.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p.telefono && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{p.telefono}</span>
                  </div>
                )}
                {p.direccion && (
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{p.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Nuevo Proveedor</h3>
            <form onSubmit={agregar} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Empresa (opcional)"
                value={nuevo.empresa}
                onChange={(e) => setNuevo({ ...nuevo, empresa: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={nuevo.telefono}
                onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={nuevo.direccion}
                onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
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
