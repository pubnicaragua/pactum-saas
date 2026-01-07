# Implementación de Informe Financiero Editable - Software Nicaragua

## Objetivo
Crear una página de control financiero interno editable para Software Nicaragua que permita visualizar y amortizar costos en tiempo real esto solo vera el usuario de admin@pactum.com

## Especificaciones del Sistema

### 1. Estructura del Informe Financiero

#### Resumen Financiero (Calculado automáticamente)
- **Ingreso recibido**: C$47,606
- **Total asignado (pagos/abonos)**: C$38,100
- **Saldo disponible después de asignaciones**: C$9,506
- **Costos futuros a cubrir (reservas)**: C$12,100
- **Saldo proyectado**: C$-2,594

#### Uso Planificado (Pagos/Abonos) - Editable
| Concepto | Monto Planificado | Monto Ejecutado | Variación | Estado/Nota |
|----------|------------------|----------------|-----------|-------------|
| Abono a Carlos | C$11,000 | [editable] | [cálculo] | [editable] |
| Pago de préstamo (cuota actual) | C$13,000 | [editable] | [cálculo] | [editable] |
| Campañas Meta Ads | C$6,500 | [editable] | [cálculo] | [editable] |
| Pago a Ofilio | C$2,000 | [editable] | [cálculo] | [editable] |
| Pagos a Miguel y Jonathan | C$2,500 | [editable] | [cálculo] | [editable] |
| Pago a Paolo Fernández | C$2,500 | [editable] | [cálculo] | [editable] |
| Pago a Danny Carranza (investigación) | C$600 | [editable] | [cálculo] | [editable] |

#### Reservas / Costos Futuros - Editable
| Concepto | Monto a Reservar | Monto Ejecutado | Variación | Estado/Nota |
|----------|------------------|----------------|-----------|-------------|
| Meta Ads (siguiente inversión) | C$2,600 | [editable] | [cálculo] | [editable] |
| Préstamo (siguiente pago en 15 días) | C$6,500 | [editable] | [cálculo] | [editable] |
| Revisión camioneta + gasolina | C$2,000 | [editable] | [cálculo] | [editable] |
| Gasolina (1 semana) | C$1,000 | [editable] | [cálculo] | [editable] |

### 2. Plan de Implementación Técnica

#### Backend (Python/Flask)
```python
# Nuevos endpoints necesarios:
- GET /api/financial/summary - Obtener resumen financiero
- PUT /api/financial/payments - Actualizar pagos ejecutados
- PUT /api/financial/reserves - Actualizar reservas ejecutadas
- GET /api/financial/history - Obtener historial de cambios
```

#### Frontend (React)
```javascript
// Componentes necesarios:
- FinancialDashboard.js - Dashboard principal
- EditableTable.js - Tabla editable genérica
- SummaryCards.js - Tarjetas de resumen
- RealTimeCalculator.js - Calculadora en tiempo real
```

#### Base de Datos
```sql
-- Nuevas tablas requeridas:
CREATE TABLE financial_report (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    period_start DATE,
    period_end DATE,
    total_income DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    concept VARCHAR(255),
    planned_amount DECIMAL(10,2),
    executed_amount DECIMAL(10,2),
    status_note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE financial_reserves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT,
    concept VARCHAR(255),
    reserve_amount DECIMAL(10,2),
    executed_amount DECIMAL(10,2),
    status_note TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Control de Acceso por Usuario

#### Estrategia de Implementación
1. **Autenticación**: Verificar que solo el usuario autorizado pueda acceder
2. **Permisos**: Configurar rol específico para "Software Nicaragua"
3. **Filtrado**: Mostrar solo datos del usuario autenticado

#### Implementación
```python
# Middleware de autenticación
@app.route('/financial')
@role_required('software_nicaragua')
@login_required
def financial_dashboard():
    user_id = current_user.id
    # Obtener datos específicos del usuario
    return render_template('financial.html', user_data=data)
```

### 4. Funcionalidades en Tiempo Real

#### Características Implementadas
- **Auto-guardado**: Guardar cambios cada 30 segundos automáticamente
- **Cálculo automático**: Recalcular totales al cambiar cualquier valor
- **Validación**: Validar que los montos ejecutados no superen los planificados
- **Historial**: Registrar todos los cambios con timestamp y usuario
- **Notificaciones**: Alertas cuando el saldo disponible es negativo

#### JavaScript para Tiempo Real
```javascript
// Auto-guardado
setInterval(() => {
    saveChanges();
}, 30000);

