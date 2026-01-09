# 📊 DIAGRAMA DE FLUJO - SISTEMA DE ROLES Y PERMISOS

## 🎯 ESTADO ACTUAL DEL SISTEMA

### **ROLES DEFINIDOS**

```
┌─────────────────────────────────────────────────────────────┐
│                    JERARQUÍA DE ROLES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SUPER_ADMIN (Pactum - Sistema Global)                  │
│     └─ Acceso total a todas las empresas                   │
│                                                              │
│  2. COMPANY_ADMIN (Admin de Alma IA, etc.)                 │
│     └─ Acceso total a SU empresa                           │
│                                                              │
│  3. USER (Cliente externo con proyecto asignado)           │
│     └─ Acceso solo a SUS proyectos asignados               │
│                                                              │
│  4. TEAM_MEMBER (Jonathan, Miguel, Paolo)                  │
│     └─ Acceso solo a proyectos donde está asignado         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 MATRIZ DE PERMISOS ACTUAL

### **ACCESO A DATOS POR ROL**

| Recurso | SUPER_ADMIN | COMPANY_ADMIN | USER | TEAM_MEMBER |
|---------|-------------|---------------|------|-------------|
| **Clientes** | ✅ Todas las empresas | ✅ Su empresa | ❌ No | ❌ No |
| **Proyectos** | ✅ Todos | ✅ Su empresa | ✅ Solo asignados | ❌ No ve lista |
| **Tareas** | ✅ Todas | ✅ Su empresa | ✅ Solo de sus proyectos | ✅ Solo de sus proyectos |
| **Kanban** | ✅ Todos | ✅ Su empresa | ✅ Solo sus proyectos | ✅ Solo sus proyectos |
| **Usuarios** | ✅ Todos | ✅ Su empresa | ❌ No | ❌ No |
| **Pagos/Finanzas** | ✅ Todos | ✅ Su empresa | ❌ No | ❌ No |
| **Presupuestos** | ✅ Todos | ✅ Su empresa | ❌ No | ❌ No |
| **Panel Admin** | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| **Dashboard** | ✅ Global | ✅ Su empresa | ✅ Su proyecto | ❌ Redirige a /tareas |

---

## 🔄 FLUJO DE ACCESO A TAREAS/KANBAN

```
┌──────────────────────────────────────────────────────────────┐
│                   USUARIO HACE LOGIN                          │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  ¿Cuál es el rol?      │
        └────────┬───────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
    ▼            ▼            ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────┐  ┌──────────────┐
│SUPER    │ │COMPANY   │ │USER  │  │TEAM_MEMBER   │
│ADMIN    │ │ADMIN     │ │      │  │              │
└────┬────┘ └────┬─────┘ └───┬──┘  └──────┬───────┘
     │           │            │            │
     │           │            │            │
     ▼           ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Ve TODAS │ │Ve tareas │ │Ve tareas │ │Ve tareas │
│las      │ │de TODOS  │ │de SUS    │ │de SUS    │
│empresas │ │los       │ │proyectos │ │proyectos │
│         │ │proyectos │ │asignados │ │asignados │
│         │ │de SU     │ │          │ │          │
│         │ │empresa   │ │          │ │          │
└─────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 🗂️ FLUJO DE ASIGNACIÓN DE PROYECTOS

```
┌────────────────────────────────────────────────────────────┐
│  ADMIN crea/edita PROYECTO                                 │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Selecciona USUARIOS con checkboxes                        │
│  - Jonathan ☑                                              │
│  - Miguel ☑                                                │
│  - Paolo ☑                                                 │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Sistema guarda en proyecto:                               │
│  assigned_users: ["jonathan_id", "miguel_id", "paolo_id"] │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  TEAM_MEMBER hace login                                    │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Backend busca:                                            │
│  projects.find({ assigned_users: "user_id" })             │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Filtra tareas:                                            │
│  tasks.find({ project_id: { $in: [project_ids] } })       │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Usuario solo ve tareas de SUS proyectos                  │
└────────────────────────────────────────────────────────────┘
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS (ENREDO ACTUAL)

### **1. Confusión de Roles USER vs TEAM_MEMBER**

```
❌ PROBLEMA:
- USER: Cliente externo (ve su proyecto)
- TEAM_MEMBER: Miembro interno del equipo (Jonathan, Miguel)
- Ambos tienen lógica similar pero propósitos diferentes
- Genera confusión en el código

✅ SOLUCIÓN PROPUESTA:
- Renombrar USER → CLIENT
- TEAM_MEMBER sigue igual
- Más claro: CLIENT = externo, TEAM_MEMBER = interno
```

### **2. COMPANY_ADMIN no ve Kanban claramente**

```
❌ PROBLEMA ACTUAL:
- COMPANY_ADMIN tiene acceso pero no está explícito
- Filtrado funciona pero puede mejorar claridad

✅ VERIFICACIÓN NECESARIA:
- COMPANY_ADMIN debe ver Kanban de TODOS los proyectos de su empresa
- Sin restricción de assigned_users
```

### **3. Datos Financieros Visibles**

```
❌ PROBLEMA:
- Presupuestos visibles en proyectos
- TEAM_MEMBER no debe ver dinero

✅ SOLUCIÓN:
- Ocultar budget en frontend para TEAM_MEMBER
- Mostrar solo para COMPANY_ADMIN y SUPER_ADMIN
```

### **4. Múltiples Niveles de Filtrado**

```
❌ ENREDO:
Backend filtra por:
1. company_id (para COMPANY_ADMIN)
2. assigned_users en projects (para TEAM_MEMBER)
3. assigned_to en tasks (ya no se usa para TEAM_MEMBER)

