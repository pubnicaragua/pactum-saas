"""
Script para inicializar la base de datos con datos de demostración
"""
import asyncio
import sys
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from server_multitenant import db, hash_password
from datetime import datetime, timezone, timedelta
import uuid

async def seed_initial_data():
    """Initialize database with seed data"""
    
    # Check if super admin already exists
    existing_super_admin = await db.users.find_one({"role": "SUPER_ADMIN"})
    if existing_super_admin:
        print("✅ Datos iniciales ya existen")
        return {"message": "Datos iniciales ya existen"}
    
    print("🚀 Inicializando base de datos...")
    
    # Create Super Admin (Software Nicaragua)
    super_admin_id = str(uuid.uuid4())
    super_admin_doc = {
        "id": super_admin_id,
        "email": "admin@softwarenicaragua.com",
        "password": hash_password("SoftwareNic2026!"),
        "name": "Software Nicaragua Admin",
        "role": "SUPER_ADMIN",
        "company_id": None,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(super_admin_doc)
    print("✅ Super Admin creado: admin@softwarenicaragua.com")
    
    # Create Software Nicaragua company (Pactum)
    pactum_company_id = str(uuid.uuid4())
    pactum_company_doc = {
        "id": pactum_company_id,
        "name": "Software Nicaragua",
        "email": "contacto@softwarenicaragua.com",
        "phone": "+505 8888-8888",
        "logo_url": None,
        "primary_color": "#3b82f6",
        "secondary_color": "#1e40af",
        "status": "active",
        "subscription_status": "active",
        "trial_ends_at": None,
        "active_modules": ["clients", "activities", "calendar", "pipeline", "projects", "invoicing", "reports"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(pactum_company_doc)
    print("✅ Empresa creada: Software Nicaragua")
    
    # Create admin user for Software Nicaragua
    pactum_admin_id = str(uuid.uuid4())
    pactum_admin_doc = {
        "id": pactum_admin_id,
        "email": "admin@pactum.com",
        "password": hash_password("Pactum#2026!"),
        "name": "Software Nicaragua Admin",
        "role": "COMPANY_ADMIN",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(pactum_admin_doc)
    print("✅ Admin Software Nicaragua creado: admin@pactum.com")
    
    # Create user for Amaru Mojica project
    amaru_user_id = str(uuid.uuid4())
    amaru_user_doc = {
        "id": amaru_user_id,
        "email": "activo2_26@gmail.com",
        "password": hash_password("Pactum#2026!"),
        "name": "Amaru José Mojica López",
        "role": "USER",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(amaru_user_doc)
    print("✅ Usuario creado: activo2_26@gmail.com (Amaru Mojica)")
    
    # Create client for Amaru Mojica project
    amaru_client_id = str(uuid.uuid4())
    amaru_client_doc = {
        "id": amaru_client_id,
        "name": "Amaru José Mojica López",
        "email": "activo2_26@gmail.com",
        "phone": "+505 8888-8888",
        "address": "Managua, Nicaragua",
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(amaru_client_doc)
    print("✅ Cliente creado: Amaru José Mojica López")
    
    # Create project for Amaru Mojica with complete details
    amaru_project_id = str(uuid.uuid4())
    amaru_project_doc = {
        "id": amaru_project_id,
        "name": "Business & Technology - Sistema de Gestión Empresarial",
        "description": "Desarrollo completo de sistema de gestión empresarial con 52 módulos/asignaciones incluyendo CRM, facturación, inventario, reportes avanzados y dashboards ejecutivos",
        "client_id": amaru_client_id,
        "client_name": "Amaru José Mojica López",
        "budget": 5200.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
        "contract_date": datetime.now(timezone.utc).isoformat(),
        "contract_number": "BT-2026-001",
        "payment_terms": "50% adelanto, 25% avance 50%, 25% entrega final",
        "assigned_users": [amaru_user_id],
        "deliverables": [
            "1. Módulo de CRM - Gestión de clientes y contactos",
            "2. Sistema de facturación electrónica",
            "3. Dashboard ejecutivo con KPIs en tiempo real",
            "4. Módulo de inventario y almacén",
            "5. Sistema de reportes personalizables",
            "6. Integración con APIs de bancos",
            "7. Módulo de recursos humanos",
            "8. Sistema de nómina",
            "9. Control de gastos e ingresos",
            "10. Gestión de proyectos internos",
            "11. Sistema de tickets/soporte",
            "12. Módulo de ventas y cotizaciones",
            "13. Gestión de proveedores",
            "14. Control de compras",
            "15. Sistema de punto de venta (POS)",
            "16. Módulo de contabilidad",
            "17. Gestión documental",
            "18. Sistema de permisos y roles",
            "19. Auditoría y logs de sistema",
            "20. Módulo de marketing y campañas",
            "21. Integración con redes sociales",
            "22. Sistema de email marketing",
            "23. Gestión de leads y oportunidades",
            "24. Pipeline de ventas visual",
            "25. Calendario y agenda compartida",
            "26. Sistema de tareas y recordatorios",
            "27. Módulo de análisis predictivo",
            "28. Reportes financieros automatizados",
            "29. Dashboard de ventas",
            "30. Módulo de servicio al cliente",
            "31. Chat interno para equipo",
            "32. Sistema de notificaciones push",
            "33. Integración con WhatsApp Business",
            "34. Módulo de firma electrónica",
            "35. Sistema de backup automático",
            "36. Gestión de contratos",
            "37. Control de vencimientos",
            "38. Módulo de cobranza",
            "39. Sistema de estados de cuenta",
            "40. Integración con pasarelas de pago",
            "41. Módulo de logística y envíos",
            "42. Tracking de pedidos",
            "43. Sistema de devoluciones",
            "44. Gestión de garantías",
            "45. Módulo de calidad (QA)",
            "46. Sistema de encuestas de satisfacción",
            "47. Análisis de competencia",
            "48. Módulo de business intelligence",
            "49. Exportación de datos (Excel, PDF, CSV)",
            "50. API REST para integraciones",
            "51. Documentación técnica completa",
            "52. Capacitación y soporte post-entrega"
        ],
        "notes": "Contrato firmado el " + datetime.now(timezone.utc).strftime("%d/%m/%Y") + ". Proyecto prioritario con 52 entregables específicos. Incluye 3 meses de soporte post-entrega. Reuniones semanales de seguimiento cada viernes. Cliente requiere actualizaciones diarias por WhatsApp.",
        "progress_percentage": 0,
        "total_hours_estimated": 520,
        "hours_worked": 0,
        "company_id": pactum_company_id,
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(amaru_project_doc)
    print("✅ Proyecto Amaru Mojica creado: $5,200 (52 entregables)")
    
    # Create 52 tasks for Amaru's project
    print("📋 Creando 52 tareas para el proyecto de Amaru...")
    task_titles = [
        "Módulo de CRM - Gestión de clientes y contactos",
        "Sistema de facturación electrónica",
        "Dashboard ejecutivo con KPIs en tiempo real",
        "Módulo de inventario y almacén",
        "Sistema de reportes personalizables",
        "Integración con APIs de bancos",
        "Módulo de recursos humanos",
        "Sistema de nómina",
        "Control de gastos e ingresos",
        "Gestión de proyectos internos",
        "Sistema de tickets/soporte",
        "Módulo de ventas y cotizaciones",
        "Gestión de proveedores",
        "Control de compras",
        "Sistema de punto de venta (POS)",
        "Módulo de contabilidad",
        "Gestión documental",
        "Sistema de permisos y roles",
        "Auditoría y logs de sistema",
        "Módulo de marketing y campañas",
        "Integración con redes sociales",
        "Sistema de email marketing",
        "Gestión de leads y oportunidades",
        "Pipeline de ventas visual",
        "Calendario y agenda compartida",
        "Sistema de tareas y recordatorios",
        "Módulo de análisis predictivo",
        "Reportes financieros automatizados",
        "Dashboard de ventas",
        "Módulo de servicio al cliente",
        "Chat interno para equipo",
        "Sistema de notificaciones push",
        "Integración con WhatsApp Business",
        "Módulo de firma electrónica",
        "Sistema de backup automático",
        "Gestión de contratos",
        "Control de vencimientos",
        "Módulo de cobranza",
        "Sistema de estados de cuenta",
        "Integración con pasarelas de pago",
        "Módulo de logística y envíos",
        "Tracking de pedidos",
        "Sistema de devoluciones",
        "Gestión de garantías",
        "Módulo de calidad (QA)",
        "Sistema de encuestas de satisfacción",
        "Análisis de competencia",
        "Módulo de business intelligence",
        "Exportación de datos (Excel, PDF, CSV)",
        "API REST para integraciones",
        "Documentación técnica completa",
        "Capacitación y soporte post-entrega"
    ]
    
    statuses = ["backlog"] * 52  # Todas las tareas empiezan en backlog (0% progreso)
    
    priorities = ["high", "high", "high", "high", "medium", "medium", "medium", "medium", "medium", "medium",
                  "medium", "medium", "medium", "low", "low", "low", "low", "low", "low", "low",
                  "low", "low", "low", "low", "low", "low", "low", "low", "low", "low",
                  "low", "low", "low", "low", "low", "low", "low", "low", "low", "low",
                  "low", "low", "low", "low", "low", "low", "low", "low", "low", "low", "low", "low"]
    
    estimated_hours = [40, 60, 50, 45, 35, 30, 40, 35, 25, 30, 35, 40, 25, 30, 50, 45, 30, 25, 20, 35,
                       25, 30, 35, 40, 25, 20, 45, 30, 35, 30, 25, 20, 30, 25, 20, 30, 20, 35, 25, 30,
                       35, 25, 20, 25, 30, 25, 30, 40, 35, 50, 40, 30]
    
    for i, title in enumerate(task_titles):
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "title": f"{i+1}. {title}",
            "description": f"Desarrollo e implementación de: {title}",
            "project_id": amaru_project_id,
            "assigned_to": amaru_user_id,
            "status": statuses[i],
            "priority": priorities[i],
            "estimated_hours": estimated_hours[i],
            "actual_hours": estimated_hours[i] if statuses[i] == "done" else (estimated_hours[i] * 0.5 if statuses[i] == "in_progress" else 0),
            "due_date": (datetime.now(timezone.utc) + timedelta(days=(i * 2))).isoformat(),
            "tags": ["business-technology", "desarrollo"],
            "created_by": pactum_admin_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tasks.insert_one(task_doc)
    
    print(f"✅ {len(task_titles)} tareas creadas para Amaru Mojica")
    
    # Create Phases for Amaru's project
    print("📊 Creando fases del proyecto...")
    phases_data = [
        {"name": "Fase 1: Análisis y Diseño", "description": "Levantamiento de requerimientos, diseño de arquitectura y mockups", "order": 1, "status": "pendiente", "progress": 0, "start_date": datetime.now(timezone.utc).isoformat(), "estimated_days": 15},
        {"name": "Fase 2: Desarrollo Backend (Módulos 1-20)", "description": "Desarrollo de APIs, base de datos y lógica de negocio para los primeros 20 módulos", "order": 2, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(), "estimated_days": 25},
        {"name": "Fase 3: Desarrollo Frontend (Módulos 1-20)", "description": "Interfaces de usuario, componentes y vistas para los primeros 20 módulos", "order": 3, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=40)).isoformat(), "estimated_days": 20},
        {"name": "Fase 4: Desarrollo Módulos Avanzados (21-40)", "description": "Implementación de módulos avanzados de integración y análisis", "order": 4, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(), "estimated_days": 20},
        {"name": "Fase 5: Integraciones y APIs (41-52)", "description": "Integración con servicios externos, APIs y documentación", "order": 5, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=80)).isoformat(), "estimated_days": 15},
        {"name": "Fase 6: Testing y QA", "description": "Pruebas exhaustivas, corrección de bugs y optimización", "order": 6, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=95)).isoformat(), "estimated_days": 10},
        {"name": "Fase 7: Despliegue y Capacitación", "description": "Despliegue a producción, capacitación al cliente y entrega final", "order": 7, "status": "pendiente", "progress": 0, "start_date": (datetime.now(timezone.utc) + timedelta(days=105)).isoformat(), "estimated_days": 5}
    ]
    
    for phase_data in phases_data:
        phase_id = str(uuid.uuid4())
        phase_doc = {
            "id": phase_id,
            "project_id": amaru_project_id,
            **phase_data,
            "created_by": pactum_admin_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.phases.insert_one(phase_doc)
    
    print(f"✅ {len(phases_data)} fases creadas para el proyecto")
    
    # Create Payments for Amaru's project
    print("💰 Creando sistema de pagos...")
    payments_data = [
        {
            "payment_number": 1,
            "description": "Pago inicial - 25% del proyecto",
            "amount": 1300.00,
            "percentage": 25,
            "status": "pagado",
            "due_date": datetime.now(timezone.utc).isoformat(),
            "paid_date": datetime.now(timezone.utc).isoformat(),
            "payment_method": "Transferencia bancaria",
            "receipt_url": None,
            "notes": "Primer pago recibido. Comprobante pendiente de subir."
        },
        {
            "payment_number": 2,
            "description": "Segundo pago - 25% al 50% de avance",
            "amount": 1300.00,
            "percentage": 25,
            "status": "pendiente",
            "due_date": (datetime.now(timezone.utc) + timedelta(days=45)).isoformat(),
            "paid_date": None,
            "payment_method": None,
            "receipt_url": None,
            "notes": "Pago programado para cuando se alcance el 50% de avance del proyecto"
        },
        {
            "payment_number": 3,
            "description": "Tercer pago - 25% al 75% de avance",
            "amount": 1300.00,
            "percentage": 25,
            "status": "pendiente",
            "due_date": (datetime.now(timezone.utc) + timedelta(days=75)).isoformat(),
            "paid_date": None,
            "payment_method": None,
            "receipt_url": None,
            "notes": "Pago programado para cuando se alcance el 75% de avance del proyecto"
        },
        {
            "payment_number": 4,
            "description": "Pago final - 25% a la entrega",
            "amount": 1300.00,
            "percentage": 25,
            "status": "pendiente",
            "due_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "paid_date": None,
            "payment_method": None,
            "receipt_url": None,
            "notes": "Pago final al completar el 100% del proyecto y entrega"
        }
    ]
    
    for payment_data in payments_data:
        payment_id = str(uuid.uuid4())
        payment_doc = {
            "id": payment_id,
            "project_id": amaru_project_id,
            **payment_data,
            "created_by": pactum_admin_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payments.insert_one(payment_doc)
    
    print(f"✅ {len(payments_data)} pagos creados (1 pagado, 3 pendientes)")
    
    # Create clients for Pactum (Software Nicaragua)
    print("📝 Creando clientes para Software Nicaragua...")
    
    # Cliente 1: Amaru Mojica (ya existe como usuario, ahora también como cliente)
    amaru_client_id = str(uuid.uuid4())
    amaru_client_doc = {
        "id": amaru_client_id,
        "company_id": pactum_company_id,
        "name": "Amaru José Mojica López",
        "email": "activo2_26@gmail.com",
        "phone": "+505 8888-8888",
        "company_name": "Amaru Mojica - Independiente",
        "address": "Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Cliente principal - Proyecto CRM Multi-Empresa",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(amaru_client_doc)
    
    # Cliente 2: Alma IA
    alma_client_id = str(uuid.uuid4())
    alma_client_doc = {
        "id": alma_client_id,
        "company_id": pactum_company_id,
        "name": "Alma IA",
        "email": "admin@almaia.com",
        "phone": "+505 7777-7777",
        "company_name": "Alma IA - Inteligencia Artificial",
        "address": "Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Partner estratégico - Soluciones de IA",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(alma_client_doc)
    
    # Cliente 3: CodeXpert
    codexpert_client_id = str(uuid.uuid4())
    codexpert_client_doc = {
        "id": codexpert_client_id,
        "company_id": pactum_company_id,
        "name": "CodeXpert",
        "email": "contacto@codexpert.com",
        "phone": "+505 6666-6666",
        "company_name": "CodeXpert - Soluciones Tecnológicas",
        "address": "Carretera Norte, Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Cliente potencial - En proceso de negociación",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(codexpert_client_doc)
    
    # Cliente 4: Solvendo
    solvendo_client_id = str(uuid.uuid4())
    solvendo_client_doc = {
        "id": solvendo_client_id,
        "company_id": pactum_company_id,
        "name": "Solvendo",
        "email": "admin@solvendo.com",
        "phone": "+505 5555-5555",
        "company_name": "Solvendo - Soluciones Empresariales",
        "address": "Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Cliente/Partner - Proyecto $15,000",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(solvendo_client_doc)
    
    # Cliente 5: Investi
    investi_client_id = str(uuid.uuid4())
    investi_client_doc = {
        "id": investi_client_id,
        "company_id": pactum_company_id,
        "name": "Investi",
        "email": "contacto@investi.com",
        "phone": "+505 5555-5555",
        "company_name": "Investi - Inversiones",
        "address": "Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Cliente de inversiones - Pago pendiente $3,286 máximo 20 Enero",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(investi_client_doc)
    
    # Cliente 6: Jessy Vargas (Préstamos/Inversiones)
    jessy_client_id = str(uuid.uuid4())
    jessy_client_doc = {
        "id": jessy_client_id,
        "company_id": pactum_company_id,
        "name": "Jessy Alejandro Vargas Altamirano",
        "email": "jessy@inversiones.com",
        "phone": "+505 3333-3333",
        "company_name": "Jessy Vargas - Préstamos",
        "address": "Managua",
        "city": "Managua",
        "country": "Nicaragua",
        "notes": "Préstamos personales - Deuda: $1,311.43 (C$47,683.68) - Comisiones pendientes por pagos: Investi 9%, Korean Cable 9%, Alma IA 5% y 9% - Código acceso: 123456",
        "status": "active",
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.clients.insert_one(jessy_client_doc)
    
    print("✅ 6 clientes creados para Software Nicaragua (Amaru, Alma IA, CodeXpert, Solvendo, Investi, Jessy)")
    
    # Create Alma IA user (Partner/Cliente)
    alma_user_id = str(uuid.uuid4())
    alma_user_doc = {
        "id": alma_user_id,
        "email": "admin@almaia.com",
        "password": hash_password("AlmaIA#2026!"),
        "name": "Alma IA",
        "role": "USER",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(alma_user_doc)
    print("✅ Usuario Partner creado: admin@almaia.com (Alma IA)")
    
    # Create project for Alma IA
    alma_project_id = str(uuid.uuid4())
    alma_project_doc = {
        "id": alma_project_id,
        "name": "Alma IA - Plataforma de Inteligencia Artificial",
        "description": "Desarrollo de plataforma de IA con procesamiento de lenguaje natural y análisis predictivo",
        "client_id": alma_client_id,
        "client_name": "Alma IA",
        "budget": 8500.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=120)).isoformat(),
        "contract_date": datetime.now(timezone.utc).isoformat(),
        "contract_number": "ALMA-IA-2026-001",
        "payment_terms": "4 Hitos (25% c/u)",
        "assigned_users": [alma_user_id],
        "deliverables": [
            "API de procesamiento de lenguaje natural",
            "Dashboard de análisis predictivo",
            "Sistema de entrenamiento de modelos",
            "Integración con servicios cloud",
            "Documentación técnica completa"
        ],
        "notes": "Proyecto partner - Alma IA en producción",
        "progress_percentage": 45,
        "company_id": pactum_company_id,
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(alma_project_doc)
    print("✅ Proyecto Alma IA creado: $8,500")
    
    # Create Investi user (Partner/Cliente)
    investi_user_id = str(uuid.uuid4())
    investi_user_doc = {
        "id": investi_user_id,
        "email": "admin@investi.com",
        "password": hash_password("Investi#2026!"),
        "name": "Investi",
        "role": "USER",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(investi_user_doc)
    print("✅ Usuario Partner creado: admin@investi.com (Investi)")
    
    # Create project for Investi
    investi_project_id = str(uuid.uuid4())
    investi_project_doc = {
        "id": investi_project_id,
        "name": "Investi - Sistema de Gestión de Inversiones",
        "description": "Plataforma completa para gestión de portafolios de inversión y análisis financiero",
        "client_id": investi_client_id,
        "client_name": "Investi",
        "budget": 12000.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=150)).isoformat(),
        "contract_date": datetime.now(timezone.utc).isoformat(),
        "contract_number": "INVESTI-2026-001",
        "payment_terms": "3 pagos (40%, 30%, 30%)",
        "assigned_users": [investi_user_id],
        "deliverables": [
            "Sistema de gestión de portafolios",
            "Análisis financiero en tiempo real",
            "Reportes automatizados",
            "Integración con APIs bancarias",
            "App móvil iOS y Android"
        ],
        "notes": "Proyecto partner - Investi en producción",
        "progress_percentage": 60,
        "company_id": pactum_company_id,
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(investi_project_doc)
    print("✅ Proyecto Investi creado: $12,000")
    
    # Create Solvendo user (Partner/Cliente)
    solvendo_user_id = str(uuid.uuid4())
    solvendo_user_doc = {
        "id": solvendo_user_id,
        "email": "admin@solvendo.com",
        "password": hash_password("Solvendo#2026!"),
        "name": "Solvendo",
        "role": "USER",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(solvendo_user_doc)
    print("✅ Usuario Partner creado: admin@solvendo.com (Solvendo)")
    
    # Create project for Solvendo
    solvendo_project_id = str(uuid.uuid4())
    solvendo_project_doc = {
        "id": solvendo_project_id,
        "name": "Solvendo - Plataforma de Soluciones Empresariales",
        "description": "Sistema ERP completo con módulos de contabilidad, inventario y recursos humanos",
        "client_id": solvendo_client_id,
        "client_name": "Solvendo",
        "budget": 15000.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=180)).isoformat(),
        "contract_date": datetime.now(timezone.utc).isoformat(),
        "contract_number": "SOLVENDO-2026-001",
        "payment_terms": "5 Hitos (20% c/u)",
        "assigned_users": [solvendo_user_id],
        "deliverables": [
            "Módulo de contabilidad completo",
            "Sistema de inventario y almacén",
            "Gestión de recursos humanos",
            "Reportes financieros avanzados",
            "Integración con sistemas externos"
        ],
        "notes": "Proyecto partner - Solvendo en producción",
        "progress_percentage": 55,
        "company_id": pactum_company_id,
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(solvendo_project_doc)
    print("✅ Proyecto Solvendo creado: $15,000")
    
    # Create demo company
    demo_company_id = str(uuid.uuid4())
    trial_ends = datetime.now(timezone.utc) + timedelta(days=14)
    demo_company_doc = {
        "id": demo_company_id,
        "name": "Empresa Demo",
        "email": "demo@empresa.com",
        "phone": "+505 7777-7777",
        "logo_url": None,
        "primary_color": "#10b981",
        "secondary_color": "#059669",
        "status": "active",
        "subscription_status": "trial",
        "trial_ends_at": trial_ends.isoformat(),
        "trial_started_at": datetime.now(timezone.utc).isoformat(),
        "active_modules": ["clients", "activities", "calendar"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(demo_company_doc)
    print("✅ Empresa Demo creada (Trial 14 días)")
    
    # Create admin for demo company
    demo_admin_id = str(uuid.uuid4())
    demo_admin_doc = {
        "id": demo_admin_id,
        "email": "admin@demo.com",
        "password": hash_password("Demo2026!"),
        "name": "Admin Demo",
        "role": "COMPANY_ADMIN",
        "company_id": demo_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(demo_admin_doc)
    print("✅ Admin Demo creado: admin@demo.com")
    
    # Create sample clients for demo company
    print("📝 Creando clientes de demostración...")
    for i in range(5):
        client_id = str(uuid.uuid4())
        client_doc = {
            "id": client_id,
            "name": f"Cliente Demo {i+1}",
            "email": f"cliente{i+1}@demo.com",
            "phone": f"+505 8888-000{i}",
            "company_name": f"Empresa Cliente {i+1}",
            "address": f"Dirección {i+1}",
            "city": "Managua",
            "country": "Nicaragua",
            "tags": ["demo", "cliente"],
            "notes": f"Cliente de demostración {i+1}",
            "company_id": demo_company_id,
            "status": "active",
            "created_by": demo_admin_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.clients.insert_one(client_doc)
    print("✅ 5 clientes creados")
    
    # Create sample activities for demo company
    print("📅 Creando actividades de demostración...")
    activity_types = ["llamada", "reunion", "tarea", "seguimiento", "email"]
    priorities = ["baja", "media", "alta"]
    statuses = ["pendiente", "en_progreso", "completada"]
    
    clients = await db.clients.find({"company_id": demo_company_id}, {"_id": 0}).to_list(10)
    
    for i in range(10):
        activity_id = str(uuid.uuid4())
        start_date = datetime.now(timezone.utc) + timedelta(days=i-5)
        end_date = start_date + timedelta(hours=2)
        
        activity_doc = {
            "id": activity_id,
            "title": f"Actividad Demo {i+1}",
            "description": f"Descripción de la actividad {i+1}",
            "type": activity_types[i % len(activity_types)],
            "client_id": clients[i % len(clients)]["id"] if clients else None,
            "assigned_to": demo_admin_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": statuses[i % len(statuses)],
            "priority": priorities[i % len(priorities)],
            "company_id": demo_company_id,
            "created_by": demo_admin_id,
            "completed": i % 3 == 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.activities.insert_one(activity_doc)
    print("✅ 10 actividades creadas")
    
    print("\n" + "="*60)
    print("✨ Base de datos inicializada exitosamente!")
    print("="*60)
    print("\n📋 CREDENCIALES DE ACCESO:\n")
    print("🔴 SUPER ADMIN (Software Nicaragua):")
    print("   Email:    admin@softwarenicaragua.com")
    print("   Password: SoftwareNic2026!")
    print("   Acceso:   Control total del sistema\n")
    
    print("🟢 SOFTWARE NICARAGUA (Company Admin):")
    print("   Email:    admin@pactum.com")
    print("   Password: Pactum#2026!")
    print("   Acceso:   Gestión completa de empresa\n")
    
    print("🔵 AMARU MOJICA (Cliente - Proyecto $5,200):")
    print("   Email:    activo2_26@gmail.com")
    print("   Password: Pactum#2026!")
    print("   Acceso:   Ver su proyecto asignado\n")
    
    print("🟣 ALMA IA (Cliente/Partner - Proyecto $8,500):")
    print("   Email:    admin@almaia.com")
    print("   Password: AlmaIA#2026!")
    print("   Acceso:   Ver su proyecto asignado\n")
    
    print("🟠 INVESTI (Cliente/Partner - Proyecto $12,000):")
    print("   Email:    admin@investi.com")
    print("   Password: Investi#2026!")
    print("   Acceso:   Ver su proyecto asignado\n")
    
    print("🟢 SOLVENDO (Cliente/Partner - Proyecto $15,000):")
    print("   Email:    admin@solvendo.com")
    print("   Password: Solvendo#2026!")
    print("   Acceso:   Ver su proyecto asignado\n")
    
    print("🟡 EMPRESA DEMO (Trial 14 días):")
    print("   Email:    admin@demo.com")
    print("   Password: Demo2026!")
    print("   Acceso:   Módulos básicos + datos demo\n")
    
    print("="*60)
    print("🚀 Inicia el servidor con: python server_multitenant.py")
    print("🌐 Frontend en: http://localhost:3000")
    print("🔧 Backend en: http://localhost:8000")
    print("="*60 + "\n")
    
    return {
        "message": "Datos iniciales creados exitosamente",
        "super_admin": {
            "email": "admin@softwarenicaragua.com",
            "password": "SoftwareNic2026!"
        },
        "pactum_client": {
            "email": "admin@pactum.com",
            "password": "Pactum#2026!"
        },
        "demo_company": {
            "email": "admin@demo.com",
            "password": "Demo2026!"
        }
    }

if __name__ == "__main__":
    asyncio.run(seed_initial_data())
