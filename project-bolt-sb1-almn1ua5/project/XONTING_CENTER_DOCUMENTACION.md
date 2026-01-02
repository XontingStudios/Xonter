# Xonting Center - Documentación Completa

## 1. Descripción General

**Xonting Center** es una aplicación empresarial integral de gestión diseñada exclusivamente para Lorenzo, el propietario de la empresa. Es una solución monousuario que centraliza todas las operaciones críticas en una plataforma única, moderna y profesional.

### Características Principales

- Dashboard con métricas clave en tiempo real
- Gestión financiera completa (ingresos y egresos)
- Administración de empleados/equipo
- Sistema de inventario
- Gestión de clientes
- Gestión de proveedores
- Calendario de actividades y tareas
- Autenticación segura

---

## 2. Arquitectura Técnica

### Stack Tecnológico

```
Frontend:
├── React 18.3.1 (UI Framework)
├── TypeScript 5.5 (Type Safety)
├── Vite 5.4 (Build Tool)
├── Tailwind CSS 3.4 (Styling)
└── Lucide React (Icons)

Backend:
├── Supabase (Database & Auth)
│   ├── PostgreSQL
│   ├── Auth (Email/Password)
│   └── Row Level Security (RLS)
└── TypeScript Generated Types

Herramientas:
├── ESLint (Code Linting)
├── PostCSS (CSS Processing)
└── Autoprefixer (Browser Compatibility)
```

### Estructura de Carpetas

```
src/
├── App.tsx                          # Componente raíz
├── main.tsx                         # Punto de entrada
├── index.css                        # Estilos globales
├── contexts/
│   └── AuthContext.tsx              # Context de autenticación
├── lib/
│   ├── supabase.ts                  # Cliente de Supabase
│   └── database.types.ts            # Tipos TypeScript generados
├── components/
│   ├── Auth.tsx                     # Pantalla de login/registro
│   ├── Dashboard.tsx                # Dashboard principal
│   └── modules/
│       ├── Financiero.tsx           # Gestión financiera
│       ├── Empleados.tsx            # Gestión de empleados
│       ├── Inventario.tsx           # Sistema de inventario
│       ├── Clientes.tsx             # Gestión de clientes
│       ├── Proveedores.tsx          # Gestión de proveedores
│       └── Calendario.tsx           # Calendario de actividades
└── vite-env.d.ts                    # Tipos de Vite
```

---

## 3. Base de Datos - Diseño

### Tablas y Estructuras

#### 1. `usuarios`
Almacena información del propietario único del sistema.

```sql
- id (UUID, PK) → auth.users
- email (text, unique)
- nombre_completo (text)
- avatar_url (text, nullable)
- created_at (timestamptz)
```

#### 2. `transacciones_financieras`
Registro de todos los movimientos financieros.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- tipo (enum: 'ingreso', 'egreso')
- categoria (text)
- monto (decimal 12,2)
- descripcion (text, nullable)
- fecha (date)
- created_at (timestamptz)

Índices:
- usuario_id, fecha DESC
- tipo
```

#### 3. `empleados`
Gestión del equipo de trabajo.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- nombre (text)
- cargo (text)
- salario (decimal 12,2)
- email (text, nullable)
- telefono (text, nullable)
- fecha_contratacion (date)
- activo (boolean, default: true)
- created_at (timestamptz)

Índices:
- usuario_id
- activo
```

#### 4. `inventario`
Productos y servicios disponibles.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- nombre (text)
- descripcion (text, nullable)
- tipo (enum: 'producto', 'servicio')
- cantidad (integer, default: 0)
- precio_compra (decimal 12,2)
- precio_venta (decimal 12,2)
- unidad (text, default: 'unidad')
- created_at (timestamptz)
- updated_at (timestamptz)

Índices:
- usuario_id
- tipo
```

#### 5. `clientes`
Base de datos de clientes.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- nombre (text)
- empresa (text, nullable)
- email (text, nullable)
- telefono (text, nullable)
- direccion (text, nullable)
- notas (text, nullable)
- created_at (timestamptz)

Índice:
- usuario_id
```

#### 6. `proveedores`
Base de datos de proveedores.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- nombre (text)
- empresa (text, nullable)
- email (text, nullable)
- telefono (text, nullable)
- direccion (text, nullable)
- notas (text, nullable)
- created_at (timestamptz)

Índice:
- usuario_id
```

#### 7. `actividades`
Calendario de tareas y actividades.

```sql
- id (UUID, PK)
- usuario_id (UUID, FK) → usuarios
- titulo (text)
- descripcion (text, nullable)
- fecha_inicio (timestamptz)
- fecha_fin (timestamptz, nullable)
- tipo (enum: 'reunión', 'tarea', 'recordatorio', 'evento')
- completada (boolean, default: false)
- created_at (timestamptz)

