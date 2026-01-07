# 🚀 GUÍA PASO A PASO - Ejecutar Backlog Alma IA en Render

## ❌ PROBLEMA ACTUAL

```
pymongo.errors.ConfigurationError: The DNS query name does not exist: _mongodb._tcp.cluster0.mongodb.net.
```

**Causa:** La variable de entorno `MONGO_URL` no está siendo leída correctamente en Render.

---

## ✅ SOLUCIÓN - PASOS A SEGUIR

### **PASO 1: Verificar Variables de Entorno en Render Dashboard**

1. Abre https://dashboard.render.com
2. Selecciona tu servicio backend (pactum-saas-backend)
3. Ve a **Environment** en el menú lateral
4. Verifica que existan estas variables:

```
MONGO_URL = mongodb+srv://pubnicaragua:Pactum2026@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME = pactum_saas
```

**Si NO existen, agrégalas:**
- Click en "Add Environment Variable"
- Key: `MONGO_URL`
- Value: `mongodb+srv://pubnicaragua:Pactum2026@cluster0.mongodb.net/?retryWrites=true&w=majority`
- Click "Save"

- Click en "Add Environment Variable"
- Key: `DB_NAME`
- Value: `pactum_saas`
- Click "Save"

---

### **PASO 2: Redeploy del Servicio (Importante)**

Después de agregar/actualizar variables de entorno:

1. Ve a tu servicio backend en Render
2. Click en **"Manual Deploy"** o **"Redeploy latest commit"**
3. Espera 3-5 minutos a que se complete el deploy
4. Verifica que el status sea **"Live"** (verde)

---

### **PASO 3: Acceder a Render Shell**

1. En el dashboard de Render, ve a tu servicio backend
2. Click en **"Shell"** en la esquina superior derecha
3. Se abrirá una terminal

---

### **PASO 4: Ejecutar el Script**

En la terminal de Render Shell, ejecuta:

```bash
cd /opt/render/project/src
python backend/seed_alma_ia_backlog.py
```

**Salida esperada (si funciona):**

```
============================================================
🎯 CONFIGURANDO BACKLOG ALMA IA
============================================================

✅ Empresa encontrada: Software Nicaragua
✅ Cliente encontrado: Alma IA
✅ Proyecto encontrado: Business & Technology - Sistema de Gestión Empresarial

👥 Creando usuarios del equipo Alma IA...

✅ Usuario creado: Miguel Alejandro Estanga (Frontend)
✅ Usuario creado: Jonathan Roque (Backend)

📱 Creando tareas de Frontend para Miguel Estanga...
  ✅ HomeScreen2 (Gamificado) - Diseño y Maquetación
  ✅ Módulo Diario - Frontend
  ✅ Módulo SOS - Frontend
  ✅ Módulo PyR (Preguntas y Respuestas) - Frontend
  ✅ Módulo AVISOS - Frontend
  ✅ Módulo ENCUESTAS - Frontend
  ✅ Módulo BENEFICIOS - Frontend
  ✅ Registro Semanal - Frontend
  ✅ Pruebas y Validaciones Frontend - Miguel

⚙️  Creando tareas de Backend para Jonathan Roque...
  ✅ Validar funcionalidad en App y Web
  ✅ Garantizar Preguntas Diarias - Sistema automático
  ✅ Informes automáticos - Inicio y fin de día
  ✅ Garantizar operación Dev y Prod con datos correctos
  ✅ Fix: Endpoint preguntas - Validar nombres exactos
  ✅ Fix: SOS Audio - Visualización en Web
  ✅ Fix: Encuestas - Error al guardar segunda respuesta
  ✅ Optimización: Cambio de contraseña
  ✅ Pruebas y Validaciones Backend - Jonathan

🐛 Creando tareas para Issues Reportados...
  ✅ BUG iOS: Gráfica de actividades se rompe al seleccionar fecha
  ✅ BUG iOS: SOS exige texto cuando solo se grabó voz
  ✅ BUG iOS: Cerrar sesión cierra la app en lugar de ir a login
  ✅ UX: Avisos sin título muestran 'Sin título'
  ✅ UX: Ordenar avisos descendente (más reciente primero)
  ✅ UX: Contador de mensajes no leídos no cuadra con total
  ✅ UX: Diferenciar avisos de encuestas visualmente
  ✅ UX: Encuestas no deben obligar 4ta opción
  ✅ BUG Android: Encuestas no muestran preguntas
  ✅ UX: Texto largo 'denunciémoslo' se corta
  ✅ UX: Menú inferior desaparece en algunas pantallas
  ✅ UX: Inconsistencia en tonos de azul

============================================================
✨ BACKLOG ALMA IA CONFIGURADO EXITOSAMENTE
============================================================

📊 RESUMEN:
   👥 Usuarios creados: 2
   📱 Tareas Frontend (Miguel): 9 (incluye 2h pruebas)
   ⚙️  Tareas Backend (Jonathan): 9 (incluye 2h pruebas)
   🐛 Issues reportados: 12
   📋 TOTAL TAREAS: 30
   ⏱️  Horas estimadas: 22 horas

🔐 CREDENCIALES NUEVOS USUARIOS:

👨‍💻 MIGUEL ALEJANDRO ESTANGA (Frontend Developer):
   Email:    miguel.estanga@almaia.com
   Password: MiguelAlma2026!
   Rol:      TEAM_MEMBER
   Tareas:   Frontend + UX Issues

👨‍💻 JONATHAN ROQUE (Backend Developer):
   Email:    jonathan.roque@almaia.com
   Password: JRoqueAlma2026!
   Rol:      TEAM_MEMBER
   Tareas:   Backend + Validaciones

👁️  ACCESO PARA VISUALIZACIÓN:
   • COMPANY_ADMIN (admin@pactum.com) puede ver todas las tareas
   • Admin Alma IA (admin@almaia.com) puede ver su proyecto
   • Usar ProjectSelector para cambiar entre clientes

============================================================
🚀 Las tareas ya están en el backlog del proyecto Alma IA
🎯 Accede al Kanban o Lista de Tareas para gestionarlas
============================================================
```

