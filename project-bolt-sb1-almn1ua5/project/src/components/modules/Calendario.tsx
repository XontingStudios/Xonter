import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  tipo: 'reunión' | 'tarea' | 'recordatorio' | 'evento';
  completada: boolean;
}

interface CalendarioProps {
  onUpdate: () => void;
}

export function Calendario({ onUpdate }: CalendarioProps) {
  const { user } = useAuth();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nueva, setNueva] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    tipo: 'tarea' as 'reunión' | 'tarea' | 'recordatorio' | 'evento',
  });

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha_inicio', { ascending: true });
      if (error) throw error;
      setActividades(data || []);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const fechaInicio = `${nueva.fecha_inicio}T${nueva.hora_inicio}:00`;
      const { error } = await supabase.from('actividades').insert({
        usuario_id: user.id,
        titulo: nueva.titulo,
        descripcion: nueva.descripcion || null,
        fecha_inicio: fechaInicio,
        fecha_fin: null,
        tipo: nueva.tipo,
        completada: false,
      });
      if (error) throw error;
      setMostrarModal(false);
      setNueva({
        titulo: '',
        descripcion: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        hora_inicio: '09:00',
        tipo: 'tarea',
      });
      cargarActividades();
      onUpdate();
    } catch (error) {
      console.error('Error agregando actividad:', error);
    }
  };

  const toggleActividad = async (actividadId: string, completada: boolean) => {
    try {
      const { error } = await supabase
        .from('actividades')
        .update({ completada: !completada })
        .eq('id', actividadId);
      if (error) throw error;
      cargarActividades();
      onUpdate();
    } catch (error) {
      console.error('Error actualizando actividad:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tiposColores = {
    reunión: 'bg-blue-900/40 border-blue-700/50 text-blue-400',
    tarea: 'bg-cyan-900/40 border-cyan-700/50 text-cyan-400',
    recordatorio: 'bg-yellow-900/40 border-yellow-700/50 text-yellow-400',
    evento: 'bg-purple-900/40 border-purple-700/50 text-purple-400',
  };

  const actividadesPendientes = actividades.filter((a) => !a.completada);
  const actividadesCompletadas = actividades.filter((a) => a.completada);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Calendario de Actividades</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-green-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Actividad
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando actividades...</div>
      ) : actividades.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No hay actividades registradas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {actividadesPendientes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-300 mb-4">Pendientes</h3>
              <div className="space-y-3">
                {actividadesPendientes.map((act) => (
                  <div key={act.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleActividad(act.id, act.completada)}
                        className="flex-shrink-0 mt-1"
                      >
                        <Circle className="w-6 h-6 text-gray-500 hover:text-cyan-400 transition-colors" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">{act.titulo}</h4>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded border ${tiposColores[act.tipo]}`}
                          >
                            {act.tipo}
                          </span>
                        </div>
                        {act.descripcion && <p className="text-gray-400 mb-3">{act.descripcion}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(act.fecha_inicio)}</span>
                          </div>
                          <div>{formatTime(act.fecha_inicio)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actividadesCompletadas.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-300 mb-4">Completadas</h3>
              <div className="space-y-3">
                {actividadesCompletadas.map((act) => (
                  <div key={act.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 opacity-60">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleActividad(act.id, act.completada)}
                        className="flex-shrink-0 mt-1"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </button>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-400 line-through">{act.titulo}</h4>
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Nueva Actividad</h3>
            <form onSubmit={agregarActividad} className="space-y-4">
              <select
                value={nueva.tipo}
                onChange={(e) => setNueva({ ...nueva, tipo: e.target.value as typeof nueva.tipo })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="tarea">Tarea</option>
                <option value="reunión">Reunión</option>
                <option value="recordatorio">Recordatorio</option>
                <option value="evento">Evento</option>
              </select>
              <input
                type="text"
                placeholder="Título"
                value={nueva.titulo}
                onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={nueva.descripcion}
                onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
              />
              <input
                type="date"
                value={nueva.fecha_inicio}
                onChange={(e) => setNueva({ ...nueva, fecha_inicio: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
              <input
                type="time"
                value={nueva.hora_inicio}
                onChange={(e) => setNueva({ ...nueva, hora_inicio: e.target.value })}
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
