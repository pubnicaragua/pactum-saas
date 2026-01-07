# Guía de Configuración: Proyecto Investi

## 📋 Información del Proyecto

**Proyecto**: Investi - Sistema de Gestión de Inversiones  
**Cliente**: Investi  
**Presupuesto**: $12,000  
**Progreso**: 60%  
**Duración**: 150 días

## 🔐 Credenciales

### Usuario Partner (Cliente)
- **Email**: `admin@investi.com`
- **Password**: `Investi#2026!`
- **Rol**: `USER` (Cliente con acceso limitado a su proyecto)

### Admin Pactum (Para gestión completa)
- **Email**: `admin@pactum.com`
- **Password**: `Pactum#2026!`
- **Rol**: `COMPANY_ADMIN` (Acceso total)

## 🎯 Configuración desde admin@pactum.com

### 1. Seleccionar Proyecto Investi

1. Inicia sesión como `admin@pactum.com`
2. En el **selector de proyectos** (arriba a la derecha), selecciona:
   - **"Investi - Sistema de Gestión de Inversiones"**
3. Esto guardará el `project_id` en localStorage y **aislará todos los datos** a este proyecto

### 2. Verificar Aislamiento de Datos

**IMPORTANTE**: Cada proyecto es completamente independiente. Los datos NO se cruzan entre proyectos.

**Cómo funciona el aislamiento**:
- ✅ **Tareas**: Filtradas por `project_id` en localStorage
- ✅ **Pagos**: Filtrados por `project_id` en localStorage  
- ✅ **Fases**: Filtradas por `project_id` en localStorage
- ✅ **Contratos**: Filtrados por `project_id` en localStorage
- ✅ **Dashboard**: Muestra solo datos del proyecto seleccionado

**Para cambiar de proyecto**:
1. Usa el selector de proyectos
2. Selecciona otro proyecto (ej: "Alma IA")
3. Todos los datos se actualizarán automáticamente

### 3. Crear Tareas en Kanban

#### Opción A: Crear Tarea Individual

1. Ve a **Tablero Kanban** (`/kanban`)
2. Click en **"+ Nueva Tarea"**
3. Completa el formulario:
   - **Título**: Nombre de la tarea
   - **Descripción**: Detalles
   - **Prioridad**: low, medium, high, urgent
   - **Tiempo estimado**: 
     - **Horas**: Para tareas largas (ej: 8 horas)
     - **Minutos**: Para tareas cortas (ej: 30 minutos)
   - **Fecha límite**: Opcional
   - **Asignar a**: Selecciona usuario
4. Click **"Crear"**

#### Opción B: Importar Tareas Masivas desde Excel

1. Ve a **Tareas** (`/tareas`)
2. Click en **"Importar Excel"**
3. Selecciona un archivo Excel con las siguientes columnas:

**Columnas requeridas**:
- `title` (obligatorio)

**Columnas opcionales**:
- `description`
- `status` (backlog, todo, in_progress, review, done)
- `priority` (low, medium, high, urgent)
- `estimated_hours` (número decimal, ej: 2.5)
- `estimated_minutes` (número entero, ej: 30)
- `due_date` (formato: YYYY-MM-DD)
- `assigned_to` (ID del usuario)
- `tags` (separados por comas)

**Ejemplo de Excel**:
```
title                          | description                    | status   | priority | estimated_hours | estimated_minutes
Diseñar dashboard principal    | Mockups y wireframes          | backlog  | high     | 8               | 
Implementar autenticación      | Login y registro de usuarios  | backlog  | urgent   | 4               |
Revisar código                 | Code review del sprint        | todo     | medium   |                 | 30
```

4. El sistema importará todas las tareas al proyecto **Investi** automáticamente
5. Las tareas aparecerán en el Kanban organizadas por estado

### 4. Gestionar Tareas en Kanban

**Mover tareas** (Drag & Drop):
- Arrastra una tarjeta de una columna a otra
- Estados disponibles:
  - **Backlog**: Tareas pendientes
  - **Por Hacer**: Listas para trabajar
  - **En Progreso**: En desarrollo
  - **En Revisión**: Para QA
  - **Completado**: Terminadas

**Editar tarea**:
1. Click en el ícono de editar (lápiz)
2. Modifica los campos necesarios
3. Click **"Guardar"**
4. La tarea se actualizará automáticamente sin romper el Kanban

**Filtrar tareas**:
- Usa los filtros por estado en la parte superior
- Busca por título o descripción

### 5. Asignar Tareas Masivamente

#### Método 1: Desde Excel
- Incluye la columna `assigned_to` con el ID del usuario
- Importa el archivo
- Todas las tareas se asignarán automáticamente

#### Método 2: Edición Manual
1. Abre cada tarea en el Kanban
2. Selecciona el usuario asignado
3. Guarda

#### Método 3: Grupos de Tareas (Nuevo)
1. Crea un grupo de tareas relacionadas
2. Asigna tiempo total distribuido
3. Agrupa múltiples tareas bajo un nombre

