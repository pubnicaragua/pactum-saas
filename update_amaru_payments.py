import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://pubnicaragua:Pactum2026!@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = os.getenv("DB_NAME", "pactum_saas")

async def update_amaru_payments():
    """Update Amaru project payment dates and progress"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Find Amaru project
    amaru_project = await db.projects.find_one({"name": {"$regex": "Amaru", "$options": "i"}})
    
    if not amaru_project:
        print("❌ Proyecto Amaru no encontrado")
        return
    
    print(f"✅ Proyecto encontrado: {amaru_project['name']}")
    print(f"   ID: {amaru_project['id']}")
    
    # Update project progress to minimum 30%
    all_tasks = await db.tasks.find({"project_id": amaru_project["id"]}).to_list(1000)
    
    if all_tasks:
        completed_tasks = [t for t in all_tasks if t.get("status") == "done"]
        progress = int((len(completed_tasks) / len(all_tasks)) * 100)
        
        # Ensure minimum 30%
        if progress < 30:
            progress = 30
        
        await db.projects.update_one(
            {"id": amaru_project["id"]},
            {"$set": {
                "progress_percentage": progress,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"✅ Progreso actualizado a {progress}%")
    
    # Update payment dates
    payments = await db.payments.find({"project_id": amaru_project["id"]}).to_list(10)
    payments.sort(key=lambda x: x.get("payment_number", 0))
    
    print(f"\n💰 Actualizando fechas de pagos...")
    
    # Fechas específicas solicitadas
    payment_dates = {
        2: "2026-01-17T00:00:00+00:00",  # 17/1/2026
        3: "2026-01-25T00:00:00+00:00",  # 25/1/2026
        4: "2026-02-01T00:00:00+00:00"   # 1/2/2026
    }
    
    for payment in payments:
        payment_num = payment.get("payment_number")
        if payment_num in payment_dates:
            new_date = payment_dates[payment_num]
            await db.payments.update_one(
                {"id": payment["id"]},
                {"$set": {
                    "due_date": new_date,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            print(f"   ✅ Pago {payment_num}: {payment.get('description')} -> {new_date[:10]}")
    
    print("\n✅ Todas las actualizaciones completadas")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_amaru_payments())