✅ SIMPLIFICACIÓN:
- SUPER_ADMIN: Sin filtros
- COMPANY_ADMIN: Solo company_id
- TEAM_MEMBER: Solo assigned_users en projects
- CLIENT: Solo assigned_users en projects
```

---

## 🎯 FLUJO REFINADO PROPUESTO

### **ESTRUCTURA SIMPLIFICADA**

```
┌─────────────────────────────────────────────────────────────┐
│                    ROLES REFINADOS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SUPER_ADMIN                                                │
│  ├─ Acceso: TODO                                            │
│  └─ Filtro: Ninguno                                         │
│                                                              │
│  COMPANY_ADMIN (Admin de Alma IA)                          │
│  ├─ Acceso: Toda su empresa                                │
│  ├─ Filtro: company_id                                      │
│  └─ Ve: Clientes, Proyectos, Tareas, Kanban, Finanzas     │
│                                                              │
│  TEAM_MEMBER (Jonathan, Miguel, Paolo)                     │
│  ├─ Acceso: Solo proyectos asignados                       │
│  ├─ Filtro: projects.assigned_users                        │
│  ├─ Ve: Tareas, Kanban de sus proyectos                   │
│  └─ NO ve: Finanzas, Presupuestos, Panel Admin            │
│                                                              │
│  CLIENT (Cliente externo)                                   │
│  ├─ Acceso: Solo SU proyecto                               │
│  ├─ Filtro: projects.assigned_users                        │
│  ├─ Ve: Dashboard de su proyecto, Tareas, Pagos           │
│  └─ NO ve: Otros proyectos, Panel Admin, Presupuestos     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### **Para COMPANY_ADMIN (Admin de Alma IA):**
- [ ] ✅ Ve Dashboard de su empresa
- [ ] ✅ Ve TODOS los proyectos de su empresa
- [ ] ✅ Ve TODAS las tareas de su empresa
- [ ] ✅ Ve Kanban con TODAS las tareas
- [ ] ✅ Puede crear/editar proyectos
- [ ] ✅ Puede asignar usuarios a proyectos
- [ ] ✅ Ve presupuestos y finanzas
- [ ] ✅ Acceso al Panel Admin

### **Para TEAM_MEMBER (Jonathan, Miguel, Paolo):**
- [ ] ✅ Redirige a /tareas al login
- [ ] ✅ Ve solo tareas de proyectos asignados
- [ ] ✅ Ve Kanban solo de sus proyectos
- [ ] ❌ NO ve presupuestos
- [ ] ❌ NO ve datos financieros
- [ ] ❌ NO ve Panel Admin
- [ ] ❌ NO ve proyectos donde no está asignado

### **Para CLIENT (Cliente externo):**
- [ ] ✅ Ve Dashboard de SU proyecto
- [ ] ✅ Ve tareas de SU proyecto
- [ ] ✅ Ve pagos de SU proyecto
- [ ] ❌ NO ve otros proyectos
- [ ] ❌ NO ve presupuestos
- [ ] ❌ NO ve Panel Admin

---

## 🔧 ACCIONES CORRECTIVAS NECESARIAS

### **1. Verificar acceso de COMPANY_ADMIN al Kanban**
```javascript
// En TaskBoard.jsx - Verificar que COMPANY_ADMIN vea todo
if (user.role === 'COMPANY_ADMIN') {
  // Debe cargar TODAS las tareas de su empresa
  // Sin filtrar por assigned_users
}
```

### **2. Ocultar datos financieros para TEAM_MEMBER**
```javascript
// En componentes de proyecto
{user.role !== 'TEAM_MEMBER' && (
  <div>Presupuesto: ${project.budget}</div>
)}
```

### **3. Simplificar lógica de filtrado**
```python
# Backend - server_multitenant.py
if user["role"] == "COMPANY_ADMIN":
    # Solo filtrar por company_id
    query["company_id"] = user["company_id"]
elif user["role"] == "TEAM_MEMBER":
    # Solo filtrar por proyectos asignados
    user_projects = await db.projects.find({"assigned_users": user["id"]})
    query["project_id"] = {"$in": project_ids}
```

---

## 📊 RESUMEN VISUAL

```
EMPRESA: Alma IA
├─ COMPANY_ADMIN (tú)
│  └─ Ve TODO de Alma IA
│     ├─ Todos los proyectos
│     ├─ Todas las tareas
│     ├─ Todo el Kanban
│     └─ Todas las finanzas
│
├─ TEAM_MEMBER: Jonathan
│  └─ Ve solo proyectos asignados
│     ├─ Proyecto A ✅
│     ├─ Proyecto B ✅
│     └─ Proyecto C ❌ (no asignado)
│
├─ TEAM_MEMBER: Miguel
│  └─ Ve solo proyectos asignados
│     ├─ Proyecto A ✅
│     ├─ Proyecto B ❌
│     └─ Proyecto C ✅
│
└─ CLIENT: Cliente Externo
   └─ Ve solo SU proyecto
      └─ Proyecto B ✅
```

---

## 🎯 CONCLUSIÓN

**El sistema tiene la lógica correcta pero necesita:**
1. ✅ Verificar que COMPANY_ADMIN vea Kanban completo
2. ✅ Ocultar presupuestos para TEAM_MEMBER
3. ✅ Simplificar nombres de roles (USER → CLIENT)
4. ✅ Documentar claramente cada flujo

**Estado actual: 85% correcto, necesita refinamiento de UI y verificación de permisos.**