---

## 🔍 TROUBLESHOOTING

### Si aún obtienes error de DNS:

**Opción A: Verificar que las variables estén guardadas**

En Render Shell, ejecuta:

```bash
echo $MONGO_URL
echo $DB_NAME
```

Deberías ver:
```
mongodb+srv://pubnicaragua:Pactum2026@cluster0.mongodb.net/?retryWrites=true&w=majority
pactum_saas
```

Si ves vacío, las variables NO están configuradas. Vuelve a PASO 1.

**Opción B: Esperar más tiempo después del redeploy**

A veces Render tarda más en aplicar las variables. Espera 5-10 minutos y vuelve a intentar.

**Opción C: Redeploy manual**

En Render Dashboard:
1. Ve a tu servicio
2. Click en "Redeploy latest commit"
3. Espera a que termine (status "Live")
4. Intenta nuevamente

---

## ✅ VERIFICAR QUE FUNCIONÓ

Después de ejecutar el script exitosamente:

### **1. Login como COMPANY_ADMIN**

- Email: `admin@pactum.com`
- Password: `Pactum#2026!`
- URL: https://pactumsaas.netlify.app/login

### **2. Ir a Proyecto Alma IA**

1. Ir a cualquier módulo (Dashboard, Tareas, etc)
2. En la parte superior verás: **"Ver Proyecto de:"**
3. Click en el dropdown
4. Seleccionar **"Alma IA - Inteligencia Artificial"**

### **3. Ver las 30 Tareas**

1. Ir a `/tareas` o `/kanban`
2. Deberías ver:
   - 9 tareas asignadas a Miguel Estanga (Frontend)
   - 9 tareas asignadas a Jonathan Roque (Backend)
   - 12 tareas de Issues reportados

### **4. Verificar Usuarios Creados**

1. Login como `admin@pactum.com`
2. Ir a módulo "Clientes"
3. Seleccionar "Alma IA"
4. Ir a "Usuarios" o "Team"
5. Deberías ver:
   - Miguel Alejandro Estanga
   - Jonathan Roque

---

## 📋 RESUMEN RÁPIDO

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Verificar/Agregar variables MONGO_URL y DB_NAME en Render | 2 min |
| 2 | Redeploy del servicio | 5 min |
| 3 | Acceder a Render Shell | 1 min |
| 4 | Ejecutar script | 1 min |
| **TOTAL** | | **~9 min** |

---

## 🎯 RESULTADO FINAL

✅ 30 tareas creadas en proyecto Alma IA
✅ 2 usuarios del equipo (Miguel y Jonathan)
✅ Acceso para COMPANY_ADMIN y Admin Alma IA
✅ Listo para comenzar desarrollo

---

**¿Problemas? Verifica que:**
1. ✅ Variables de entorno están en Render Dashboard
2. ✅ Hiciste Redeploy después de agregar variables
3. ✅ El servicio está en status "Live" (verde)
4. ✅ Esperas 5+ minutos después del redeploy
