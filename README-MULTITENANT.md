# Pactum SaaS - Multi-Tenant ERP/CRM Platform

Sistema Multi-Tenant completo con arquitectura empresarial para gestión de múltiples empresas, clientes y actividades.

## 🎯 Características Principales

### Multi-Tenant Real
- **Aislamiento de datos** por empresa (tenant)
- **Super Admin Global** con control total del sistema
- **Administradores de Empresa** con gestión independiente
- **Trial automático** de 14 días para nuevas empresas
- **Módulos configurables** por empresa

### Roles y Jerarquía

#### 1. SUPER_ADMIN (Super Administrador Global)
- **Usuario:** Amaru Mojica
- **Email:** amaru@softwarenicaragua.com
- **Password:** SuperAdmin2026!
- **Permisos:**
  - Crear, editar y desactivar empresas
  - Asignar módulos a empresas
  - Extender trials
  - Activar/suspender suscripciones
  - Ver métricas globales del sistema

#### 2. COMPANY_ADMIN (Administrador de Empresa)
- **Empresa Demo:** admin@demo.com / Demo2026!
- **Software Nicaragua:** admin@softwarenicaragua.com / Admin2026!
- **Permisos:**
  - Gestión completa de clientes
  - Gestión de actividades y tareas
  - Crear usuarios en su empresa
  - Ver estadísticas de su empresa

#### 3. USER (Usuario Regular)
- **Permisos:**
  - Ver y gestionar clientes
  - Crear y gestionar actividades
  - Ver actividades asignadas

## 🚀 Instalación y Configuración

### Backend

```bash
cd backend
pip install -r requirements.txt

# Configurar variables de entorno
# El archivo .env ya existe con la configuración de MongoDB

# Inicializar datos de demostración
python -c "
import asyncio
from server_multitenant import app, db, seedInitialData
asyncio.run(seedInitialData())
"

# Ejecutar servidor
python server_multitenant.py
```

