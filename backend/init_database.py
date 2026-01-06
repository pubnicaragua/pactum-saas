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
    
    # Create Alma IA company
    alma_company_id = str(uuid.uuid4())
    alma_company_doc = {
        "id": alma_company_id,
        "name": "Alma IA",
        "email": "contacto@almaia.com",
        "phone": "+505 8888-1111",
        "logo_url": None,
        "primary_color": "#8b5cf6",
        "secondary_color": "#7c3aed",
        "status": "active",
        "subscription_status": "active",
        "trial_ends_at": None,
        "active_modules": ["clients", "activities", "calendar", "pipeline", "projects", "invoicing", "reports"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(alma_company_doc)
    print("✅ Empresa creada: Alma IA")
    
    # Create admin for Alma IA
    alma_admin_id = str(uuid.uuid4())
    alma_admin_doc = {
        "id": alma_admin_id,
        "email": "admin@almaia.com",
        "password": hash_password("AlmaIA#2026!"),
        "name": "Alma IA Admin",
        "role": "COMPANY_ADMIN",
        "company_id": alma_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(alma_admin_doc)
    print("✅ Admin Alma IA creado: admin@almaia.com")
    
    # Create Investi company
    investi_company_id = str(uuid.uuid4())
    investi_company_doc = {
        "id": investi_company_id,
        "name": "Investi",
        "email": "contacto@investi.com",
        "phone": "+505 8888-2222",
        "logo_url": None,
        "primary_color": "#f59e0b",
        "secondary_color": "#d97706",
        "status": "active",
        "subscription_status": "active",
        "trial_ends_at": None,
        "active_modules": ["clients", "activities", "calendar", "pipeline", "projects", "invoicing", "reports"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(investi_company_doc)
    print("✅ Empresa creada: Investi")
    
    # Create admin for Investi
    investi_admin_id = str(uuid.uuid4())
    investi_admin_doc = {
        "id": investi_admin_id,
        "email": "admin@investi.com",
        "password": hash_password("Investi#2026!"),
        "name": "Investi Admin",
        "role": "COMPANY_ADMIN",
        "company_id": investi_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(investi_admin_doc)
    print("✅ Admin Investi creado: admin@investi.com")
    
    # Create Solvendo company
    solvendo_company_id = str(uuid.uuid4())
    solvendo_company_doc = {
        "id": solvendo_company_id,
        "name": "Solvendo",
        "email": "contacto@solvendo.com",
        "phone": "+505 8888-3333",
        "logo_url": None,
        "primary_color": "#10b981",
        "secondary_color": "#059669",
        "status": "active",
        "subscription_status": "active",
        "trial_ends_at": None,
        "active_modules": ["clients", "activities", "calendar", "pipeline", "projects", "invoicing", "reports"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(solvendo_company_doc)
    print("✅ Empresa creada: Solvendo")
    
    # Create admin for Solvendo
    solvendo_admin_id = str(uuid.uuid4())
    solvendo_admin_doc = {
        "id": solvendo_admin_id,
        "email": "admin@solvendo.com",
        "password": hash_password("Solvendo#2026!"),
        "name": "Solvendo Admin",
        "role": "COMPANY_ADMIN",
        "company_id": solvendo_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(solvendo_admin_doc)
    print("✅ Admin Solvendo creado: admin@solvendo.com")
    
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
    
    print("🔵 AMARU MOJICA (Usuario - Proyecto $5,200):")
    print("   Email:    activo2_26@gmail.com")
    print("   Password: Pactum#2026!")
    print("   Acceso:   Ver su proyecto asignado\n")
    
    print("🟣 ALMA IA (Partner Company):")
    print("   Email:    admin@almaia.com")
    print("   Password: AlmaIA#2026!")
    print("   Acceso:   Gestión de empresa partner\n")
    
    print("🟠 INVESTI (Partner Company):")
    print("   Email:    admin@investi.com")
    print("   Password: Investi#2026!")
    print("   Acceso:   Gestión de empresa partner\n")
    
    print("🟢 SOLVENDO (Partner Company):")
    print("   Email:    admin@solvendo.com")
    print("   Password: Solvendo#2026!")
    print("   Acceso:   Gestión de empresa partner\n")
    
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
