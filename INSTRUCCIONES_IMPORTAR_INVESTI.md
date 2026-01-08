# 📋 Instrucciones para Importar Tareas de Investi

## ✅ Problemas Resueltos

### 1. **Presupuesto Corregido**
- ✅ Investi ahora tiene presupuesto de **$10,000** (antes $12,000)
- Archivo actualizado: `init_database.py`

### 2. **Aislamiento de Proyectos Corregido**
- ✅ **TaskBoard** ahora SIEMPRE filtra por `project_id` de localStorage
- ✅ **TaskList** ahora SIEMPRE filtra por `project_id` de localStorage
- ✅ Eliminada la excepción para TEAM_MEMBER que causaba contaminación cruzada
- ✅ Agregados logs de consola para debugging (`console.log`)

**Archivos modificados**:
- `frontend/src/pages/TaskBoard.jsx` - Líneas 96-111
- `frontend/src/pages/TaskList.jsx` - Líneas 99-114

### 3. **52 Tareas de Investi Listas**
- ✅ Archivo CSV creado: `INVESTI_TASKS_IMPORT.csv`
- ✅ Incluye todas las pantallas de la app móvil de Investi

---

## 🚀 Cómo Importar las Tareas

### Paso 1: Iniciar Sesión como Admin
```
Email: admin@pactum.com
Password: Pactum#2026!
```

### Paso 2: Seleccionar Proyecto Investi
1. En la parte superior derecha, verás el **selector de proyectos** (componente azul)
2. Click en el selector
3. Selecciona **"Investi"** de la lista
4. La página se recargará automáticamente
5. Verifica en la consola del navegador (F12):
   ```
   🔍 TaskBoard - Loading tasks for project_id: [investi-project-id]
   ✅ TaskBoard - Loaded tasks: 0 tasks
   ```

### Paso 3: Convertir CSV a Excel (Opcional)
El sistema acepta archivos `.xlsx` y `.xls`. Si tienes Excel:

1. Abre `INVESTI_TASKS_IMPORT.csv` en Excel
2. Guarda como → **Excel Workbook (.xlsx)**
3. Nombre sugerido: `INVESTI_TASKS_IMPORT.xlsx`

**O usa el CSV directamente** si tu sistema lo soporta.

### Paso 4: Importar Tareas
1. Ve a **Tareas** (`/tareas`) en el menú lateral
2. Click en botón **"Importar Excel"** (ícono de upload)
3. Selecciona el archivo `INVESTI_TASKS_IMPORT.xlsx` o `.csv`
4. El sistema:
   - ✅ Validará que el proyecto esté seleccionado
   - ✅ Leerá las 52 tareas del archivo
   - ✅ Las creará con `project_id` de Investi
   - ✅ Mostrará mensaje de éxito

### Paso 5: Verificar en Kanban
1. Ve a **Tablero Kanban** (`/kanban`)
2. Deberías ver:
   - **Backlog: 52 tareas** (todas las pantallas)
   - **Por Hacer: 0**
   - **En Progreso: 0**
   - **En Revisión: 0**
   - **Completado: 0**

3. Verifica en la consola:
   ```
   🔍 TaskBoard - Loading tasks for project_id: [investi-project-id]
   ✅ TaskBoard - Loaded tasks: 52 tasks
   ```

---

## 📊 Estructura del Archivo de Importación

El archivo `INVESTI_TASKS_IMPORT.csv` contiene:

**Columnas**:
- `title` - Nombre de la pantalla/tarea (obligatorio)
- `description` - Detalles técnicos (archivo, navegación, APIs)
- `status` - Estado inicial (todas en "backlog")
- `priority` - Prioridad (high, medium, low)
- `estimated_hours` - Horas estimadas por tarea

**Resumen de Tareas**:
- **4 tareas** de módulos principales (40h cada una)
- **48 pantallas** de la app móvil (4-18h cada una)
- **Total: 52 tareas**
- **Total estimado: ~520 horas**