El servidor estará disponible en `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install

# Actualizar src/index.js para usar App-multitenant.js
# Actualizar src/App.js con el contenido de App-multitenant.js

npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📊 Estructura de Base de Datos

### Colecciones MongoDB

#### companies
```javascript
{
  id: "uuid",
  name: "Nombre Empresa",
  email: "contacto@empresa.com",
  phone: "+505 8888-8888",
  logo_url: null,
  primary_color: "#3b82f6",
  secondary_color: "#1e40af",
  status: "active", // active, suspended, cancelled
  subscription_status: "trial", // trial, active, suspended, cancelled
  trial_ends_at: "2026-01-20T00:00:00Z",
  trial_started_at: "2026-01-06T00:00:00Z",
  active_modules: ["clients", "activities", "calendar"],
  created_at: "2026-01-06T00:00:00Z",
  updated_at: "2026-01-06T00:00:00Z"
}
```

#### users
```javascript
{
  id: "uuid",
  email: "usuario@empresa.com",
  password: "hashed_password",
  name: "Nombre Usuario",
  role: "COMPANY_ADMIN", // SUPER_ADMIN, COMPANY_ADMIN, USER
  company_id: "uuid", // null para SUPER_ADMIN
  status: "active",
  created_at: "2026-01-06T00:00:00Z"
}
```

#### clients
```javascript
{
  id: "uuid",
  name: "Cliente Demo",
  email: "cliente@demo.com",
  phone: "+505 8888-0001",
  company_name: "Empresa Cliente",
  address: "Dirección",
  city: "Managua",
  country: "Nicaragua",
  tags: ["demo", "cliente"],
  notes: "Notas del cliente",
  company_id: "uuid", // ID de la empresa dueña
  status: "active",
  created_by: "uuid",
  created_at: "2026-01-06T00:00:00Z",
  updated_at: "2026-01-06T00:00:00Z"
}
```

#### activities
```javascript
{
  id: "uuid",
  title: "Actividad Demo",
  description: "Descripción",
  type: "llamada", // llamada, reunion, tarea, seguimiento, email
  client_id: "uuid",
  assigned_to: "uuid",
  start_date: "2026-01-06T10:00:00Z",
  end_date: "2026-01-06T11:00:00Z",
  status: "pendiente", // pendiente, en_progreso, completada
  priority: "media", // baja, media, alta
  company_id: "uuid",
  created_by: "uuid",
  completed: false,
  created_at: "2026-01-06T00:00:00Z",
  updated_at: "2026-01-06T00:00:00Z"
}
```

#### activity_logs
```javascript
{
  id: "uuid",
  entity_type: "client", // client, activity, company, user
  entity_id: "uuid",
  action: "created", // created, updated, deleted
  user_id: "uuid",
  user_name: "Usuario",
  company_id: "uuid",
  changes: {},
  timestamp: "2026-01-06T00:00:00Z"
}
```

## 🔐 API Endpoints

### Públicos (Sin autenticación)

#### POST /api/public/register-company
Registrar nueva empresa con trial de 14 días
```json
{
  "name": "Mi Empresa",
  "email": "contacto@miempresa.com",
  "phone": "+505 8888-8888",
  "admin_name": "Admin Principal",
  "admin_email": "admin@miempresa.com",
  "admin_password": "Password123!",
  "selected_modules": ["clients", "activities", "calendar"]
}
```

### Autenticación

#### POST /api/auth/login
```json
{
  "email": "usuario@empresa.com",
  "password": "password"
}
```

#### GET /api/auth/me
Obtener información del usuario actual

### Super Admin (Requiere SUPER_ADMIN)

#### GET /api/admin/companies
Listar todas las empresas

#### GET /api/admin/companies/{company_id}
Detalles de una empresa

#### PUT /api/admin/companies/{company_id}
Actualizar empresa

#### POST /api/admin/companies/{company_id}/modules
Asignar módulos a empresa
```json
["clients", "activities", "calendar", "pipeline"]
```

#### POST /api/admin/companies/{company_id}/subscription
Actualizar suscripción
```json
{
  "status": "active",
  "plan_type": "professional",
  "trial_days_extension": 7
}
```

#### GET /api/admin/metrics
Métricas globales del sistema

### Gestión de Clientes

#### GET /api/clients
Listar clientes de la empresa

#### POST /api/clients
Crear cliente

#### GET /api/clients/{client_id}
Obtener cliente

#### PUT /api/clients/{client_id}
Actualizar cliente

#### DELETE /api/clients/{client_id}
Eliminar cliente

### Gestión de Actividades

#### GET /api/activities
Listar actividades (con filtros opcionales: start_date, end_date, type, status)

#### POST /api/activities
Crear actividad

#### GET /api/activities/{activity_id}
Obtener actividad

#### PUT /api/activities/{activity_id}
Actualizar actividad

#### DELETE /api/activities/{activity_id}
Eliminar actividad

### Gestión de Usuarios de Empresa

#### GET /api/company/users
Listar usuarios de la empresa

#### POST /api/company/users
Crear usuario en la empresa

### Dashboard

#### GET /api/dashboard/stats
Estadísticas del dashboard (globales para SUPER_ADMIN, de empresa para otros)

### Módulos

#### GET /api/modules
Listar módulos disponibles

### Logs

#### GET /api/activity-logs
Logs de actividad (filtrable por entity_type y limit)

### Inicialización

#### POST /api/seed/init
Inicializar datos de demostración (solo primera vez)

## 🎨 Módulos Disponibles

1. **clients** - Gestión de Clientes
2. **activities** - Actividades y Tareas
3. **calendar** - Vista de Calendario
4. **pipeline** - Pipeline de Ventas
5. **projects** - Gestión de Proyectos
6. **invoicing** - Facturación
7. **reports** - Reportes y Análisis

## 🔄 Flujo de Registro y Trial

1. **Empresa se registra** en `/` (Landing Page)
2. **Selecciona módulos** a activar
3. **Trial de 14 días** se activa automáticamente
4. **Acceso completo** a módulos seleccionados
5. Al finalizar trial:
   - Super Admin puede extender trial
   - Super Admin puede activar suscripción
   - Empresa queda bloqueada hasta activación

## 📱 Páginas Frontend

### Públicas
- `/` - Landing Page con registro
- `/login` - Inicio de sesión

### Autenticadas
- `/dashboard` - Dashboard (Super Admin o Empresa)
- `/clientes` - Gestión de Clientes
- `/actividades` - Gestión de Actividades (con vista calendario)

## 🎯 Características Implementadas

### ✅ Multi-Tenant
- Aislamiento completo de datos por empresa
- Verificación de permisos en cada endpoint
- Filtrado automático por company_id

### ✅ Autenticación y Autorización
- JWT tokens con expiración
- Roles jerárquicos (SUPER_ADMIN > COMPANY_ADMIN > USER)
- Middleware de verificación de permisos

### ✅ Gestión de Clientes
- CRUD completo
- Búsqueda y filtrado
- Información detallada (empresa, contacto, ubicación)

### ✅ Gestión de Actividades
- CRUD completo
- Tipos: llamada, reunión, tarea, seguimiento, email
- Prioridades: baja, media, alta
- Estados: pendiente, en_progreso, completada
- Asignación a usuarios
- Vinculación con clientes
- **Vista de Lista** con filtros
- **Vista de Calendario** mensual interactiva

### ✅ Dashboard
- Métricas en tiempo real
- Actividades recientes
- Clientes recientes
- Estadísticas por empresa

### ✅ Super Admin
- Gestión de todas las empresas
- Asignación de módulos
- Control de suscripciones
- Extensión de trials
- Métricas globales

### ✅ UI/UX Moderna
- Diseño inspirado en Linear, Notion, Vercel
- Componentes shadcn/ui
- TailwindCSS
- Animaciones con Framer Motion
- Iconos Lucide
- Responsive design

## 🔧 Tecnologías

### Backend
- **FastAPI** - Framework web moderno
- **MongoDB** (Motor) - Base de datos NoSQL
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Pydantic** - Validación de datos

### Frontend
- **React 19** - Framework UI
- **React Router** - Navegación
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes
- **Lucide Icons** - Iconografía
- **date-fns** - Manejo de fechas
- **Axios** - Cliente HTTP
- **Sonner** - Notificaciones

## 📝 Próximos Pasos

1. **Despliegue en Producción**
   - Backend en Render
   - Frontend en Netlify/Vercel
   - MongoDB Atlas

2. **Funcionalidades Adicionales**
   - Pipeline de ventas
   - Gestión de proyectos
   - Facturación
   - Reportes avanzados
   - Notificaciones en tiempo real
   - Integración con email
   - Webhooks

3. **Mejoras**
   - Búsqueda avanzada
   - Exportación de datos
   - Importación masiva
   - Personalización de branding por empresa
   - Multi-idioma
   - Modo oscuro

## 🎓 Usuarios de Demostración

### Super Admin
- **Email:** amaru@softwarenicaragua.com
- **Password:** SuperAdmin2026!
- **Acceso:** Total al sistema

### Software Nicaragua (Empresa con privilegios)
- **Email:** admin@softwarenicaragua.com
- **Password:** Admin2026!
- **Acceso:** Todos los módulos, puede tener sus propios clientes

### Empresa Demo (Trial)
- **Email:** admin@demo.com
- **Password:** Demo2026!
- **Acceso:** Módulos básicos en trial
- **Incluye:** 5 clientes demo, 10 actividades demo

## 📄 Licencia

Proyecto privado - Pactum 2026

---

**Desarrollado con ❤️ para Software Nicaragua**
