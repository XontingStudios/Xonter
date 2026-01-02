export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre_completo: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre_completo: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre_completo?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      transacciones_financieras: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: 'ingreso' | 'egreso';
          categoria: string;
          monto: number;
          descripcion: string | null;
          fecha: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: 'ingreso' | 'egreso';
          categoria: string;
          monto: number;
          descripcion?: string | null;
          fecha?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          tipo?: 'ingreso' | 'egreso';
          categoria?: string;
          monto?: number;
          descripcion?: string | null;
          fecha?: string;
          created_at?: string;
        };
      };
      empleados: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          cargo: string;
          salario: number;
          email: string | null;
          telefono: string | null;
          fecha_contratacion: string;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          cargo: string;
          salario?: number;
          email?: string | null;
          telefono?: string | null;
          fecha_contratacion?: string;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          cargo?: string;
          salario?: number;
          email?: string | null;
          telefono?: string | null;
          fecha_contratacion?: string;
          activo?: boolean;
          created_at?: string;
        };
      };
      inventario: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          descripcion: string | null;
          tipo: 'producto' | 'servicio';
          cantidad: number;
          precio_compra: number;
          precio_venta: number;
          unidad: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          descripcion?: string | null;
          tipo: 'producto' | 'servicio';
          cantidad?: number;
          precio_compra?: number;
          precio_venta?: number;
          unidad?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          descripcion?: string | null;
          tipo?: 'producto' | 'servicio';
          cantidad?: number;
          precio_compra?: number;
          precio_venta?: number;
          unidad?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clientes: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          empresa: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          notas?: string | null;
          created_at?: string;
        };
      };
      proveedores: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          empresa: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          empresa?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          notas?: string | null;
          created_at?: string;
        };
      };
      actividades: {
        Row: {
          id: string;
          usuario_id: string;
          titulo: string;
          descripcion: string | null;
          fecha_inicio: string;
          fecha_fin: string | null;
          tipo: 'reunión' | 'tarea' | 'recordatorio' | 'evento';
          completada: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          titulo: string;
          descripcion?: string | null;
          fecha_inicio: string;
          fecha_fin?: string | null;
          tipo: 'reunión' | 'tarea' | 'recordatorio' | 'evento';
          completada?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          titulo?: string;
          descripcion?: string | null;
          fecha_inicio?: string;
          fecha_fin?: string | null;
          tipo?: 'reunión' | 'tarea' | 'recordatorio' | 'evento';
          completada?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
