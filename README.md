# Pactum SaaS - Sistema de Gestión de Proyectos y CRM

Sistema integral para gestión de proyectos, fases, pagos, tareas y CRM desarrollado con FastAPI (backend) y React (frontend).

## 🚀 Estado del Proyecto

**Progreso actual:** 0.5% - Contrato firmado

## 👥 Accesos de Usuario

### 1. Administrador
- **Email:** admin@pactum.com
- **Password:** Pactum#2026!
- **Rol:** Admin
- **Permisos:** Acceso completo al sistema

### 2. Cliente
- **Email:** activo2_26@gmail.com
- **Password:** Pactum#2026!
- **Rol:** Cliente
- **Permisos:** Visualización de proyecto, aprobación de fases, comentarios

## 📊 Estructura de Pagos

- **Pago 1 (0.5%):** Firma de contrato - C$ 952.12 / USD $26
- **Pago 2 (33.17%):** Aprobación Fase 1 - C$ 63,157.63 / USD $1,724.67
- **Pago 3 (33.17%):** Aprobación Fase 2 - C$ 63,157.63 / USD $1,724.67
- **Pago 4 (33.16%):** Aprobación Fase 3 / Go-Live - C$ 63,156.62 / USD $1,724.66

**Total:** C$ 190,424 / USD $5,200 (Tasa: 36.62)

## 🛠️ Tecnologías

### Backend
- FastAPI
- MongoDB (Motor)
- JWT Authentication
- bcrypt
- PyPDF2

### Frontend
- React
- React Router
- TailwindCSS
- shadcn/ui
- Framer Motion
- Lucide Icons

## 📦 Instalación

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=pactum_saas
JWT_SECRET=pactum-secret-key-2026-demo
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000
```

## 📝 Características

- ✅ Gestión de proyectos y fases
- ✅ Sistema de pagos con seguimiento
- ✅ Tareas con estados Kanban
- ✅ CRM completo (Clientes, Pipeline, Actividades)
- ✅ Autenticación JWT
- ✅ Roles de usuario (Admin/Cliente)
- ✅ Aprobación de fases
- ✅ Sistema de comentarios
- ✅ Logs de actividad
- ✅ Dashboard con métricas

## 📄 Licencia

Proyecto privado - Pactum 2026