// Cálculo automático
function calculateTotals() {
    const totalAssigned = calculateTotalAssigned();
    const availableBalance = totalIncome - totalAssigned;
    const projectedBalance = availableBalance - totalReserves;
    
    updateSummaryCards({
        totalAssigned,
        availableBalance,
        projectedBalance
    });
}
```

### 5. Sugerencias de Uso y Mejores Prácticas

#### Para el Usuario
1. **Actualización frecuente**: Actualizar los montos ejecutados diariamente
2. **Notas detalladas**: Usar el campo "Estado/Nota" para registrar detalles importantes
3. **Revisión semanal**: Revisar el saldo proyectado cada semana para tomar decisiones
4. **Archivar historial**: Guardar reportes anteriores para comparación

#### Para el Administrador
1. **Backup diario**: Realizar copias de seguridad de los datos financieros
2. **Auditoría**: Revisar cambios importantes regularmente
3. **Capacitación**: Entrenar al usuario sobre el uso correcto del sistema
4. **Mejoras continuas**: Recopilar feedback para mejorar la interfaz

#### Alertas Automáticas
- **Saldo negativo**: Alerta cuando el saldo proyectado es < 0
- **Variaciones grandes**: Notificación cuando una variación > 20%
- **Pagos pendientes**: Recordatorio de pagos próximos a vencer
- **Reservas insuficientes**: Alerta cuando las reservas superan el saldo disponible

### 6. Integración con Sistema Existente

#### Puntos de Integración
1. **Sistema de usuarios**: Reutilizar autenticación existente
2. **Base de datos**: Agregar tablas sin afectar estructura actual
3. **Dashboard**: Integrar como nueva sección del panel principal
4. **Notificaciones**: Usar sistema de notificaciones existente

#### Compatibilidad
- **Responsive**: Funcionar en móviles y tablets
- **Browser support**: Compatible con navegadores modernos
- **Export**: Permitir exportar a PDF y Excel
- **Print**: Versión imprimible del reporte

### 7. Plan de Desarrollo (Fases)

#### Fase 1: MVP (1 semana)
- [ ] Crear estructura de base de datos
- [ ] Implementar backend básico
- [ ] Crear frontend editable básico
- [ ] Configurar control de acceso

#### Fase 2: Funcionalidades (1 semana)
- [ ] Implementar cálculos en tiempo real
- [ ] Agregar auto-guardado
- [ ] Crear sistema de alertas
- [ ] Implementar historial de cambios

#### Fase 3: Mejoras (1 semana)
- [ ] Optimizar UX/UI
- [ ] Agregar exportación
- [ ] Implementar notificaciones avanzadas
- [ ] Testing y documentación

### 8. Consideraciones de Seguridad

#### Medidas de Seguridad
1. **Encriptación**: Encriptar datos financieros sensibles
2. **Logs**: Registrar todos los accesos y cambios
3. **Validación**: Validar todos los datos de entrada
4. **Permisos**: Restringir acceso solo a usuarios autorizados
5. **Backup**: Copias de seguridad regulares

### 9. Métricas de Éxito

#### KPIs a Medir
- **Adopción**: Frecuencia de uso del sistema
- **Precisión**: Exactitud de los datos vs realidad
- **Tiempo**: Reducción en tiempo de gestión financiera
- **Decisiones**: Mejora en toma de decisiones financieras

---

## Solución a Problema de Tareas (Jonathan y Miguel)

### Problema Identificado
Jonathan y Miguel ven 82 tareas en lugar de solo las asignadas a su proyecto Alma IA.

### Causa Raíz
El endpoint `/api/tasks` en `server.py` no filtra tareas por usuario asignado:

```python
# Código actual (línea 355-363)
@api_router.get("/tasks")
async def get_tasks(project_id: Optional[str] = None, week: Optional[int] = None, user: dict = Depends(get_current_user)):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if week:
        query["week"] = week
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(500)  # ← Retorna TODAS las tareas
    return tasks
```

### Solución Propuesta

#### 1. Modificar Backend para Filtrar por Usuario
```python
# Nuevo endpoint modificado
@api_router.get("/tasks")
async def get_tasks(project_id: Optional[str] = None, week: Optional[int] = None, user: dict = Depends(get_current_user)):
    query = {}
    
    # Si no es Admin, filtrar por tareas asignadas al usuario
    if user["role"] != "Admin":
        query["assigned_to"] = user["id"]
    
    if project_id:
        query["project_id"] = project_id
    if week:
        query["week"] = week
        
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(500)
    return tasks
```

#### 2. Actualizar Frontend para Soportar Filtros
```javascript
// Modificar api-multitenant.js
export const getTasks = (projectId = null, assignedToMe = false) => {
  const params = { project_id: projectId };
  if (assignedToMe) {
    params.assigned_to_me = true;
  }
  return api.get('/tasks', { params });
};
```

#### 3. Implementar Vista de "Mis Tareas" en Frontend
```javascript
// Nuevo componente MyTasksView.js
const MyTasksView = () => {
  const [tasks, setTasks] = useState([]);
  const user = useSelector(state => state.auth.user);
  
  useEffect(() => {
    // Cargar solo tareas asignadas al usuario actual
    getTasks(null, true).then(response => {
      setTasks(response.data);
    });
  }, []);
  
  return (
    <div>
      <h2>Mis Tareas Asignadas</h2>
      <TaskList tasks={tasks} />
    </div>
  );
};
```

### Pasos para Implementar la Solución

1. **Modificar Backend** (5 minutos):
   - Editar `backend/server.py` línea 355-363
   - Agregar filtro por `assigned_to` para usuarios no-Admin

2. **Actualizar Frontend** (10 minutos):
   - Modificar `frontend/src/lib/api-multitenant.js`
   - Crear componente `MyTasksView.js`
   - Agregar ruta en el router

3. **Testing** (5 minutos):
   - Probar con usuario Admin (debe ver todas las tareas)
   - Probar con Jonathan (debe ver solo sus tareas asignadas)
   - Probar con Miguel (debe ver solo sus tareas asignadas)

### Resultado Esperado
- **Admin**: Verá todas las 82 tareas (sin cambios)
- **Jonathan**: Verá solo ~20 tareas asignadas a él
- **Miguel**: Verá solo ~20 tareas asignadas a él

---

## Próximos Pasos

1. **Aprobación**: Revisar y aprovar este plan de implementación
2. **Setup**: Configurar entorno de desarrollo
3. **Desarrollo**: 
   - Iniciar con Fase 1 del plan financiero
   - Implementar solución de filtrado de tareas (prioridad alta)
4. **Testing**: Probar con datos reales del usuario
5. **Deploy**: Implementar en producción

**Nota**: Este sistema será accesible únicamente para el usuario autorizado de Software Nicaragua, con control de acceso basado en roles y autenticación.
