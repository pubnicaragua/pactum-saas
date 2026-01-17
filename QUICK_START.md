# ⚡ Inicio Rápido - Servidor de Producción

## 🎯 Respuesta Rápida a tus Preguntas

### 1. ¿Por qué el cliente ve 25%?

El cliente ve **25%** porque ese es el valor inicial en la base de datos. El sistema de **cálculo automático** se activa cuando:

1. **Admin** (`admin@pactum.com`) actualiza tareas en el Kanban
2. Mueve tareas a la columna **"Hecho"** (done)
3. El sistema recalcula automáticamente: `progreso = (tareas completadas / total tareas) × 100`

**Ejemplo:** Si el proyecto tiene 20 tareas y completas 10 → progreso = 50% → el cliente recibe notificación.

### 2. ¿Cómo acceder al servidor?

```bash
ssh -p 1510 extel@186.1.56.251
# Password: exteladmin26
```

### 3. ¿Podemos desarrollar local y luego conectar?

**SÍ**, exactamente así:

**AHORA (Desarrollo Local):**
- Trabajas en tu PC con `localhost:3000` (frontend) y `localhost:8000` (backend)
- MongoDB local en tu PC
- Haces cambios, pruebas, commiteas a GitHub

**DESPUÉS (Producción):**
- Conectas al servidor Ubuntu
- Ejecutas script de instalación
- La app queda en `http://186.1.56.251`
- Para actualizar: solo haces `git pull` en el servidor

---

## 🚀 Instalación en Servidor (3 Pasos)

### Paso 1: Conectar y Copiar Script

```bash
# Desde tu PC, conectar al servidor
ssh -p 1510 extel@186.1.56.251

# Una vez dentro del servidor
cd ~
wget https://raw.githubusercontent.com/pubnicaragua/pactum-saas/main/deploy.sh
chmod +x deploy.sh
```

### Paso 2: Instalar Todo Automáticamente

```bash
# Este comando instala TODO (toma ~10-15 minutos)
./deploy.sh install
```

Esto instalará:
- ✅ Python 3.12 + FastAPI
- ✅ Node.js 20 + React
- ✅ MongoDB 7.0
- ✅ Nginx
- ✅ Configuración completa
- ✅ Base de datos inicializada

### Paso 3: Verificar

```bash
# Ver estado
./deploy.sh status

# Abrir en navegador
# http://186.1.56.251
```

**Credenciales:**
- Admin: `admin@pactum.com` / `Pactum#2026!`
- Cliente: `activo2_26@gmail.com` / `Pactum#2026!`

---

## 🔄 Flujo de Trabajo Diario

### En tu PC (Desarrollo Local)

```bash
# 1. Hacer cambios
cd "c:\Users\Probook 450 G7\Downloads\pactum-saas"
# Editar archivos...

# 2. Probar localmente
cd backend
python server_multitenant.py  # Backend en :8000

cd frontend
npm start  # Frontend en :3000

# 3. Subir a GitHub
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main
```

### En el Servidor (Actualizar Producción)

```bash
# Conectar
ssh -p 1510 extel@186.1.56.251

# Actualizar (descarga de GitHub y reinicia)
cd /var/www/pactum-saas
./deploy.sh update
```

---

## 📊 Cómo Funciona el Progreso Automático

### Backend (`server_multitenant.py`)

```python
# Cuando actualizas una tarea:
async def update_task(task_id, data):
    # ... actualizar tarea ...
    
    # Si cambió el status:
    if "status" in data:
        # Calcular progreso
        all_tasks = await db.tasks.find({"project_id": project_id})
        completed = [t for t in all_tasks if t.status == "done"]
        progress = (len(completed) / len(all_tasks)) * 100
        
        # Actualizar proyecto
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"progress_percentage": progress}}
        )
        
        # Enviar notificación si alcanzó hito (25%, 50%, 75%, 100%)
        if progress >= 25 and old_progress < 25:
            send_notification_to_client("¡25% completado!")
```

