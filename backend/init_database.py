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
    
    # Create Pactum company (Cliente Amaru Mojica)
    pactum_company_id = str(uuid.uuid4())
    pactum_company_doc = {
        "id": pactum_company_id,
        "name": "Pactum - Amaru Mojica",
        "email": "contacto@pactum.com",
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
    print("✅ Empresa creada: Pactum - Amaru Mojica")
    
    # Create admin user for Pactum (Amaru Mojica)
    pactum_admin_id = str(uuid.uuid4())
    pactum_admin_doc = {
        "id": pactum_admin_id,
        "email": "admin@pactum.com",
        "password": hash_password("Pactum#2026!"),
        "name": "Amaru Mojica",
        "role": "COMPANY_ADMIN",
        "company_id": pactum_company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(pactum_admin_doc)
    print("✅ Admin Pactum creado: admin@pactum.com (Amaru Mojica)")
    
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
    
    print("🟢 CLIENTE PACTUM (Amaru Mojica):")
    print("   Email:    admin@pactum.com")
    print("   Password: Pactum#2026!")
    print("   Acceso:   Todos los módulos\n")
    
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