Índices:
- usuario_id, fecha_inicio DESC
- completada
```

### Políticas de Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas garantizan que:

1. **SELECT**: Solo el usuario autenticado puede ver sus propios datos
2. **INSERT**: Solo el usuario puede insertar datos con su user_id
3. **UPDATE**: Solo el usuario puede actualizar sus propios datos
4. **DELETE**: Solo el usuario puede eliminar sus propios datos

Patrón de política:
```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR operation
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
```

---

## 4. Módulos Funcionales

### 4.1 Dashboard Principal
**Ruta**: `/` (cuando está autenticado)

**Características**:
- Resumen financiero del mes (ingresos, egresos, balance)
- Métricas generales:
  - Empleados activos / total
  - Inventario total y su valor
  - Cantidad de clientes
  - Cantidad de proveedores
  - Actividades pendientes

### 4.2 Gestión Financiera
**Ruta**: Dashboard → Finanzas

**Características**:
- Crear transacciones (ingreso/egreso)
- Categorías predefinidas
- Filtrado por tipo
- Visualización de totales
- Histórico completo
- Descripción detallada de operaciones

**Categorías de Ingresos**: Ventas, Servicios, Inversiones, Otros Ingresos
**Categorías de Egresos**: Salarios, Renta, Servicios, Compras, Marketing, Otros Gastos

### 4.3 Gestión de Empleados
**Ruta**: Dashboard → Empleados

**Características**:
- Crear nuevos empleados
- Información completa: nombre, cargo, salario, contacto
- Activar/desactivar empleados
- Vista separada para empleados activos e inactivos
- Seguimiento de fecha de contratación

### 4.4 Sistema de Inventario
**Ruta**: Dashboard → Inventario

**Características**:
- Gestionar productos y servicios
- Cantidad en stock
- Precio de compra y venta
- Cálculo automático de margen de ganancia
- Valor total del inventario
- Filtrado por tipo

### 4.5 Gestión de Clientes
**Ruta**: Dashboard → Clientes

**Características**:
- Base de datos de clientes
- Información: nombre, empresa, contacto, dirección
- Notas adicionales
- Vista en grid
- Fácil búsqueda y organización

### 4.6 Gestión de Proveedores
**Ruta**: Dashboard → Proveedores

**Características**:
- Base de datos de proveedores
- Información completa de contacto
- Dirección e información de empresa
- Notas de referencia
- Organización eficiente

### 4.7 Calendario de Actividades
**Ruta**: Dashboard → Calendario

**Características**:
- Crear actividades con tipos: tarea, reunión, recordatorio, evento
- Fechas y horarios específicos
- Marcar como completadas
- Vista de pendientes vs completadas
- Descripción detallada

---

## 5. Sistema de Autenticación

### Flujo de Autenticación

```
Usuario No Autenticado
        ↓
   Pantalla Auth
   ├─ Iniciar Sesión
   └─ Registrarse
        ↓
   Validación en Supabase
        ↓
   Crear Usuario en tabla `usuarios`
        ↓
   Dashboard Principal
