# Guía de Despliegue en Producción

## 📦 Arquitectura de Producción

- **Backend:** Render (Web Service)
- **Base de Datos:** MongoDB Atlas (Cloud)
- **Frontend:** Netlify o Vercel

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo cluster (Free tier M0 es suficiente para empezar)
4. Espera a que el cluster se cree (2-3 minutos)

### 1.2 Configurar Acceso

1. **Database Access:**
   - Ve a "Database Access" en el menú lateral
   - Click en "Add New Database User"
   - Username: `pactum_admin`
   - Password: Genera una contraseña segura (guárdala)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access:**
   - Ve a "Network Access"
   - Click "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### 1.3 Obtener Connection String

1. Ve a "Database" → "Connect"
2. Selecciona "Connect your application"
3. Driver: Python, Version: 3.12 or later
4. Copia el connection string, se verá así:
   ```
   mongodb+srv://pactum_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Reemplaza `<password>` con tu contraseña real
6. Agrega el nombre de la base de datos antes del `?`:
   ```
   mongodb+srv://pactum_admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/pactum_saas?retryWrites=true&w=majority
   ```

## 🚀 Paso 2: Desplegar Backend en Render

### 2.1 Preparar Repositorio

**IMPORTANTE:** Todo el código del backend ya está listo. Solo necesitas:

1. Asegurarte de que `backend/server_multitenant.py` existe
2. Asegurarte de que `backend/requirements.txt` existe
3. Asegurarte de que `backend/init_database.py` existe

### 2.2 Subir a GitHub

```bash
cd "c:\Users\Probook 450 G7\Downloads\pactum-saas"

# Si no has inicializado git
git init
git add .
git commit -m "Multi-tenant SaaS platform ready for production"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/pactum-saas.git
git branch -M main
git push -u origin main
```

### 2.3 Crear Web Service en Render

1. Ve a [Render](https://render.com)
2. Crea una cuenta o inicia sesión
3. Click en "New +" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Configura el servicio:

   **Configuración Básica:**
   - Name: `pactum-saas-backend`
   - Region: Oregon (US West) o el más cercano
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python server_multitenant.py`

   **Plan:**
   - Selecciona "Free" (para empezar)

### 2.4 Configurar Variables de Entorno en Render

En la sección "Environment Variables" agrega:

```
MONGO_URL=mongodb+srv://pactum_admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/pactum_saas?retryWrites=true&w=majority
DB_NAME=pactum_saas
JWT_SECRET=tu-secret-key-super-segura-cambiala-en-produccion
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://tu-frontend.netlify.app,https://pactum-saas.netlify.app
```

**IMPORTANTE:** 
- Cambia `MONGO_URL` por tu connection string real de MongoDB Atlas
- Cambia `JWT_SECRET` por una clave segura única
- Actualiza `CORS_ORIGINS` con la URL de tu frontend cuando la tengas

### 2.5 Deploy

1. Click en "Create Web Service"
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias (`pip install -r requirements.txt`)
   - Iniciará el servidor (`python server_multitenant.py`)
3. Espera 2-5 minutos para el primer deploy
4. Tu backend estará disponible en: `https://pactum-saas-backend.onrender.com`

### 2.6 Inicializar Base de Datos

**Opción 1: Desde Render Shell**
1. En Render, ve a tu servicio
2. Click en "Shell" en el menú superior
3. Ejecuta:
   ```bash
   python init_database.py
   ```

**Opción 2: Desde tu computadora**
```bash
# Actualiza MONGO_URL en backend/.env con tu MongoDB Atlas URL
cd backend
python init_database.py
```

**Opción 3: Via API**
```bash
curl -X POST https://pactum-saas-backend.onrender.com/api/seed/init
```

## 🌐 Paso 3: Desplegar Frontend en Netlify

### 3.1 Configurar Variables de Entorno del Frontend

Edita `frontend/.env.production`:

```env
REACT_APP_BACKEND_URL=https://pactum-saas-backend.onrender.com
```

### 3.2 Build Local (Opcional - para verificar)

```bash
cd frontend
npm install
npm run build
```

### 3.3 Desplegar en Netlify

**Opción A: Desde GitHub (Recomendado)**