**Categorías**:
1. 🔐 **Autenticación** (6 pantallas): LanguageSelection, Welcome, SignIn, SignUp, AuthCallback, UploadAvatar
2. 🎯 **Configuración Inicial** (4 pantallas): PickGoals, PickInterests, PickKnowledge, CommunityRecommendations
3. 🏠 **Feed Principal** (2 pantallas): HomeFeed, Sidebar
4. 📰 **Sistema de Posts** (7 pantallas): CreatePost, PostDetail, VideoPlayer, SharePost, SavedPosts, etc.
5. 👥 **Comunidades** (6 pantallas): Communities, CommunityDetail, CreateCommunity, etc.
6. 👤 **Perfiles** (5 pantallas): Profile, EditProfile, Followers, Following, Settings
7. 💬 **Chat** (4 pantallas): ChatList, ChatScreen, NewMessage, GroupChat
8. 🔔 **Notificaciones** (1 pantalla): Notifications
9. 📚 **Educación** (5 pantallas): News, Educacion, CourseDetail, LearningPaths, etc.
10. 💰 **Herramientas Financieras** (8 pantallas): MarketInfo, Inversionista, PlanificadorFinanciero, etc.
11. 🔧 **Herramientas Especiales** (4 pantallas): SimuladorInversiones, IRIChatScreen, etc.

---

## 🔍 Verificar Aislamiento de Proyectos

### Test 1: Verificar Investi
1. Selecciona proyecto **Investi**
2. Ve a Kanban
3. Deberías ver **solo las 52 tareas de Investi**
4. Consola debe mostrar:
   ```
   🔍 TaskBoard - Loading tasks for project_id: [investi-id]
   ✅ TaskBoard - Loaded tasks: 52 tasks
   ```

### Test 2: Cambiar a Otro Proyecto
1. Selecciona proyecto **Alma IA** (u otro)
2. Ve a Kanban
3. Deberías ver **tareas diferentes** (no las de Investi)
4. Consola debe mostrar:
   ```
   🔍 TaskBoard - Loading tasks for project_id: [alma-id]
   ✅ TaskBoard - Loaded tasks: [X] tasks
   ```

### Test 3: Volver a Investi
1. Selecciona proyecto **Investi** nuevamente
2. Las 52 tareas deben estar ahí
3. **NO deben aparecer tareas de otros proyectos**

---

## ⚠️ Solución de Problemas

### Problema: "No se encontró el proyecto"
**Solución**: 
1. Asegúrate de seleccionar un proyecto primero
2. Verifica que `localStorage.getItem('project_id')` tenga un valor
3. Recarga la página (F5)

### Problema: "Las tareas se siguen cruzando"
**Solución**:
1. Abre la consola del navegador (F12)
2. Busca los logs:
   ```
   🔍 TaskBoard - Loading tasks for project_id: ...
   ```
3. Verifica que el `project_id` sea el correcto
4. Si es `null` o incorrecto, selecciona el proyecto nuevamente
5. Limpia el localStorage y vuelve a seleccionar:
   ```javascript
   localStorage.clear()
   // Luego selecciona el proyecto de nuevo
   ```

### Problema: "El archivo no se importa"
**Solución**:
1. Verifica que el archivo sea `.xlsx` o `.xls`
2. Asegúrate de que tenga la columna `title`
3. Revisa que el proyecto esté seleccionado
4. Mira la consola para errores específicos

### Problema: "Kanban se rompe al actualizar"
**Solución**: ✅ **YA RESUELTO**
- Ahora recarga automáticamente después de actualizar
- No necesitas recargar manualmente

---

## 📝 Notas Importantes

1. **Siempre selecciona el proyecto primero** antes de importar
2. **El archivo CSV está listo para usar** - solo conviértelo a Excel si lo prefieres
3. **Los logs de consola** te ayudarán a debuggear problemas
4. **El aislamiento está garantizado** - cada proyecto es independiente
5. **Las 52 tareas** representan todas las pantallas de la app móvil de Investi

---

## 🎯 Próximos Pasos

Después de importar:

1. **Asignar tareas** a miembros del equipo
2. **Agrupar tareas relacionadas** usando grupos de tareas
3. **Mover tareas** en el Kanban según progreso
4. **Agregar comentarios** y archivos adjuntos
5. **Actualizar tiempos** (horas o minutos)

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de consola (F12)
2. Verifica que el proyecto correcto esté seleccionado
3. Asegúrate de estar usando `admin@pactum.com`
4. Contacta al equipo de desarrollo con capturas de pantalla