```

### Seguridad

- **Email/Password**: Método estándar de Supabase
- **Session Management**: Manejo automático de sesiones
- **JWT Tokens**: Generados automáticamente por Supabase
- **RLS**: Cada usuario solo ve sus datos
- **No confirmación de email**: Deshabilitada por defecto

---

## 6. Esquema de Colores

### Paleta Definida

| Elemento | Color | Código |
|----------|-------|--------|
| Fondo Principal | Negro | #000000 |
| Fondo Secundario | Gris Oscuro | #2D2D2D, #404040 |
| Botones Primarios | Turquesa | #40E0D0 (Cyan: #06B6D4) |
| Botones Secundarios | Verde | #00FF7F (Green: #10B981) |
| Texto Principal | Blanco | #FFFFFF |
| Texto Secundario | Gris Claro | #D1D5DB |
| Fondo Cards | Gris | #1F2937 - #374151 |
| Ingresos | Verde | #10B981 (Dark: #065F46) |
| Egresos | Rojo | #EF4444 (Dark: #7F1D1D) |
| Información | Azul | #3B82F6 |
| Advertencias | Amarillo | #FBBF24 |

### Gradientes Utilizados

- Botones: `from-cyan-500 to-green-500`
- Ingresos: `from-green-900/40 to-green-800/20`
- Egresos: `from-red-900/40 to-red-800/20`
- Balance: `from-cyan-900/40 to-cyan-800/20`

---

## 7. Componentes UI

### Sistema de Diseño

1. **Cards**: Fondo gris oscuro con borde gris, hover efecto turquesa
2. **Botones**: Gradiente, texto negro para acción, gris para cancelar
3. **Modales**: Fondo semitransparente negro, card centrada
4. **Inputs**: Fondo gris oscuro, borde gris, enfoque turquesa
5. **Iconos**: Lucide React, 16-24px de tamaño

### Tipografía

- **Headings**: Bold (700-900)
- **Body**: Regular (400-500)
- **Acciones**: Semibold (600)
- **Font Size**: Sistema de Tailwind estándar

---

## 8. Flujos de Usuarios

### Flujo de Login

```
1. Usuario accede a la aplicación
2. Se muestra pantalla de autenticación
3. Elige "Iniciar Sesión"
4. Ingresa email y contraseña
5. Sistema valida contra Supabase
6. Si es válido → Redirige a Dashboard
7. Si es inválido → Muestra error
```

### Flujo de Registro

```
1. Usuario accede a la aplicación
2. Se muestra pantalla de autenticación
3. Elige "Registrarse"
4. Completa formulario (nombre, email, contraseña)
5. Sistema valida datos
6. Crea cuenta en Supabase
7. Crea registro en tabla `usuarios`
8. Inicia sesión automáticamente
9. Redirige a Dashboard
```

### Flujo de Transacción Financiera

```
1. Usuario en Dashboard → Finanzas
2. Hace clic en "Nueva Transacción"
3. Selecciona tipo (ingreso/egreso)
4. Elige categoría según tipo
5. Ingresa monto, fecha, descripción
6. Hace clic en Guardar
7. Sistema valida datos
8. Inserta en tabla `transacciones_financieras`
9. Actualiza métricas del Dashboard
10. Muestra confirmación
```

---

## 9. Guía de Instalación y Despliegue

### Requisitos Previos

- Node.js 18+ instalado
- NPM o Yarn
- Cuenta de Supabase activa
- Variables de entorno configuradas

### Instalación Local

```bash
# 1. Clonar repositorio (si aplica)
git clone <repository-url>
cd xonting-center

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con:
VITE_SUPABASE_URL=<tu-supabase-url>
VITE_SUPABASE_ANON_KEY=<tu-supabase-anon-key>

# 4. Ejecutar desarrollo
npm run dev

# 5. Compilar producción
npm run build

# 6. Vista previa de producción
npm run preview
```

### Despliegue en Producción

**Opciones Recomendadas**:
1. **Vercel** (Recomendado para Vite+React)
2. **Netlify**
3. **Firebase Hosting**
4. **AWS Amplify**

**Pasos Generales**:
1. Pushear código a GitHub
2. Conectar repositorio a plataforma de deploy
3. Configurar variables de entorno en panel
4. Configurar comando de build: `npm run build`
5. Configurar directorio de salida: `dist/`
6. Realizar deploy

---

## 10. Mejoras Futuras

### Fase 2 - Analytics Avanzados
- Gráficos de tendencias financieras
- Reportes exportables (PDF, Excel)
- Análisis de rentabilidad por producto
- Proyecciones financieras

### Fase 3 - Automatización
- Recordatorios automáticos
- Alertas de bajo stock
- Generación automática de reportes
- Integraciones con servicios externos

### Fase 4 - Movilidad
- Aplicación PWA (Progressive Web App)
- Sincronización offline
- Notificaciones push
- Optimización móvil completa

### Fase 5 - Equipo Colaborativo
- Módulo multi-usuario (opcional)
- Sistema de permisos
- Historial de cambios
- Auditoría completa

---

## 11. Mantenimiento y Monitoreo

### Backup de Datos

Supabase proporciona:
- Backups automáticos diarios
- Retención de 7-30 días
- Opción de backup manual desde dashboard
- Exportación de datos en SQL

### Monitoreo

- Revisar logs de aplicación periódicamente
- Monitorear uso de storage
- Revisar auditoría de accesos
- Verificar integridad de datos

### Actualizaciones

- Mantener dependencias actualizadas
- Revisar vulnerabilidades con `npm audit`
- Testear cambios en desarrollo antes de producción
- Realizar backup antes de grandes cambios

---

## 12. Soporte y Contacto

Para problemas o sugerencias:
- Revisar documentación en `XONTING_CENTER_DOCUMENTACION.md`
- Consultar logs del navegador (F12)
- Revisar estado de Supabase
- Contactar al equipo de desarrollo

---

**Versión**: 1.0.0
**Fecha**: Noviembre 2024
**Desarrollador**: Claude Code
**Propietario**: Lorenzo
**Estado**: Producción Listo
