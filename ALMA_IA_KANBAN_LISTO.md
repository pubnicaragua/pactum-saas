# ✅ Kanban de Alma IA - Miguel y Jonathan

## 🎯 Tareas Cargadas Automáticamente

He integrado **todas las tareas de Alma IA** directamente en `init_database.py`. Cuando ejecutes el script de inicialización, se crearán automáticamente:

### 👥 Usuarios Creados

1. **Miguel Alejandro Estanga** (Frontend Developer)
   - Email: `miguel.estanga@almaia.com`
   - Password: `MiguelAlma2026!`
   - Rol: `TEAM_MEMBER`
   - Asignado a: Proyecto Alma IA

2. **Jonathan Roque** (Backend Developer)
   - Email: `jonathan.roque@almaia.com`
   - Password: `JRoqueAlma2026!`
   - Rol: `TEAM_MEMBER`
   - Asignado a: Proyecto Alma IA

---

## 📋 Tareas Creadas (30 Total)

### 📱 Frontend - Miguel Estanga (9 tareas)

1. **HomeScreen2 (Gamificado) - Diseño y Maquetación** [HIGH, 1h]
   - Implementar pantalla principal gamificada con badges y animaciones

2. **Módulo Diario - Frontend** [HIGH, 1h]
   - Interfaz para registro diario con formularios y validaciones

3. **Módulo SOS - Frontend** [URGENT, 1h]
   - Botón de emergencia con grabación audio/video y geolocalización

4. **Módulo PyR (Preguntas y Respuestas) - Frontend** [HIGH, 1h]
   - Sistema de preguntas diarias (Emoción, Neurodivergencia, Patologías)

5. **Módulo AVISOS - Frontend** [HIGH, 1h]
   - Sistema de notificaciones con diferenciación visual

6. **Módulo ENCUESTAS - Frontend** [HIGH, 1h]
   - Interfaz para encuestas dinámicas (2-4 opciones)

7. **Módulo BENEFICIOS - Frontend** [MEDIUM, 1h]
   - Pantalla de beneficios con cards y diseño atractivo

8. **Registro Semanal - Frontend** [MEDIUM, 1h]
   - Calendario interactivo con gráficas de progreso

9. **Pruebas y Validaciones Frontend - Miguel** [HIGH, 2h]
   - Pruebas exhaustivas en iOS y Android

---

### ⚙️ Backend - Jonathan Roque (9 tareas)

1. **Validar funcionalidad en App y Web** [URGENT, 1h]
   - Verificar endpoints en ambas plataformas

2. **Garantizar Preguntas Diarias - Sistema automático** [URGENT, 1h]
   - Sistema que garantice las 3 preguntas diarias

3. **Informes automáticos - Inicio y fin de día** [HIGH, 1h]
   - Sistema de informes automáticos con métricas

4. **Garantizar operación Dev y Prod con datos correctos** [HIGH, 1h]
   - Validar ambos ambientes operan correctamente

5. **Fix: Endpoint preguntas - Validar nombres exactos** [URGENT, 1h]
   - Corregir problema de 2 de 3 preguntas (falta Patologías)

6. **Fix: SOS Audio - Visualización en Web** [HIGH, 1h]
   - Audios de SOS no se visualizan en Web

7. **Fix: Encuestas - Error al guardar segunda respuesta** [HIGH, 1h]
   - Segunda respuesta de encuesta falla

8. **Optimización: Cambio de contraseña** [MEDIUM, 1h]
   - Revisar flujo de cambio de contraseña

9. **Pruebas y Validaciones Backend - Jonathan** [HIGH, 2h]
   - Pruebas exhaustivas de endpoints en Dev y Prod

---

### 🐛 Issues Reportados (12 tareas)

**Asignadas a Miguel (Frontend):**
1. **BUG iOS: Gráfica de actividades se rompe al seleccionar fecha** [HIGH, 1h]
2. **BUG iOS: SOS exige texto cuando solo se grabó voz** [HIGH, 1h]
3. **BUG iOS: Cerrar sesión cierra la app en lugar de ir a login** [MEDIUM, 1h]
4. **UX: Avisos sin título muestran 'Sin título'** [LOW, 1h]
5. **UX: Diferenciar avisos de encuestas visualmente** [MEDIUM, 1h]
6. **UX: Encuestas no deben obligar 4ta opción** [MEDIUM, 1h]
7. **BUG Android: Encuestas no muestran preguntas** [HIGH, 1h]
8. **UX: Texto largo 'denunciémoslo' se corta** [LOW, 1h]
9. **UX: Menú inferior desaparece en algunas pantallas** [MEDIUM, 1h]
10. **UX: Inconsistencia en tonos de azul** [LOW, 1h]

**Asignadas a Jonathan (Backend):**
11. **UX: Ordenar avisos descendente (más reciente primero)** [MEDIUM, 1h]
12. **UX: Contador de mensajes no leídos no cuadra con total** [MEDIUM, 1h]