**Ejemplo**:
```javascript
Grupo: "Módulo de Autenticación"
Tiempo total: 40 horas
Tareas incluidas:
- Diseño de UI (8h)
- Backend API (16h)
- Integración (8h)
- Testing (8h)
```

### 6. Soporte de Minutos

**Nuevo**: Ahora puedes especificar tiempo en **minutos** para tareas cortas.

**Campos disponibles**:
- `estimated_hours`: Para tareas largas (ej: 2.5 horas)
- `estimated_minutes`: Para tareas cortas (ej: 30 minutos)

**Ejemplo de uso**:
- Reunión rápida: 15 minutos
- Code review: 30 minutos
- Bug fix menor: 45 minutos
- Desarrollo completo: 8 horas

## 🔍 Verificar Aislamiento de Proyectos

### Test de Aislamiento

1. **Selecciona proyecto Investi**:
   - Dashboard debe mostrar: 52 tareas, $5,200 en pagos, 7 fases
   - Tareas deben ser solo de Investi

2. **Cambia a proyecto Alma IA**:
   - Dashboard debe mostrar datos diferentes
   - Tareas deben cambiar completamente

3. **Verifica en Kanban**:
   - Solo deben aparecer tareas del proyecto seleccionado
   - NO deben mezclarse tareas de diferentes proyectos

### Solución de Problemas

**Si ves tareas de otros proyectos**:
1. Verifica que el selector de proyectos esté en "Investi"
2. Recarga la página (F5)
3. Verifica que `localStorage.getItem('project_id')` tenga el ID correcto

**Si el Kanban se rompe al actualizar**:
- ✅ **RESUELTO**: Ahora recarga automáticamente después de actualizar
- Las tareas se actualizan sin necesidad de recargar manualmente

**Si la importación falla**:
- Verifica que el Excel tenga la columna `title`
- Asegúrate de haber seleccionado un proyecto primero
- Revisa que el formato de fechas sea YYYY-MM-DD

## 📊 Funcionalidades Disponibles

### Para admin@pactum.com (COMPANY_ADMIN)

✅ **Dashboard del Proyecto**:
- Ver y editar todos los campos del proyecto
- Estadísticas en tiempo real
- Progreso general

✅ **Tareas**:
- Crear, editar, eliminar tareas
- Importar/exportar Excel
- Asignar a usuarios
- Soporte de horas y minutos

✅ **Kanban**:
- Vista de tablero completa
- Drag & drop entre estados
- Filtros y búsqueda
- Grupos de tareas

✅ **Pagos**:
- Gestión de pagos del proyecto
- Estados: pendiente, pagado, vencido

✅ **Fases**:
- Gestión de fases del proyecto
- Progreso por fase

✅ **Contratos**:
- Documentos del proyecto
- Términos y condiciones

✅ **Cuentas por Cobrar** (Nuevo):
- Gestión de cuentas por cobrar
- Tracking de partners
- Porcentajes de cobertura

### Para admin@investi.com (USER)

✅ **Dashboard**:
- Ver progreso del proyecto
- Estadísticas de tareas

✅ **Tareas**:
- Ver tareas asignadas
- Actualizar estado
- Agregar comentarios

✅ **Kanban**:
- Ver y mover sus tareas
- Filtro "Mostrar solo mis tareas"

❌ **Restricciones**:
- No puede ver otros proyectos
- No puede crear/eliminar proyectos
- No puede gestionar pagos/contratos
- No puede acceder a cuentas por cobrar

## 🚀 Flujo de Trabajo Recomendado

1. **Planificación**:
   - Admin crea proyecto en Investi
   - Define fases y entregables
   - Establece presupuesto y fechas

2. **Creación de Tareas**:
   - Importa tareas masivas desde Excel
   - O crea tareas individuales en Kanban
   - Asigna a usuarios del equipo

3. **Ejecución**:
   - Equipo mueve tareas en Kanban
   - Actualiza progreso
   - Agrega comentarios y archivos

4. **Seguimiento**:
   - Admin monitorea dashboard
   - Revisa estadísticas
   - Ajusta fechas y presupuesto

5. **Cierre**:
   - Marca todas las tareas como completadas
   - Registra pagos finales
   - Actualiza estado del proyecto

## 📝 Notas Importantes

- ✅ **Aislamiento garantizado**: Los datos de Investi NUNCA se mezclan con otros proyectos
- ✅ **Actualización automática**: El Kanban se actualiza sin romper al editar tareas
- ✅ **Soporte de minutos**: Ahora puedes especificar tiempo en minutos
- ✅ **Importación masiva**: Funciona correctamente con el proyecto seleccionado
- ✅ **Real-time updates**: Los cambios se reflejan inmediatamente en todos los módulos

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que el proyecto correcto esté seleccionado
2. Recarga la página (F5)
3. Revisa la consola del navegador para errores
4. Contacta al equipo de desarrollo
