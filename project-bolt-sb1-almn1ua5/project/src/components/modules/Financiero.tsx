import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  descripcion: string | null;
  fecha: string;
}

interface FinancieroProps {
  onUpdate: () => void;
}

export function Financiero({ onUpdate }: FinancieroProps) {
  const { user } = useAuth();
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const categorias = {
    ingreso: ['Ventas', 'Servicios', 'Inversiones', 'Otros Ingresos'],
    egreso: ['Salarios', 'Renta', 'Servicios', 'Compras', 'Marketing', 'Otros Gastos'],
  };

  useEffect(() => {
    cargarTransacciones();
  }, [filtroTipo]);

  const cargarTransacciones = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('transacciones_financieras')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });

      if (filtroTipo !== 'todos') {
        query = query.eq('tipo', filtroTipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransacciones(data || []);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('transacciones_financieras').insert({
        usuario_id: user.id,
        tipo: nuevaTransaccion.tipo,
        categoria: nuevaTransaccion.categoria,
        monto: parseFloat(nuevaTransaccion.monto),
        descripcion: nuevaTransaccion.descripcion || null,
        fecha: nuevaTransaccion.fecha,
      });

      if (error) throw error;

      setMostrarModal(false);
      setNuevaTransaccion({
        tipo: 'ingreso',
        categoria: '',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
      });
      cargarTransacciones();
      onUpdate();
    } catch (error) {
      console.error('Error agregando transacción:', error);
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

  const calcularTotales = () => {
    const ingresos = transacciones
      .filter((t) => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + Number(t.monto), 0);
    const egresos = transacciones
      .filter((t) => t.tipo === 'egreso')
      .reduce((sum, t) => sum + Number(t.monto), 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  };

  const totales = calcularTotales();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Gestión Financiera</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Transacción
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-green-300">Total Ingresos</h4>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totales.ingresos)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-red-300">Total Egresos</h4>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totales.egresos)}</p>
        </div>

        <div
          className={`bg-gradient-to-br ${
            totales.balance >= 0
              ? 'from-cyan-900/40 to-cyan-800/20 border-cyan-700/50'
              : 'from-orange-900/40 to-orange-800/20 border-orange-700/50'
          } border rounded-xl p-6`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4
              className={`text-sm font-medium ${totales.balance >= 0 ? 'text-cyan-300' : 'text-orange-300'}`}
            >
              Balance Total
            </h4>
            <Download className={`w-5 h-5 ${totales.balance >= 0 ? 'text-cyan-400' : 'text-orange-400'}`} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totales.balance)}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
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
              onClick={() => setFiltroTipo('ingreso')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroTipo === 'ingreso'
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFiltroTipo('egreso')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroTipo === 'egreso'
                  ? 'bg-red-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Egresos
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando transacciones...</div>
        ) : transacciones.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No hay transacciones registradas.
            <br />
            Haz clic en "Nueva Transacción" para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {transacciones.map((transaccion) => (
              <div
                key={transaccion.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      transaccion.tipo === 'ingreso'
                        ? 'bg-green-900/40 border border-green-700/50'
                        : 'bg-red-900/40 border border-red-700/50'
                    }`}
                  >
                    {transaccion.tipo === 'ingreso' ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{transaccion.categoria}</h4>
                    <p className="text-sm text-gray-400">{formatDate(transaccion.fecha)}</p>
                    {transaccion.descripcion && (
                      <p className="text-xs text-gray-500 mt-1">{transaccion.descripcion}</p>
                    )}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    transaccion.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {transaccion.tipo === 'ingreso' ? '+' : '-'}
                  {formatCurrency(Number(transaccion.monto))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Nueva Transacción</h3>
            <form onSubmit={agregarTransaccion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNuevaTransaccion({ ...nuevaTransaccion, tipo: 'ingreso', categoria: '' })
                    }
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      nuevaTransaccion.tipo === 'ingreso'
                        ? 'bg-green-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNuevaTransaccion({ ...nuevaTransaccion, tipo: 'egreso', categoria: '' })
                    }
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      nuevaTransaccion.tipo === 'egreso'
                        ? 'bg-red-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Egreso
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                <select
                  value={nuevaTransaccion.categoria}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, categoria: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias[nuevaTransaccion.tipo].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={nuevaTransaccion.monto}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, monto: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
                <input
                  type="date"
                  value={nuevaTransaccion.fecha}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, fecha: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={nuevaTransaccion.descripcion}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, descripcion: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                  placeholder="Detalles adicionales..."
                />
              </div>

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
