import { useState, useEffect } from 'react';
import { Plus, Package, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ItemInventario {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: 'producto' | 'servicio';
  cantidad: number;
  precio_compra: number;
  precio_venta: number;
  unidad: string;
}

interface InventarioProps {
  onUpdate: () => void;
}

export function Inventario({ onUpdate }: InventarioProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'producto' | 'servicio'>('todos');
  const [nuevoItem, setNuevoItem] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'producto' as 'producto' | 'servicio',
    cantidad: '0',
    precio_compra: '',
    precio_venta: '',
    unidad: 'unidad',
  });

  useEffect(() => {
    cargarInventario();
  }, [filtroTipo]);

  const cargarInventario = async () => {
    if (!user) return;
    try {
      let query = supabase
        .from('inventario')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }
      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { error } = await supabase.from('inventario').insert({
        usuario_id: user.id,
        nombre: nuevoItem.nombre,
        descripcion: nuevoItem.descripcion || null,
        tipo: nuevoItem.tipo,
        cantidad: parseInt(nuevoItem.cantidad),
        precio_compra: parseFloat(nuevoItem.precio_compra),
        precio_venta: parseFloat(nuevoItem.precio_venta),
        unidad: nuevoItem.unidad,
      });
      if (error) throw error;
      setMostrarModal(false);
      setNuevoItem({
        nombre: '',
        descripcion: '',
        tipo: 'producto',
        cantidad: '0',
        precio_compra: '',
        precio_venta: '',
        unidad: 'unidad',
      });
      cargarInventario();
      onUpdate();
    } catch (error) {
      console.error('Error agregando item:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  const calcularValorTotal = () => {
    return items.reduce((sum, item) => sum + item.cantidad * Number(item.precio_venta), 0);
  };

  const calcularMargen = (precioCompra: number, precioVenta: number) => {
    if (precioCompra === 0) return 0;
    return ((precioVenta - precioCompra) / precioCompra) * 100;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Inventario</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Item
        </button>
      </div>

      <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-700/50 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-medium text-cyan-300 mb-2">Valor Total del Inventario</h3>
        <p className="text-3xl font-bold text-white">{formatCurrency(calcularValorTotal())}</p>
        <p className="text-sm text-gray-400 mt-2">{items.length} items registrados</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroTipo === 'todos'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo('producto')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroTipo === 'producto'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setFiltroTipo('servicio')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroTipo === 'servicio'
                ? 'bg-cyan-500 text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Servicios
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando inventario...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No hay items registrados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.tipo === 'producto' ? (
                        <Package className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Wrench className="w-5 h-5 text-green-400" />
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          item.tipo === 'producto'
                            ? 'bg-cyan-900/40 text-cyan-400'
                            : 'bg-green-900/40 text-green-400'
                        }`}
                      >
                        {item.tipo}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{item.nombre}</h4>
                    {item.descripcion && <p className="text-sm text-gray-400 mt-1">{item.descripcion}</p>}
                  </div>
                </div>
                <div className="space-y-3 border-t border-gray-700 pt-4">
                  {item.tipo === 'producto' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Stock:</span>
                      <span className="text-white font-semibold">
                        {item.cantidad} {item.unidad}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Costo:</span>
                    <span className="text-white font-semibold">{formatCurrency(Number(item.precio_compra))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Precio Venta:</span>
                    <span className="text-cyan-400 font-semibold">
                      {formatCurrency(Number(item.precio_venta))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Margen:</span>
                    <span
                      className={`font-semibold ${
                        calcularMargen(Number(item.precio_compra), Number(item.precio_venta)) > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {calcularMargen(Number(item.precio_compra), Number(item.precio_venta)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Nuevo Item</h3>
            <form onSubmit={agregarItem} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoItem.nombre}
                onChange={(e) => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={nuevoItem.descripcion}
                onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
              />
              <input
                type="number"
                placeholder="Cantidad"
                min="0"
                value={nuevoItem.cantidad}
                onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="number"
                placeholder="Precio de Compra"
                step="0.01"
                min="0"
                value={nuevoItem.precio_compra}
                onChange={(e) => setNuevoItem({ ...nuevoItem, precio_compra: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="number"
                placeholder="Precio de Venta"
                step="0.01"
                min="0"
                value={nuevoItem.precio_venta}
                onChange={(e) => setNuevoItem({ ...nuevoItem, precio_venta: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
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
