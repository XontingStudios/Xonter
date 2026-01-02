import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  UserCheck,
  Truck,
  Calendar,
  LogOut,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Financiero } from './modules/Financiero';
import { Empleados } from './modules/Empleados';
import { Inventario } from './modules/Inventario';
import { Clientes } from './modules/Clientes';
import { Proveedores } from './modules/Proveedores';
import { Calendario } from './modules/Calendario';

type Vista = 'dashboard' | 'financiero' | 'empleados' | 'inventario' | 'clientes' | 'proveedores' | 'calendario';

interface Metricas {
  ingresosMes: number;
  egresosMes: number;
  balanceMes: number;
  totalEmpleados: number;
  empleadosActivos: number;
  totalInventario: number;
  valorInventario: number;
  totalClientes: number;
  totalProveedores: number;
  actividadesPendientes: number;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [vista, setVista] = useState<Vista>('dashboard');
  const [metricas, setMetricas] = useState<Metricas>({
    ingresosMes: 0,
    egresosMes: 0,
    balanceMes: 0,
    totalEmpleados: 0,
    empleadosActivos: 0,
    totalInventario: 0,
    valorInventario: 0,
    totalClientes: 0,
    totalProveedores: 0,
    actividadesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    if (!user) return;

    try {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const fechaInicio = primerDiaMes.toISOString().split('T')[0];
      const fechaFin = ultimoDiaMes.toISOString().split('T')[0];

      const [transacciones, empleados, inventario, clientes, proveedores, actividades] = await Promise.all([
        supabase
          .from('transacciones_financieras')
          .select('tipo, monto')
          .eq('usuario_id', user.id)
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin),
        supabase.from('empleados').select('activo').eq('usuario_id', user.id),
        supabase.from('inventario').select('cantidad, precio_venta').eq('usuario_id', user.id),
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('usuario_id', user.id),
        supabase.from('proveedores').select('id', { count: 'exact', head: true }).eq('usuario_id', user.id),
        supabase
          .from('actividades')
          .select('id', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .eq('completada', false),
      ]);

      let ingresos = 0;
      let egresos = 0;

      if (transacciones.data) {
        transacciones.data.forEach((t) => {
          if (t.tipo === 'ingreso') {
            ingresos += Number(t.monto);
          } else {
            egresos += Number(t.monto);
          }
        });
      }

      const empleadosActivos = empleados.data?.filter((e) => e.activo).length || 0;
      const totalInventarioItems = inventario.data?.reduce((sum, i) => sum + i.cantidad, 0) || 0;
      const valorInventario = inventario.data?.reduce((sum, i) => sum + i.cantidad * Number(i.precio_venta), 0) || 0;

      setMetricas({
        ingresosMes: ingresos,
        egresosMes: egresos,
        balanceMes: ingresos - egresos,
        totalEmpleados: empleados.data?.length || 0,
        empleadosActivos,
        totalInventario: totalInventarioItems,
        valorInventario,
        totalClientes: clientes.count || 0,
        totalProveedores: proveedores.count || 0,
        actividadesPendientes: actividades.count || 0,
      });
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'financiero', label: 'Finanzas', icon: DollarSign },
    { id: 'empleados', label: 'Empleados', icon: Users },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: UserCheck },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <img src="/xonting-logo.png" alt="Xonter" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-white">Xonter</h1>
            <p className="text-xs text-gray-400">Gestión Empresarial</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setVista(item.id as Vista)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  vista === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900/30 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {vista === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Dashboard Principal</h2>

              {loading ? (
                <div className="text-center text-gray-400 py-12">Cargando métricas...</div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-4">Resumen Financiero del Mes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-green-300">Ingresos</h4>
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{formatCurrency(metricas.ingresosMes)}</p>
                      </div>

                      <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-red-300">Egresos</h4>
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{formatCurrency(metricas.egresosMes)}</p>
                      </div>

                      <div
                        className={`bg-gradient-to-br ${
                          metricas.balanceMes >= 0
                            ? 'from-cyan-900/40 to-cyan-800/20 border-cyan-700/50'
                            : 'from-orange-900/40 to-orange-800/20 border-orange-700/50'
                        } border rounded-xl p-6`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4
                            className={`text-sm font-medium ${
                              metricas.balanceMes >= 0 ? 'text-cyan-300' : 'text-orange-300'
                            }`}
                          >
                            Balance
                          </h4>
                          <DollarSign
                            className={`w-5 h-5 ${metricas.balanceMes >= 0 ? 'text-cyan-400' : 'text-orange-400'}`}
                          />
                        </div>
                        <p className="text-3xl font-bold text-white">{formatCurrency(metricas.balanceMes)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-4">Métricas Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-400">Empleados Activos</h4>
                          <Users className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {metricas.empleadosActivos} / {metricas.totalEmpleados}
                        </p>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-400">Inventario Total</h4>
                          <Package className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{metricas.totalInventario} items</p>
                        <p className="text-sm text-gray-500 mt-2">{formatCurrency(metricas.valorInventario)}</p>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-400">Clientes</h4>
                          <UserCheck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{metricas.totalClientes}</p>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-400">Proveedores</h4>
                          <Truck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{metricas.totalProveedores}</p>
                      </div>

                      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-400">Actividades Pendientes</h4>
                          <Calendar className="w-5 h-5 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{metricas.actividadesPendientes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {vista === 'financiero' && <Financiero onUpdate={cargarMetricas} />}
          {vista === 'empleados' && <Empleados onUpdate={cargarMetricas} />}
          {vista === 'inventario' && <Inventario onUpdate={cargarMetricas} />}
          {vista === 'clientes' && <Clientes onUpdate={cargarMetricas} />}
          {vista === 'proveedores' && <Proveedores onUpdate={cargarMetricas} />}
          {vista === 'calendario' && <Calendario onUpdate={cargarMetricas} />}
        </div>
      </main>
    </div>
  );
}
