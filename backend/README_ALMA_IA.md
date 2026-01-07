# 🎯 BACKLOG ALMA IA - Guía de Configuración

## 📋 Resumen

Este documento explica cómo configurar el backlog completo del proyecto **Alma IA** con:
- ✅ 2 usuarios del equipo (Miguel Estanga - Frontend, Jonathan Roque - Backend)
- ✅ 8 tareas de Frontend (HomeScreen2, Diario, SOS, PyR, Avisos, Encuestas, Beneficios, Registro Semanal)
- ✅ 8 tareas de Backend (Validaciones, Preguntas Diarias, Informes, Dev/Prod, Fixes)
- ✅ 12 issues reportados documentados como tareas
- ✅ **TOTAL: 28 tareas en backlog**

---

## 🚀 Instrucciones de Ejecución

### 1️⃣ Pre-requisitos

Asegúrate de haber ejecutado primero el script de inicialización principal:

```bash
cd /opt/render/project/src
python backend/init_database.py
```

Esto debe crear:
- ✅ Empresa Software Nicaragua
- ✅ Cliente Alma IA
- ✅ Proyecto de Alma IA ($8,500)

### 2️⃣ Ejecutar Script de Backlog

Una vez confirmado que el proyecto Alma IA existe, ejecuta:

```bash
python backend/seed_alma_ia_backlog.py
```

**Salida esperada:**
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
  ... (8 tareas)

⚙️  Creando tareas de Backend para Jonathan Roque...
  ✅ Validar funcionalidad en App y Web
  ✅ Garantizar Preguntas Diarias - Sistema automático
  ... (8 tareas)

🐛 Creando tareas para Issues Reportados...
  ✅ BUG iOS: Gráfica de actividades se rompe
  ... (12 tareas)

============================================================
✨ BACKLOG ALMA IA CONFIGURADO EXITOSAMENTE
============================================================

📊 RESUMEN:
   👥 Usuarios creados: 2
   📱 Tareas Frontend (Miguel): 8
   ⚙️  Tareas Backend (Jonathan): 8
   🐛 Issues reportados: 12
   📋 TOTAL TAREAS: 28
```

---

## 🔐 Credenciales de Acceso

### 👨‍💻 Miguel Alejandro Estanga (Frontend Developer)
- **Email:** `miguel.estanga@almaia.com`
- **Password:** `MiguelAlma2026!`
- **Rol:** TEAM_MEMBER
- **Responsabilidad:** Desarrollo Frontend + Issues UX
- **Tareas asignadas:** 8 módulos + 8 issues UX

### 👨‍💻 Jonathan Roque (Backend Developer)
- **Email:** `jonathan.roque@almaia.com`
- **Password:** `JRoqueAlma2026!`
- **Rol:** TEAM_MEMBER
- **Responsabilidad:** Desarrollo Backend + Validaciones
- **Tareas asignadas:** 8 validaciones/fixes + 4 issues backend

### 👁️ Visualización de Tareas

**COMPANY_ADMIN puede ver todo:**
- **Email:** `admin@pactum.com`
- **Password:** `Pactum#2026!`
- Usar **ProjectSelector** para cambiar a proyecto Alma IA
- Ver todas las 28 tareas en `/tareas` o `/kanban`

**Admin Alma IA:**
- **Email:** `admin@almaia.com`
- **Password:** `AlmaIA#2026!`
- Ver su proyecto directamente
- Acceso a todas las tareas de su proyecto

---

## 📱 Tareas de Frontend (Miguel Estanga)

### Módulos Principales (8 tareas)

1. **HomeScreen2 (Gamificado)** - 16h
   - Diseño gamificado con badges y progreso
   - Screenshots cada hora

2. **Módulo Diario** - 12h
   - Registro diario del usuario
   - Documentar endpoints

3. **Módulo SOS** - 14h (URGENTE)
   - Botón emergencia con audio/video/texto
   - Probar iOS y Android

4. **Módulo PyR (Preguntas y Respuestas)** - 10h
   - 3 preguntas diarias: Emoción, Neurodivergencia, Patologías
   - Validar que todas se muestren

5. **Módulo AVISOS** - 12h
   - Sistema de notificaciones
   - Diferenciar avisos de encuestas (colores + iconos)
   - Orden descendente

6. **Módulo ENCUESTAS** - 14h
   - Encuestas dinámicas 2-4 opciones
   - Navegación desde avisos
   - Manejo de errores

7. **Módulo BENEFICIOS** - 10h
   - Pantalla de beneficios con cards
   - Diseño atractivo

8. **Registro Semanal** - 12h
   - Calendario interactivo
   - Gráficas de progreso

**Total Frontend: 100 horas estimadas**

---

## ⚙️ Tareas de Backend (Jonathan Roque)

### Validaciones y Fixes (8 tareas)

1. **Validar App y Web funcional** - 8h (URGENTE)
   - Verificar todos los endpoints
   - Screenshots de pruebas

2. **Garantizar Preguntas Diarias** - 6h (URGENTE)
   - Sistema automático para 3 preguntas
   - Validar nombres exactos en BD