---

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar init_database.py completo

Si necesitas reinicializar toda la base de datos:

```bash
# En el servidor o localmente con acceso a MongoDB
python init_database.py
```

Esto creará:
- ✅ Empresa Software Nicaragua
- ✅ Admin Pactum
- ✅ Todos los clientes (Amaru, Alma IA, Investi, Solvendo, etc.)
- ✅ Todos los proyectos
- ✅ **Miguel y Jonathan** (TEAM_MEMBER)
- ✅ **30 tareas de Alma IA** en el Kanban

### Opción 2: Solo agregar usuarios y tareas de Alma IA

Si ya tienes la base de datos inicializada y solo quieres agregar las tareas de Alma IA:

```bash
python backend/seed_alma_ia_backlog.py
```

---

## 🔍 Verificación en el Kanban

### Como Admin Pactum (`admin@pactum.com`)

1. **Login**: `admin@pactum.com` / `Pactum#2026!`
2. **Seleccionar proyecto**: Alma IA (usando ProjectSelector)
3. **Ir a Kanban**: Deberías ver:
   - **Backlog: 30 tareas**
   - 9 asignadas a Miguel Estanga
   - 9 asignadas a Jonathan Roque
   - 12 issues reportados

### Como Miguel (`miguel.estanga@almaia.com`)

1. **Login**: `miguel.estanga@almaia.com` / `MiguelAlma2026!`
2. **Ir a Kanban**: Verás solo tus tareas (9 Frontend + issues UX)
3. **No verás**: Tareas de otros proyectos (Investi, Solvendo, etc.)

### Como Jonathan (`jonathan.roque@almaia.com`)

1. **Login**: `jonathan.roque@almaia.com` / `JRoqueAlma2026!`
2. **Ir a Kanban**: Verás solo tus tareas (9 Backend + 2 issues)
3. **No verás**: Tareas de otros proyectos

---

## 📊 Resumen de Horas

| Categoría | Tareas | Horas Estimadas |
|-----------|--------|-----------------|
| Frontend (Miguel) | 9 | 10h (8×1h + 1×2h) |
| Backend (Jonathan) | 9 | 10h (8×1h + 1×2h) |
| Issues | 12 | 12h |
| **TOTAL** | **30** | **32h** |

---

## 🎯 Distribución por Prioridad

- **URGENT**: 3 tareas (2 Backend, 1 Frontend)
- **HIGH**: 11 tareas (5 Frontend, 4 Backend, 2 Issues)
- **MEDIUM**: 13 tareas (2 Frontend, 1 Backend, 10 Issues)
- **LOW**: 3 tareas (Issues UX)

---

## 📝 Notas Importantes

1. **Aislamiento perfecto**: Miguel y Jonathan solo ven tareas de Alma IA
2. **Rol TEAM_MEMBER**: Pueden ver y editar tareas, pero no crear proyectos
3. **Asignación automática**: Cada tarea ya está asignada al desarrollador correcto
4. **Estado inicial**: Todas las tareas están en `backlog`
5. **Proyecto actualizado**: Alma IA ahora tiene 3 usuarios asignados:
   - admin@almaia.com (USER)
   - miguel.estanga@almaia.com (TEAM_MEMBER)
   - jonathan.roque@almaia.com (TEAM_MEMBER)

---

## ✅ Checklist de Verificación

- [ ] Ejecutar `init_database.py` o `seed_alma_ia_backlog.py`
- [ ] Verificar que Miguel y Jonathan pueden hacer login
- [ ] Confirmar que ven solo tareas de Alma IA
- [ ] Verificar que hay 30 tareas en backlog
- [ ] Confirmar asignaciones correctas (9 Miguel, 9 Jonathan, 12 issues)
- [ ] Probar mover tareas en el Kanban
- [ ] Verificar que admin@pactum.com puede ver todas las tareas

---

## 🔐 Credenciales Completas

```
🔵 ADMIN PACTUM (COMPANY_ADMIN):
   Email:    admin@pactum.com
   Password: Pactum#2026!
   Acceso:   Ver todos los proyectos

🟣 ALMA IA (Cliente/Partner):
   Email:    admin@almaia.com
   Password: AlmaIA#2026!
   Acceso:   Ver su proyecto asignado

👨‍💻 MIGUEL ESTANGA (Frontend Developer):
   Email:    miguel.estanga@almaia.com
   Password: MiguelAlma2026!
   Tareas:   9 Frontend + Issues UX

👨‍💻 JONATHAN ROQUE (Backend Developer):
   Email:    jonathan.roque@almaia.com
   Password: JRoqueAlma2026!
   Tareas:   9 Backend + Validaciones
```

---

## 🎉 ¡Listo para Trabajar!

Las tareas de Alma IA están completamente configuradas y listas para que Miguel y Jonathan comiencen a trabajar en el Kanban.
