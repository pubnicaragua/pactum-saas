# 🔄 Flujo de Trabajo: Desarrollo Local → Producción

## 📋 Resumen

Este documento explica cómo trabajar localmente y desplegar cambios al servidor de producción.

---

## 🏠 Desarrollo Local (Tu Computadora)

### 1. Configuración Inicial Local

```bash
# Ya tienes el repositorio clonado
cd "c:\Users\Probook 450 G7\Downloads\pactum-saas"

# Backend local
cd backend
python -m venv venv
venv\Scripts\activate  # En Windows
pip install -r requirements.txt
python init_database.py  # Solo la primera vez
python server_multitenant.py

# Frontend local (en otra terminal)
cd frontend
npm install
npm start
```

**URLs Locales:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 💻 Flujo de Desarrollo

### 1. Hacer Cambios Localmente

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Hacer cambios en el código
# Probar localmente

# Ver cambios
git status
git diff

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Descripción de la funcionalidad"
```

### 2. Probar Localmente

```bash
# Backend: Verificar que no hay errores
cd backend
python server_multitenant.py

# Frontend: Verificar que compila
cd frontend
npm start

# Probar en navegador
# http://localhost:3000
```

### 3. Subir a GitHub

```bash
# Subir rama
git push origin feature/nueva-funcionalidad

# O si trabajas directo en main (no recomendado pero funcional)
git push origin main
```

---

## 🚀 Despliegue a Producción

### Opción A: Despliegue Automático (Recomendado)

```bash
# Conectarse al servidor
ssh -p 1510 extel@186.1.56.251

# Ejecutar script de actualización
cd /var/www/pactum-saas
./deploy.sh update
```

### Opción B: Despliegue Manual

```bash
# Conectarse al servidor
ssh -p 1510 extel@186.1.56.251

# Ir al directorio
cd /var/www/pactum-saas

# Descargar cambios
git pull origin main

# Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart pactum-backend

# Actualizar frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx

# Verificar
curl http://localhost:8000/health
```

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar Servicios

```bash
# En el servidor
./deploy.sh status

# O manualmente
sudo systemctl status pactum-backend
sudo systemctl status nginx
sudo systemctl status mongod
```

### 2. Verificar Logs

```bash
# Ver logs en tiempo real
./deploy.sh logs

# O manualmente
sudo journalctl -u pactum-backend -f
```

### 3. Probar en Navegador

- Abrir: `http://186.1.56.251`
- Login con: `admin@pactum.com` / `Pactum#2026!`
- Verificar funcionalidad nueva

---

## 📁 Estructura de Archivos

```
pactum-saas/
├── backend/
│   ├── server_multitenant.py    # API principal
│   ├── init_database.py         # Inicialización DB
│   ├── requirements.txt         # Dependencias Python
│   └── venv/                    # Entorno virtual
├── frontend/
│   ├── src/
│   │   ├── pages/              # Páginas React
│   │   ├── components/         # Componentes
│   │   └── lib/                # Utilidades y API
│   ├── build/                  # Build de producción
│   └── package.json            # Dependencias Node
├── deploy.sh                   # Script de despliegue
├── DEPLOYMENT_GUIDE.md         # Guía completa
└── LOCAL_TO_PRODUCTION.md      # Este archivo
```

---

## 🔄 Casos de Uso Comunes

### Caso 1: Agregar Nueva Funcionalidad

**Local:**
```bash
# 1. Crear código nuevo
# Ejemplo: Agregar nuevo endpoint en backend/server_multitenant.py

# 2. Probar localmente
python server_multitenant.py

# 3. Commit y push
git add .
git commit -m "feat: Nueva funcionalidad X"
git push origin main
```

**Producción:**
```bash
ssh -p 1510 extel@186.1.56.251
cd /var/www/pactum-saas
./deploy.sh update
```

### Caso 2: Corregir Bug

**Local:**
```bash
# 1. Identificar y corregir bug
# 2. Probar que funciona
# 3. Commit y push
git add .
git commit -m "fix: Corregir problema con X"
git push origin main
```

**Producción:**
```bash
ssh -p 1510 extel@186.1.56.251
cd /var/www/pactum-saas
./deploy.sh update
```

### Caso 3: Actualizar Dependencias

**Local:**
```bash
# Backend
cd backend
pip install nueva-libreria
pip freeze > requirements.txt

# Frontend
cd frontend
npm install nueva-libreria

# Commit
git add requirements.txt package.json package-lock.json
git commit -m "chore: Actualizar dependencias"
git push origin main
```