3. **Informes automáticos** - 10h
   - Inicio y fin de día
   - Status, usuarios activos, errores

4. **Garantizar Dev y Prod** - 8h
   - Ambos ambientes operando correctamente
   - Documentar configuraciones

5. **Fix: Endpoint preguntas** - 4h (URGENTE)
   - Solo aparecen 2 de 3 preguntas
   - Validar nombres BD vs App

6. **Fix: SOS Audio en Web** - 6h
   - Audios no se visualizan en Web
   - Validar almacenamiento

7. **Fix: Encuestas - Error segunda respuesta** - 5h
   - Primera OK, segunda falla
   - Logs y debugging

8. **Optimización: Cambio contraseña** - 4h
   - Indica guardado pero no permite login
   - Validar hash

**Total Backend: 51 horas estimadas**

---

## 🐛 Issues Reportados (12 tareas)

### Bugs Críticos

1. **iOS: Gráfica actividades se rompe** - 4h
2. **iOS: SOS exige texto con solo voz** - 3h
3. **iOS: Cerrar sesión cierra app** - 2h
4. **Android: Encuestas sin preguntas** - 4h

### Mejoras UX

5. **Avisos sin título** - 2h
6. **Ordenar avisos descendente** - 2h
7. **Contador mensajes no cuadra** - 3h
8. **Diferenciar avisos de encuestas** - 4h
9. **Encuestas sin obligar 4ta opción** - 3h
10. **Texto largo se corta** - 1h
11. **Menú inferior desaparece** - 4h
12. **Inconsistencia colores azules** - 3h

**Total Issues: 35 horas estimadas**

---

## 📊 Distribución de Trabajo

| Desarrollador | Módulos | Issues | Total Horas |
|---------------|---------|--------|-------------|
| Miguel Estanga | 8 Frontend | 8 UX | ~135h |
| Jonathan Roque | 8 Backend | 4 Backend | ~65h |
| **TOTAL** | **16 tareas** | **12 issues** | **~200h** |

---

## 🎯 Cómo Visualizar en el Sistema

### Opción 1: Como COMPANY_ADMIN

1. Login: `admin@pactum.com` / `Pactum#2026!`
2. Ir a cualquier módulo de proyecto
3. En la parte superior verás **"Ver Proyecto de:"**
4. Seleccionar **"Alma IA - Inteligencia Artificial"**
5. Ir a `/tareas` o `/kanban`
6. Verás las **28 tareas** en backlog

### Opción 2: Como Admin Alma IA

1. Login: `admin@almaia.com` / `AlmaIA#2026!`
2. Ir directamente a `/tareas` o `/kanban`
3. Verás las **28 tareas** de tu proyecto

### Opción 3: Como Desarrollador

**Miguel Estanga:**
1. Login: `miguel.estanga@almaia.com` / `MiguelAlma2026!`
2. Ver tareas asignadas a él (Frontend + UX)

**Jonathan Roque:**
1. Login: `jonathan.roque@almaia.com` / `JRoqueAlma2026!`
2. Ver tareas asignadas a él (Backend + Validaciones)

---

## 📝 Metodología de Trabajo

### Para Miguel (Frontend)

**Requerimientos por tarea:**
- ✅ Screenshots del progreso cada hora
- ✅ Documentar endpoints utilizados
- ✅ Comentarios en código explicando lógica
- ✅ Probar en iOS y Android
- ✅ Actualizar estado en Kanban

### Para Jonathan (Backend)

**Requerimientos por tarea:**
- ✅ Documentar endpoints creados/modificados
- ✅ Screenshots de pruebas (Postman/Insomnia)
- ✅ Logs de errores y soluciones
- ✅ Validar en Dev y Prod
- ✅ Informes de status al inicio y fin del día
- ✅ Actualizar estado en Kanban

---

## 🔄 Flujo de Trabajo

```
BACKLOG → TODO → IN_PROGRESS → REVIEW → DONE
```

1. **BACKLOG**: Todas las tareas inician aquí (28 tareas)
2. **TODO**: Mover cuando se va a trabajar
3. **IN_PROGRESS**: Durante desarrollo activo
4. **REVIEW**: Cuando está lista para revisión
5. **DONE**: Aprobada y completada

---

## 📞 Soporte

Si tienes problemas ejecutando el script:

1. Verificar que MongoDB esté accesible
2. Confirmar que `init_database.py` se ejecutó primero
3. Revisar que el cliente "Alma IA" existe en la BD
4. Contactar al administrador del sistema

---

## ✅ Checklist de Verificación

Después de ejecutar el script, verificar:

- [ ] 2 usuarios creados (Miguel y Jonathan)
- [ ] 8 tareas Frontend asignadas a Miguel
- [ ] 8 tareas Backend asignadas a Jonathan
- [ ] 12 issues documentados
- [ ] Total 28 tareas en proyecto Alma IA
- [ ] COMPANY_ADMIN puede ver todas las tareas
- [ ] Admin Alma IA puede ver su proyecto
- [ ] Miguel y Jonathan pueden hacer login

---

**🎉 ¡Listo! El backlog de Alma IA está completamente configurado y listo para trabajar.**