1. Ve a [Netlify](https://www.netlify.com)
2. Crea cuenta o inicia sesión
3. Click "Add new site" → "Import an existing project"
4. Conecta GitHub y selecciona tu repositorio
5. Configura:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
6. En "Environment variables" agrega:
   ```
   REACT_APP_BACKEND_URL=https://pactum-saas-backend.onrender.com
   ```
7. Click "Deploy site"

**Opción B: Deploy Manual**

```bash
cd frontend
npm install
npm run build

# Instalar Netlify CLI
npm install -g netlify-cli

# Login y deploy
netlify login
netlify deploy --prod --dir=build
```

### 3.4 Configurar Dominio Personalizado (Opcional)

1. En Netlify, ve a "Domain settings"
2. Click "Add custom domain"
3. Sigue las instrucciones para configurar DNS

## 🔄 Actualizar CORS en Backend

Una vez que tengas la URL de Netlify, actualiza las variables de entorno en Render:

```
CORS_ORIGINS=https://tu-app.netlify.app,https://pactum-saas.netlify.app
```

Render redesplegará automáticamente.

## ✅ Verificación Post-Despliegue

### 1. Verificar Backend
```bash
curl https://pactum-saas-backend.onrender.com/health
# Debe retornar: {"status":"healthy"}
```

### 2. Verificar API
```bash
curl https://pactum-saas-backend.onrender.com/api/modules
# Debe retornar lista de módulos
```

### 3. Verificar Frontend
- Abre tu URL de Netlify
- Deberías ver el landing page
- Intenta hacer login con las credenciales creadas

### 4. Probar Registro de Empresa
- Ve al landing page
- Registra una nueva empresa
- Verifica que el trial se active correctamente

## 🔐 Credenciales de Producción

Después de ejecutar `init_database.py` en producción:

**SUPER ADMIN (Software Nicaragua):**
- Email: admin@softwarenicaragua.com
- Password: SoftwareNic2026!

**CLIENTE PACTUM (Amaru Mojica):**
- Email: admin@pactum.com
- Password: Pactum#2026!

**EMPRESA DEMO:**
- Email: admin@demo.com
- Password: Demo2026!

## 📝 Notas Importantes

### Render Free Tier
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera petición después de dormir tarda ~30 segundos
- Para evitar esto, considera:
  - Upgrade a plan pagado ($7/mes)
  - Usar un servicio de "keep-alive" (ping cada 10 minutos)

### MongoDB Atlas Free Tier
- 512 MB de almacenamiento
- Suficiente para ~1000 empresas con datos moderados
- Monitorea el uso en el dashboard de Atlas

### Backups
- MongoDB Atlas hace backups automáticos (en planes pagados)
- Para free tier, exporta datos periódicamente:
  ```bash
  curl https://pactum-saas-backend.onrender.com/api/admin/metrics \
    -H "Authorization: Bearer YOUR_TOKEN" > backup.json
  ```

### Seguridad en Producción

1. **Cambiar JWT_SECRET:**
   - Genera una clave segura única
   - Nunca uses la misma que en desarrollo

2. **HTTPS:**
   - Render y Netlify proveen HTTPS automáticamente
   - Nunca uses HTTP en producción

3. **Variables de Entorno:**
   - Nunca hagas commit de `.env` con credenciales reales
   - Usa las variables de entorno de Render/Netlify

4. **MongoDB:**
   - Usa contraseñas fuertes
   - Restringe acceso por IP si es posible
   - Habilita autenticación de 2 factores en MongoDB Atlas

## 🔄 Proceso de Actualización

### Backend
```bash
# Hacer cambios en el código
git add .
git commit -m "Actualización backend"
git push origin main

# Render redesplegará automáticamente
```

### Frontend
```bash
# Hacer cambios en el código
git add .
git commit -m "Actualización frontend"
git push origin main

# Netlify redesplegará automáticamente
```

## 🐛 Troubleshooting

### Backend no inicia en Render
- Revisa los logs en Render Dashboard
- Verifica que `MONGO_URL` sea correcto
- Verifica que todas las dependencias estén en `requirements.txt`

### Frontend no conecta con Backend
- Verifica `REACT_APP_BACKEND_URL` en variables de entorno
- Verifica CORS en backend
- Revisa la consola del navegador para errores

### Error de MongoDB
- Verifica que el cluster esté activo en MongoDB Atlas
- Verifica que la IP esté permitida (0.0.0.0/0)
- Verifica usuario y contraseña

## 📊 Monitoreo

### Render
- Dashboard muestra CPU, memoria, requests
- Logs en tiempo real disponibles

### MongoDB Atlas
- Dashboard muestra conexiones, operaciones, storage
- Alertas configurables

### Netlify
- Analytics de tráfico
- Logs de deploy

---

## 🎉 ¡Listo!

Tu aplicación Multi-Tenant SaaS está ahora en producción y lista para escalar.

**URLs de Ejemplo:**
- Backend: https://pactum-saas-backend.onrender.com
- Frontend: https://pactum-saas.netlify.app
- MongoDB: Cluster en MongoDB Atlas

**Próximos Pasos:**
1. Configurar dominio personalizado
2. Configurar email (SendGrid, Mailgun)
3. Agregar analytics (Google Analytics, Mixpanel)
4. Configurar monitoreo (Sentry para errores)
5. Implementar backups automáticos