### Ejemplo Real

**Proyecto de Amaru tiene 20 tareas:**

| Tareas Completadas | Progreso | Notificación |
|-------------------|----------|--------------|
| 0 tareas | 0% | - |
| 5 tareas | 25% | ✅ "¡25% - Listo para pago!" |
| 10 tareas | 50% | ✅ "¡50% - Listo para pago!" |
| 15 tareas | 75% | ✅ "¡75% - Listo para pago!" |
| 20 tareas | 100% | ✅ "¡100% - Proyecto completado!" |

---

## 🛠️ Comandos Útiles del Script

```bash
# Ver todos los comandos
./deploy.sh

# Comandos disponibles:
./deploy.sh install   # Instalación completa (primera vez)
./deploy.sh update    # Actualizar desde GitHub
./deploy.sh restart   # Reiniciar servicios
./deploy.sh status    # Ver estado de servicios
./deploy.sh logs      # Ver logs en tiempo real
./deploy.sh backup    # Backup de MongoDB
```

---

## 🔍 Verificación Post-Instalación

### 1. Verificar Servicios

```bash
./deploy.sh status
```

Deberías ver:
- ✅ pactum-backend: **active (running)**
- ✅ nginx: **active (running)**
- ✅ mongod: **active (running)**

### 2. Verificar API

```bash
curl http://localhost:8000/health
# Respuesta: {"status":"healthy"}
```

### 3. Verificar Frontend

Abrir navegador: `http://186.1.56.251`

Deberías ver la página de login.

---

## 🚨 Solución de Problemas Rápida

### Problema: No puedo conectar por SSH

```bash
# Verificar que usas el puerto correcto
ssh -p 1510 extel@186.1.56.251
# NO uses el puerto 22, usa 1510
```

### Problema: Script de instalación falla

```bash
# Ver logs detallados
./deploy.sh logs

# Reintentar instalación de servicio específico
sudo systemctl restart pactum-backend
sudo systemctl status pactum-backend
```

### Problema: Frontend no carga

```bash
# Reconstruir frontend
cd /var/www/pactum-saas/frontend
npm run build
sudo systemctl reload nginx
```

### Problema: MongoDB no conecta

```bash
# Reiniciar MongoDB
sudo systemctl restart mongod
sudo systemctl status mongod

# Verificar conexión
mongosh --eval "db.adminCommand('ping')"
```

---

## 📞 Contacto Servidor

**Anibal Trutié**
- Teléfono: 58734147
- WhatsApp: 58734147
- Disponible para cualquier requerimiento del servidor

---

## 📚 Documentación Completa

- **Guía Completa:** `DEPLOYMENT_GUIDE.md`
- **Flujo Local → Producción:** `LOCAL_TO_PRODUCTION.md`
- **Este Archivo:** `QUICK_START.md`

---

## ✅ Checklist de Instalación

- [ ] Conectado al servidor por SSH
- [ ] Script `deploy.sh` descargado
- [ ] Ejecutado `./deploy.sh install`
- [ ] Servicios corriendo (verificar con `./deploy.sh status`)
- [ ] Frontend accesible en `http://186.1.56.251`
- [ ] Login exitoso con `admin@pactum.com`
- [ ] Cliente puede ver su proyecto con `activo2_26@gmail.com`

---

## 🎯 Próximos Pasos

1. **Instalar en servidor** (usar `./deploy.sh install`)
2. **Probar que funciona** (login, ver proyectos)
3. **Actualizar tareas en Kanban** (como admin)
4. **Verificar que progreso se actualiza automáticamente**
5. **Verificar que cliente recibe notificaciones**

---

## 💡 Tip Final

**Puedes seguir desarrollando local** mientras el servidor está en producción:

- **Local:** Desarrollo y pruebas en `localhost`
- **Producción:** Versión estable en `186.1.56.251`
- **Sincronización:** Cuando termines cambios locales → `git push` → en servidor `./deploy.sh update`

¡Es así de simple! 🚀