**Producción:**
```bash
ssh -p 1510 extel@186.1.56.251
cd /var/www/pactum-saas
./deploy.sh update
```

### Caso 4: Cambios en Base de Datos

**Local:**
```bash
# 1. Modificar init_database.py o crear script de migración
# 2. Probar localmente
python init_database.py

# 3. Commit
git add .
git commit -m "db: Actualizar estructura de datos"
git push origin main
```

**Producción:**
```bash
ssh -p 1510 extel@186.1.56.251
cd /var/www/pactum-saas

# Backup primero!
./deploy.sh backup

# Actualizar
git pull origin main
cd backend
source venv/bin/activate
python tu_script_migracion.py
./deploy.sh restart
```

---

## 🛡️ Mejores Prácticas

### 1. Siempre Probar Localmente Primero
```bash
# Backend
cd backend
python server_multitenant.py
# Verificar en http://localhost:8000/docs

# Frontend
cd frontend
npm start
# Verificar en http://localhost:3000
```

### 2. Commits Descriptivos
```bash
# ❌ Mal
git commit -m "cambios"

# ✅ Bien
git commit -m "feat: Agregar sistema de notificaciones de hitos"
git commit -m "fix: Corregir cálculo de progreso en proyectos"
git commit -m "refactor: Optimizar consultas de base de datos"
```

### 3. Backup Antes de Cambios Importantes
```bash
# En producción
ssh -p 1510 extel@186.1.56.251
cd /var/www/pactum-saas
./deploy.sh backup
```

### 4. Monitorear Logs Después de Desplegar
```bash
# En producción
./deploy.sh logs
# Verificar que no hay errores
```

### 5. Rollback si Algo Sale Mal
```bash
# En producción
cd /var/www/pactum-saas
git log --oneline  # Ver commits
git checkout <commit-anterior>
./deploy.sh restart
```

---

## 🔧 Comandos Útiles

### En Local (Windows)

```powershell
# Ver puertos en uso
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <pid> /F

# Ver logs de Git
git log --oneline --graph --all

# Ver diferencias
git diff
git diff --staged
```

### En Producción (Ubuntu)

```bash
# Ver puertos en uso
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :80

# Ver procesos
ps aux | grep uvicorn
ps aux | grep nginx

# Espacio en disco
df -h

# Uso de memoria
free -h

# Logs del sistema
sudo journalctl -xe

# Reiniciar servicios
sudo systemctl restart pactum-backend
sudo systemctl restart nginx
```

---

## 🚨 Troubleshooting

### Problema: Cambios no se reflejan en producción

**Solución:**
```bash
# En producción
cd /var/www/pactum-saas
git status  # Ver si hay cambios locales
git reset --hard origin/main  # Descartar cambios locales
git pull origin main
./deploy.sh update
```

### Problema: Backend no inicia después de actualizar

**Solución:**
```bash
# Ver logs
sudo journalctl -u pactum-backend -n 50

# Verificar dependencias
cd /var/www/pactum-saas/backend
source venv/bin/activate
pip install -r requirements.txt

# Reintentar
sudo systemctl restart pactum-backend
```

### Problema: Frontend muestra página en blanco

**Solución:**
```bash
# Reconstruir frontend
cd /var/www/pactum-saas/frontend
rm -rf build node_modules
npm install
npm run build
sudo systemctl reload nginx
```

### Problema: Base de datos no conecta

**Solución:**
```bash
# Verificar MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# Verificar conexión
mongosh --eval "db.adminCommand('ping')"
```

---

## 📞 Contactos

**Servidor:** Anibal Trutié - 58734147 (WhatsApp)  
**Desarrollo:** Tu equipo  
**Repositorio:** https://github.com/pubnicaragua/pactum-saas

---

## 📝 Checklist de Despliegue

Antes de cada despliegue a producción:

- [ ] ✅ Código probado localmente
- [ ] ✅ Tests pasando (si existen)
- [ ] ✅ Commit con mensaje descriptivo
- [ ] ✅ Push a GitHub exitoso
- [ ] ✅ Backup de base de datos creado
- [ ] ✅ Despliegue ejecutado
- [ ] ✅ Servicios verificados
- [ ] ✅ Logs revisados
- [ ] ✅ Funcionalidad probada en navegador
- [ ] ✅ Cliente notificado (si aplica)
