"""
Script para agregar client_id a proyectos existentes que no lo tienen
"""
import asyncio
import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = os.environ.get("MONGO_URL") or os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.environ.get("DB_NAME", "pactum_saas")

async def fix_projects():
    """Agregar client_id a proyectos que no lo tienen"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("\n" + "="*60)
    print("🔧 CORRIGIENDO PROYECTOS - AGREGANDO CLIENT_ID")
    print("="*60 + "\n")
    
    # Obtener todos los proyectos
    projects = await db.projects.find({}).to_list(length=100)
    print(f"📊 Total proyectos encontrados: {len(projects)}\n")
    
    fixed_count = 0
    
    for project in projects:
        project_name = project.get("name", "Sin nombre")
        client_name = project.get("client_name", "")
        
        # Si ya tiene client_id, skip
        if project.get("client_id"):
            print(f"✓ {project_name} - Ya tiene client_id")
            continue
        
        # Buscar el cliente por nombre
        if client_name:
            client_doc = await db.clients.find_one({"name": client_name})
            if client_doc:
                # Actualizar proyecto con client_id
                result = await db.projects.update_one(
                    {"id": project["id"]},
                    {"$set": {"client_id": client_doc["id"]}}
                )
                if result.modified_count > 0:
                    print(f"✅ {project_name} - client_id agregado: {client_doc['id']}")
                    fixed_count += 1
                else:
                    print(f"⚠️  {project_name} - No se pudo actualizar")
            else:
                print(f"❌ {project_name} - Cliente '{client_name}' no encontrado")
        else:
            print(f"⚠️  {project_name} - No tiene client_name")
    
    print("\n" + "="*60)
    print(f"✨ CORRECCIÓN COMPLETADA")
    print("="*60)
    print(f"📊 Proyectos corregidos: {fixed_count}/{len(projects)}\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_projects())
