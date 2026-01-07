"""
Script para agregar campos de contrato a proyectos existentes
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent))

from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGODB_URL = os.environ.get("MONGO_URL") or os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.environ.get("DB_NAME", "pactum_saas")

async def fix_contract_fields():
    """Agregar campos de contrato a proyectos que no los tienen"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("\n" + "="*60)
    print("📄 AGREGANDO CAMPOS DE CONTRATO A PROYECTOS")
    print("="*60 + "\n")
    
    # Configuración de contratos por proyecto
    contract_configs = {
        "Alma IA - Plataforma de Inteligencia Artificial": {
            "contract_number": "ALMA-IA-2026-001",
            "payment_terms": "4 Hitos (25% c/u)"
        },
        "Investi - Sistema de Gestión de Inversiones": {
            "contract_number": "INVESTI-2026-001",
            "payment_terms": "3 pagos (40%, 30%, 30%)"
        },
        "Solvendo - Plataforma de Soluciones Empresariales": {
            "contract_number": "SOLVENDO-2026-001",
            "payment_terms": "5 Hitos (20% c/u)"
        },
        "Business & Technology - Sistema de Gestión Empresarial": {
            "contract_number": "BT-2026-001",
            "payment_terms": "50% adelanto, 25% avance 50%, 25% entrega final"
        }
    }
    
    # Obtener todos los proyectos
    projects = await db.projects.find({}).to_list(length=100)
    print(f"📊 Total proyectos encontrados: {len(projects)}\n")
    
    fixed_count = 0
    
    for project in projects:
        project_name = project.get("name", "Sin nombre")
        
        # Si ya tiene contract_number, skip
        if project.get("contract_number"):
            print(f"✓ {project_name} - Ya tiene campos de contrato")
            continue
        
        # Buscar configuración de contrato
        if project_name in contract_configs:
            config = contract_configs[project_name]
            
            # Actualizar proyecto con campos de contrato
            update_fields = {
                "contract_date": project.get("start_date") or datetime.now(timezone.utc).isoformat(),
                "contract_number": config["contract_number"],
                "payment_terms": config["payment_terms"]
            }
            
            result = await db.projects.update_one(
                {"id": project["id"]},
                {"$set": update_fields}
            )
            
            if result.modified_count > 0:
                print(f"✅ {project_name}")
                print(f"   Contrato: {config['contract_number']}")
                print(f"   Términos: {config['payment_terms']}\n")
                fixed_count += 1
            else:
                print(f"⚠️  {project_name} - No se pudo actualizar\n")
        else:
            print(f"⚠️  {project_name} - Sin configuración de contrato\n")
    
    print("="*60)
    print(f"✨ ACTUALIZACIÓN COMPLETADA")
    print("="*60)
    print(f"📊 Proyectos actualizados: {fixed_count}/{len(projects)}\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_contract_fields())
