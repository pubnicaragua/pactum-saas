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
    
    # Create project for Amaru Mojica
    amaru_project_id = str(uuid.uuid4())
    amaru_project_doc = {
        "id": amaru_project_id,
        "name": "Business & Technology - Sistema de Gestión",
        "description": "Desarrollo de sistema de gestión empresarial completo con módulos de CRM, facturación y reportes",
        "client_name": "Amaru José Mojica López",
        "budget": 5200.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
        "assigned_users": [amaru_user_id],
        "deliverables": [
            "Módulo de CRM completo",
            "Sistema de facturación",
            "Dashboard de reportes",
            "Integración con APIs externas",
            "Documentación técnica"
        ],
        "notes": "Proyecto prioritario - Business & Technology",
        "progress_percentage": 35,
        "company_id": pactum_company_id,
        "created_by": pactum_admin_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(amaru_project_doc)
    print("✅ Proyecto Amaru Mojica creado: $5,200")
    
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
        "client_name": "Alma IA",
        "budget": 8500.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=120)).isoformat(),
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
        "client_name": "Investi",
        "budget": 12000.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=150)).isoformat(),
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
        "client_name": "Solvendo",
        "budget": 15000.00,
        "status": "en_progreso",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=180)).isoformat(),
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
