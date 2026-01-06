# Guía de Configuración - Pactum SaaS Multi-Tenant

## 🚀 Inicio Rápido

### Paso 1: Inicializar Base de Datos

```bash
cd backend

# Asegúrate de que MongoDB esté corriendo
# Si usas MongoDB local: mongod

# Inicializar datos de demostración
python -c "
import asyncio
import sys
sys.path.append('.')
from server_multitenant import app, db, api_router

async def init():
    from server_multitenant import seed_initial_data
    result = await seed_initial_data()
    print(result)

asyncio.run(init())
"
```

### Paso 2: Actualizar Frontend

Necesitas actualizar los archivos principales del frontend para usar la versión multi-tenant:

#### 2.1 Actualizar src/index.js

Cambia la importación de App:
```javascript
// Cambiar de:
import App from './App';

// A:
import App from './App-multitenant';
```

#### 2.2 O renombrar archivos

```bash
cd frontend/src

# Respaldar archivos originales
mv App.js App-original.js
mv lib/auth.js lib/auth-original.js
mv lib/api.js lib/api-original.js
mv components/DashboardLayout.jsx components/DashboardLayout-original.jsx
mv pages/Login.jsx pages/Login-original.jsx

# Usar versiones multi-tenant
cp App-multitenant.js App.js
cp lib/auth-multitenant.js lib/auth.js
cp lib/api-multitenant.js lib/api.js
cp components/DashboardLayout-multitenant.jsx components/DashboardLayout.jsx
cp pages/Login-multitenant.jsx pages/Login.jsx
```

### Paso 3: Configurar Variables de Entorno

#### Backend (.env ya configurado)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
JWT_SECRET=pactum-secret-key-2026-demo
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Paso 4: Instalar Dependencias

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### Paso 5: Ejecutar Aplicación

#### Terminal 1 - Backend
```bash
cd backend
python server_multitenant.py
```

El backend estará en: http://localhost:8000

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

El frontend estará en: http://localhost:3000

## 🔐 Acceso al Sistema

### Landing Page
Visita: http://localhost:3000

Desde aquí puedes:
- Registrar una nueva empresa
- Seleccionar módulos
- Activar trial de 14 días automáticamente

### Login Directo
Visita: http://localhost:3000/login

#### Super Admin
- **Email:** amaru@softwarenicaragua.com
- **Password:** SuperAdmin2026!
- **Capacidades:**
  - Ver todas las empresas
  - Gestionar suscripciones
  - Asignar módulos
  - Extender trials
  - Ver métricas globales

#### Software Nicaragua (Empresa)
- **Email:** admin@softwarenicaragua.com
- **Password:** Admin2026!
- **Capacidades:**
  - Gestionar clientes propios
  - Crear actividades
  - Gestionar usuarios de la empresa
  - Todos los módulos activos

#### Empresa Demo (Trial)
- **Email:** admin@demo.com
- **Password:** Demo2026!
- **Capacidades:**
  - Trial de 14 días
  - 5 clientes de demostración
  - 10 actividades de demostración
  - Módulos: clients, activities, calendar

## 📊 Verificar Instalación

### 1. Verificar Backend
```bash
curl http://localhost:8000/health
# Debe retornar: {"status":"healthy"}
```

### 2. Verificar API
```bash
curl http://localhost:8000/api/modules
# Debe retornar lista de módulos disponibles
```

### 3. Verificar Datos Iniciales
```bash
# Login como Super Admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amaru@softwarenicaragua.com","password":"SuperAdmin2026!"}'

# Debe retornar token y datos de usuario
```

## 🔧 Solución de Problemas

### Error: MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
mongosh
# o
mongo

# Si no está instalado, instalar MongoDB Community Edition
```

### Error: Puerto 8000 en uso
```bash
# Cambiar puerto en server_multitenant.py (última línea)
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Error: Puerto 3000 en uso
```bash
# React preguntará si quieres usar otro puerto
# O especificar manualmente:
PORT=3001 npm start
```

### Error: Módulos no encontrados (Frontend)
```bash
cd frontend
npm install
# Si persiste:
rm -rf node_modules package-lock.json
npm install
```

### Error: Datos no se guardan
```bash
# Verificar conexión a MongoDB
# Verificar que DB_NAME en .env sea correcto
# Verificar logs del backend
```

## 📝 Comandos Útiles

### Reiniciar Base de Datos
```bash
# Conectar a MongoDB
mongosh

# Usar base de datos
use test_database

# Eliminar todas las colecciones
db.companies.drop()
db.users.drop()
db.clients.drop()
db.activities.drop()
db.activity_logs.drop()

# Salir
exit

# Reinicializar datos
cd backend
python -c "import asyncio; from server_multitenant import seed_initial_data; asyncio.run(seed_initial_data())"
```

### Ver Logs de MongoDB
```bash
mongosh
use test_database

# Ver empresas
db.companies.find().pretty()

# Ver usuarios
db.users.find({}, {password: 0}).pretty()

# Ver clientes
db.clients.find().pretty()

# Ver actividades
db.activities.find().pretty()
```

### Crear Usuario de Prueba
```bash
curl -X POST http://localhost:8000/api/public/register-company \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Empresa Test",
    "email": "test@empresa.com",
    "phone": "+505 8888-9999",
    "admin_name": "Admin Test",
    "admin_email": "admin@test.com",
    "admin_password": "Test2026!",
    "selected_modules": ["clients", "activities", "calendar"]
  }'
```

## 🎯 Próximos Pasos

1. **Explorar el Sistema**
   - Registra una empresa desde el landing
   - Crea clientes
   - Crea actividades
   - Prueba la vista de calendario

2. **Como Super Admin**
   - Gestiona empresas
   - Asigna módulos
   - Extiende trials
   - Activa suscripciones

3. **Personalizar**
   - Agrega tu logo
   - Personaliza colores
   - Agrega más módulos

## 📞 Soporte

Para problemas o preguntas:
- Revisa los logs del backend
- Revisa la consola del navegador
- Verifica la documentación en README-MULTITENANT.md

---

**¡Listo para usar! 🎉**
