from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import aiofiles
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'pactum-secret-key-2026-demo')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Mini-Pactum API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Upload directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "Cliente"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    client_name: str
    start_date: str
    end_date: str
    total_usd: float
    total_cordobas: float
    exchange_rate: float
    status: str = "En progreso"

class PhaseBase(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None
    week: int
    start_date: str
    end_date: str
    deliverables: List[str] = []
    approval_criteria: str
    status: str = "Pendiente"
    is_approved: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    comments: List[dict] = []

class PaymentBase(BaseModel):
    project_id: str
    phase_id: Optional[str] = None
    description: str
    percentage: int
    amount_cordobas: float
    amount_usd: float
    due_date: str
    status: str = "Programado"
    paid_at: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None

class TaskBase(BaseModel):
    project_id: str
    phase_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    week: int
    responsible: str = "Admin"
    priority: str = "Media"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str = "Backlog"
    checklist: List[dict] = []
    comments: List[dict] = []
    dependencies: List[str] = []

class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None

class ContactBase(BaseModel):
    client_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None

class OpportunityBase(BaseModel):
    client_id: str
    name: str
    value: float
    probability: int
    stage: str = "Prospecto"
    expected_close_date: Optional[str] = None
    notes: Optional[str] = None

class ActivityBase(BaseModel):
    client_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    type: str  # llamada, tarea, recordatorio
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False

class ContractUpload(BaseModel):
    project_id: str
    filename: str
    extracted_text: Optional[str] = None
    file_path: str

class ActivityLogEntry(BaseModel):
    entity_type: str  # task, phase, payment, approval
    entity_id: str
    action: str  # created, updated, status_changed, approved
    user_id: str
    user_name: str
    changes: dict = {}
    timestamp: str

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ===================== ACTIVITY LOG =====================

async def log_activity(entity_type: str, entity_id: str, action: str, user: dict, changes: dict = {}):
    log_entry = {
        "id": str(uuid.uuid4()),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "user_id": user.get("id", "system"),
        "user_name": user.get("name", "Sistema"),
        "changes": changes,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(log_entry)

async def cleanup_old_logs():
    """Remove activity logs older than 30 days"""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    await db.activity_logs.delete_many({"timestamp": {"$lt": cutoff.isoformat()}})

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, user_data.role)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, role=user_data.role)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])

# ===================== PROJECT ENDPOINTS =====================

@api_router.get("/projects")
async def get_projects(user: dict = Depends(get_current_user)):
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, data: dict, user: dict = Depends(get_current_user)):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id}, {"$set": data})
    await log_activity("project", project_id, "updated", user, data)
    return {"message": "Proyecto actualizado"}

# ===================== PHASE ENDPOINTS =====================

@api_router.get("/phases")
async def get_phases(project_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"project_id": project_id} if project_id else {}
    phases = await db.phases.find(query, {"_id": 0}).to_list(100)
    return phases

@api_router.get("/phases/{phase_id}")
async def get_phase(phase_id: str, user: dict = Depends(get_current_user)):
    phase = await db.phases.find_one({"id": phase_id}, {"_id": 0})
    if not phase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    return phase

@api_router.put("/phases/{phase_id}")
async def update_phase(phase_id: str, data: dict, user: dict = Depends(get_current_user)):
    old_phase = await db.phases.find_one({"id": phase_id}, {"_id": 0})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.phases.update_one({"id": phase_id}, {"$set": data})
    await log_activity("phase", phase_id, "updated", user, {"old": old_phase.get("status"), "new": data.get("status", old_phase.get("status"))})
    return {"message": "Fase actualizada"}

@api_router.post("/phases/{phase_id}/approve")
async def approve_phase(phase_id: str, user: dict = Depends(get_current_user)):
    await db.phases.update_one({"id": phase_id}, {"$set": {
        "is_approved": True,
        "approved_by": user["id"],
        "approved_at": datetime.now(timezone.utc).isoformat(),
        "status": "Completada"
    }})
    await log_activity("phase", phase_id, "approved", user, {"approved_by": user["name"]})
    return {"message": "Fase aprobada"}

@api_router.post("/phases/{phase_id}/comments")
async def add_phase_comment(phase_id: str, data: dict, user: dict = Depends(get_current_user)):
    comment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "text": data.get("text", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.phases.update_one({"id": phase_id}, {"$push": {"comments": comment}})
    await log_activity("phase", phase_id, "comment_added", user, {"comment": data.get("text", "")[:100]})
    return comment

# ===================== PAYMENT ENDPOINTS =====================

@api_router.get("/payments")
async def get_payments(project_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"project_id": project_id} if project_id else {}
    payments = await db.payments.find(query, {"_id": 0}).to_list(100)
    return payments

@api_router.put("/payments/{payment_id}")
async def update_payment(payment_id: str, data: dict, user: dict = Depends(get_current_user)):
    old_payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if data.get("status") == "Pagado" and old_payment.get("status") != "Pagado":
        data["paid_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.payments.update_one({"id": payment_id}, {"$set": data})
    await log_activity("payment", payment_id, "status_changed", user, {
        "old_status": old_payment.get("status"),
        "new_status": data.get("status", old_payment.get("status"))
    })
    return {"message": "Pago actualizado"}

# ===================== TASK ENDPOINTS =====================

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

@api_router.post("/tasks")
async def create_task(data: TaskBase, user: dict = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    task_doc = data.model_dump()
    task_doc["id"] = task_id
    task_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    task_doc["created_by"] = user["id"]
    await db.tasks.insert_one(task_doc)
    await log_activity("task", task_id, "created", user, {"title": data.title})
    return {"id": task_id, "message": "Tarea creada"}

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: dict, user: dict = Depends(get_current_user)):
    old_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.tasks.update_one({"id": task_id}, {"$set": data})
    
    changes = {}
    if "status" in data and old_task and data["status"] != old_task.get("status"):
        changes["old_status"] = old_task.get("status")
        changes["new_status"] = data["status"]
    
    await log_activity("task", task_id, "updated", user, changes)
    return {"message": "Tarea actualizada"}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Solo Admin puede eliminar tareas")
    await db.tasks.delete_one({"id": task_id})
    await log_activity("task", task_id, "deleted", user, {})
    return {"message": "Tarea eliminada"}

@api_router.post("/tasks/{task_id}/comments")
async def add_task_comment(task_id: str, data: dict, user: dict = Depends(get_current_user)):
    comment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["name"],
        "text": data.get("text", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.update_one({"id": task_id}, {"$push": {"comments": comment}})
    return comment

# ===================== CRM ENDPOINTS =====================

@api_router.get("/clients")
async def get_clients(user: dict = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(500)
    return clients

@api_router.post("/clients")
async def create_client(data: ClientBase, user: dict = Depends(get_current_user)):
    client_id = str(uuid.uuid4())
    client_doc = data.model_dump()
    client_doc["id"] = client_id
    client_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.clients.insert_one(client_doc)
    await log_activity("client", client_id, "created", user, {"name": data.name})
    return {"id": client_id, "message": "Cliente creado"}

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, data: dict, user: dict = Depends(get_current_user)):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.clients.update_one({"id": client_id}, {"$set": data})
    return {"message": "Cliente actualizado"}

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user)):
    await db.clients.delete_one({"id": client_id})
    await db.contacts.delete_many({"client_id": client_id})
    return {"message": "Cliente eliminado"}

# Contacts
@api_router.get("/contacts")
async def get_contacts(client_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"client_id": client_id} if client_id else {}
    contacts = await db.contacts.find(query, {"_id": 0}).to_list(500)
    return contacts

@api_router.post("/contacts")
async def create_contact(data: ContactBase, user: dict = Depends(get_current_user)):
    contact_id = str(uuid.uuid4())
    contact_doc = data.model_dump()
    contact_doc["id"] = contact_id
    contact_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(contact_doc)
    return {"id": contact_id, "message": "Contacto creado"}

@api_router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, data: dict, user: dict = Depends(get_current_user)):
    await db.contacts.update_one({"id": contact_id}, {"$set": data})
    return {"message": "Contacto actualizado"}

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, user: dict = Depends(get_current_user)):
    await db.contacts.delete_one({"id": contact_id})
    return {"message": "Contacto eliminado"}

# Opportunities
@api_router.get("/opportunities")
async def get_opportunities(user: dict = Depends(get_current_user)):
    opps = await db.opportunities.find({}, {"_id": 0}).to_list(500)
    return opps

@api_router.post("/opportunities")
async def create_opportunity(data: OpportunityBase, user: dict = Depends(get_current_user)):
    opp_id = str(uuid.uuid4())
    opp_doc = data.model_dump()
    opp_doc["id"] = opp_id
    opp_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.opportunities.insert_one(opp_doc)
    await log_activity("opportunity", opp_id, "created", user, {"name": data.name, "value": data.value})
    return {"id": opp_id, "message": "Oportunidad creada"}

@api_router.put("/opportunities/{opp_id}")
async def update_opportunity(opp_id: str, data: dict, user: dict = Depends(get_current_user)):
    old_opp = await db.opportunities.find_one({"id": opp_id}, {"_id": 0})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.opportunities.update_one({"id": opp_id}, {"$set": data})
    
    if "stage" in data and old_opp and data["stage"] != old_opp.get("stage"):
        await log_activity("opportunity", opp_id, "stage_changed", user, {
            "old_stage": old_opp.get("stage"),
            "new_stage": data["stage"]
        })
    return {"message": "Oportunidad actualizada"}

@api_router.delete("/opportunities/{opp_id}")
async def delete_opportunity(opp_id: str, user: dict = Depends(get_current_user)):
    await db.opportunities.delete_one({"id": opp_id})
    return {"message": "Oportunidad eliminada"}

# Activities
@api_router.get("/activities")
async def get_activities(user: dict = Depends(get_current_user)):
    activities = await db.activities.find({}, {"_id": 0}).to_list(500)
    return activities

@api_router.post("/activities")
async def create_activity(data: ActivityBase, user: dict = Depends(get_current_user)):
    activity_id = str(uuid.uuid4())
    activity_doc = data.model_dump()
    activity_doc["id"] = activity_id
    activity_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    activity_doc["created_by"] = user["id"]
    await db.activities.insert_one(activity_doc)
    return {"id": activity_id, "message": "Actividad creada"}

@api_router.put("/activities/{activity_id}")
async def update_activity(activity_id: str, data: dict, user: dict = Depends(get_current_user)):
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.activities.update_one({"id": activity_id}, {"$set": data})
    return {"message": "Actividad actualizada"}

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, user: dict = Depends(get_current_user)):
    await db.activities.delete_one({"id": activity_id})
    return {"message": "Actividad eliminada"}

# ===================== ACTIVITY LOG ENDPOINTS =====================

@api_router.get("/activity-logs")
async def get_activity_logs(entity_type: Optional[str] = None, limit: int = 100, user: dict = Depends(get_current_user)):
    query = {"entity_type": entity_type} if entity_type else {}
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return logs

# ===================== CONTRACT/PDF ENDPOINTS =====================

@api_router.post("/contracts/upload")
async def upload_contract(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Extract text from PDF
    extracted_text = ""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(str(file_path))
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
    
    contract_doc = {
        "id": file_id,
        "project_id": project_id,
        "filename": file.filename,
        "file_path": str(file_path),
        "extracted_text": extracted_text,
        "uploaded_by": user["id"],
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contracts.insert_one(contract_doc)
    await log_activity("contract", file_id, "uploaded", user, {"filename": file.filename})
    
    return {"id": file_id, "filename": file.filename, "message": "Contrato subido exitosamente"}

@api_router.get("/contracts")
async def get_contracts(project_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {"project_id": project_id} if project_id else {}
    contracts = await db.contracts.find(query, {"_id": 0, "extracted_text": 0}).to_list(100)
    return contracts

@api_router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str, user: dict = Depends(get_current_user)):
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@api_router.post("/contracts/{contract_id}/analyze")
async def analyze_contract(contract_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Analyze contract using AI to check compliance"""
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="API key no configurada")
    
    question = data.get("question", "Resume los puntos principales del contrato")
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"contract-{contract_id}",
            system_message="Eres un asistente legal que analiza contratos en español. Responde de forma clara y estructurada."
        ).with_model("gemini", "gemini-2.5-flash")
        
        file_content = FileContentWithMimeType(
            file_path=contract["file_path"],
            mime_type="application/pdf"
        )
        
        user_message = UserMessage(
            text=question,
            file_contents=[file_content]
        )
        
        import asyncio
        response = asyncio.get_event_loop().run_until_complete(chat.send_message(user_message))
        
        return {"analysis": response, "question": question}
    except Exception as e:
        logger.error(f"Error analyzing contract: {e}")
        # Fallback to text-based analysis
        return {
            "analysis": f"Texto extraído del contrato ({len(contract.get('extracted_text', ''))} caracteres). Para un análisis detallado, revise el documento completo.",
            "question": question,
            "extracted_preview": contract.get("extracted_text", "")[:2000]
        }

# ===================== ADMIN ENDPOINTS =====================

@api_router.get("/users")
async def get_users(user: dict = Depends(get_current_user)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(100)
    return users

@api_router.post("/seed/reset")
async def reset_demo_data(user: dict = Depends(get_current_user)):
    """Reset all demo data - Admin only"""
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Solo Admin puede resetear datos")
    
    # Clear all collections except users
    await db.projects.delete_many({})
    await db.phases.delete_many({})
    await db.payments.delete_many({})
    await db.tasks.delete_many({})
    await db.clients.delete_many({})
    await db.contacts.delete_many({})
    await db.opportunities.delete_many({})
    await db.activities.delete_many({})
    await db.contracts.delete_many({})
    await db.activity_logs.delete_many({})
    
    # Re-seed
    await seed_demo_data()
    
    return {"message": "Datos reseteados exitosamente"}

@api_router.get("/export")
async def export_data(user: dict = Depends(get_current_user)):
    """Export all project data as JSON"""
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Solo Admin puede exportar")
    
    data = {
        "projects": await db.projects.find({}, {"_id": 0}).to_list(100),
        "phases": await db.phases.find({}, {"_id": 0}).to_list(100),
        "payments": await db.payments.find({}, {"_id": 0}).to_list(100),
        "tasks": await db.tasks.find({}, {"_id": 0}).to_list(500),
        "clients": await db.clients.find({}, {"_id": 0}).to_list(500),
        "opportunities": await db.opportunities.find({}, {"_id": 0}).to_list(500),
        "activities": await db.activities.find({}, {"_id": 0}).to_list(500),
        "exported_at": datetime.now(timezone.utc).isoformat()
    }
    return data

# ===================== DASHBOARD STATS =====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    # Project stats
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    
    # Phase stats
    phases = await db.phases.find({}, {"_id": 0}).to_list(100)
    phases_completed = len([p for p in phases if p.get("status") == "Completada"])
    phases_pending = len([p for p in phases if p.get("status") == "Pendiente"])
    phases_in_progress = len([p for p in phases if p.get("status") == "En progreso"])
    
    # Payment stats
    payments = await db.payments.find({}, {"_id": 0}).to_list(100)
    payments_paid = sum(p.get("amount_cordobas", 0) for p in payments if p.get("status") == "Pagado")
    payments_pending = sum(p.get("amount_cordobas", 0) for p in payments if p.get("status") != "Pagado")
    
    # Check delayed payments (48h rule)
    delayed_payments = []
    now = datetime.now(timezone.utc)
    for p in payments:
        if p.get("status") == "Programado":
            due = datetime.fromisoformat(p["due_date"].replace("Z", "+00:00")) if "T" in p["due_date"] else datetime.strptime(p["due_date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if now > due + timedelta(hours=48):
                delayed_payments.append(p)
    
    # Task stats
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(500)
    task_stats = {
        "Backlog": len([t for t in tasks if t.get("status") == "Backlog"]),
        "En progreso": len([t for t in tasks if t.get("status") == "En progreso"]),
        "En revisión": len([t for t in tasks if t.get("status") == "En revisión"]),
        "Bloqueado": len([t for t in tasks if t.get("status") == "Bloqueado"]),
        "Hecho": len([t for t in tasks if t.get("status") == "Hecho"])
    }
    
    # CRM stats
    clients = await db.clients.count_documents({})
    opportunities = await db.opportunities.find({}, {"_id": 0}).to_list(500)
    opp_value = sum(o.get("value", 0) for o in opportunities)
    activities_pending = await db.activities.count_documents({"completed": False})
    
    return {
        "projects": {
            "total": len(projects),
            "active": len([p for p in projects if p.get("status") == "En progreso"])
        },
        "phases": {
            "total": len(phases),
            "completed": phases_completed,
            "pending": phases_pending,
            "in_progress": phases_in_progress
        },
        "payments": {
            "total_paid": payments_paid,
            "total_pending": payments_pending,
            "delayed_count": len(delayed_payments),
            "delayed_payments": delayed_payments
        },
        "tasks": task_stats,
        "crm": {
            "clients": clients,
            "opportunities": len(opportunities),
            "opportunity_value": opp_value,
            "pending_activities": activities_pending
        }
    }

# ===================== SEED DATA =====================

async def seed_demo_data():
    """Seed the database with demo data"""
    
    # Check if already seeded
    existing_project = await db.projects.find_one({"id": "project-crm-amaru"})
    if existing_project:
        return
    
    # Seed Users
    users_data = [
        {
            "id": "user-admin-001",
            "email": "admin@pactum.com",
            "password": hash_password("Pactum#2026!"),
            "name": "Admin Pactum",
            "role": "Admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "user-client-001",
            "email": "activo2_26@gmail.com",
            "password": hash_password("Pactum#2026!"),
            "name": "Amaru José Mojica Leiva",
            "role": "Cliente",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for user in users_data:
        existing = await db.users.find_one({"email": user["email"]})
        if not existing:
            await db.users.insert_one(user)
    
    # Seed Project
    project = {
        "id": "project-crm-amaru",
        "name": "CRM Business and Technology (Amaru Mojica)",
        "description": "Desarrollo de CRM personalizado para gestión de clientes, pipeline de ventas y actividades comerciales.",
        "client_name": "Amaru José Mojica Leiva / Business and Technology",
        "start_date": "2026-01-05",
        "end_date": "2026-01-30",
        "total_usd": 5200,
        "total_cordobas": 190424,
        "exchange_rate": 36.62,
        "status": "En progreso",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project)
    
    # Seed Phases
    phases_data = [
        {
            "id": "phase-1",
            "project_id": "project-crm-amaru",
            "name": "Fase 1: Descubrimiento + Diseño UI/UX",
            "description": "Levantamiento de requerimientos y diseño en Figma",
            "week": 1,
            "start_date": "2026-01-05",
            "end_date": "2026-01-09",
            "deliverables": [
                "Documento alcance MVP + exclusiones",
                "Flujos + pantallas principales (Figma)",
                "Componentes UI base (Figma)",
                "2 rondas de cambios incluidas"
            ],
            "approval_criteria": "Figma aprobado + comentario del Cliente",
            "status": "Pendiente",
            "is_approved": False,
            "comments": []
        },
        {
            "id": "phase-2",
            "project_id": "project-crm-amaru",
            "name": "Fase 2: Backend + DB + Seguridad",
            "description": "Desarrollo del backend, modelo de datos y seguridad multi-empresa",
            "week": 2,
            "start_date": "2026-01-12",
            "end_date": "2026-01-16",
            "deliverables": [
                "Modelo de datos CRM completo",
                "Segregación por empresa (multi-tenant)",
                "Endpoints CRUD internos",
                "Observabilidad básica (health + logs)"
            ],
            "approval_criteria": "Checklist completado + demo de endpoints",
            "status": "Pendiente",
            "is_approved": False,
            "comments": []
        },
        {
            "id": "phase-3",
            "project_id": "project-crm-amaru",
            "name": "Fase 3: Frontend + Integración + QA + Go-Live",
            "description": "Desarrollo frontend, integración completa, QA y despliegue",
            "week": 3,
            "start_date": "2026-01-19",
            "end_date": "2026-01-30",
            "deliverables": [
                "UI operativa (CRUD completo)",
                "Integración total con DB",
                "QA básico + regresión",
                "Go-Live checklist (DNS/SSL/Deploy)"
            ],
            "approval_criteria": "Go-Live / Entrega final + acta simple",
            "status": "Pendiente",
            "is_approved": False,
            "comments": []
        }
    ]
    
    for phase in phases_data:
        await db.phases.insert_one(phase)
    
    # Seed Payments
    payments_data = [
        {
            "id": "payment-1",
            "project_id": "project-crm-amaru",
            "phase_id": None,
            "description": "Pago 1 - 0.5% Firma de contrato",
            "percentage": 0.5,
            "amount_cordobas": 952.12,
            "amount_usd": 26,
            "due_date": "2026-01-05",
            "status": "Programado",
            "reference": None,
            "notes": "Pago inicial por firma de contrato"
        },
        {
            "id": "payment-2",
            "project_id": "project-crm-amaru",
            "phase_id": "phase-1",
            "description": "Pago 2 - 33.17% Aprobación Fase 1",
            "percentage": 33.17,
            "amount_cordobas": 63157.63,
            "amount_usd": 1724.67,
            "due_date": "2026-01-09",
            "status": "Programado",
            "reference": None,
            "notes": None
        },
        {
            "id": "payment-3",
            "project_id": "project-crm-amaru",
            "phase_id": "phase-2",
            "description": "Pago 3 - 33.17% Aprobación Fase 2",
            "percentage": 33.17,
            "amount_cordobas": 63157.63,
            "amount_usd": 1724.67,
            "due_date": "2026-01-16",
            "status": "Programado",
            "reference": None,
            "notes": None
        },
        {
            "id": "payment-4",
            "project_id": "project-crm-amaru",
            "phase_id": "phase-3",
            "description": "Pago 4 - 33.16% Aprobación Fase 3 / Go-Live",
            "percentage": 33.16,
            "amount_cordobas": 63156.62,
            "amount_usd": 1724.66,
            "due_date": "2026-01-30",
            "status": "Programado",
            "reference": None,
            "notes": None
        }
    ]
    
    for payment in payments_data:
        await db.payments.insert_one(payment)
    
    # Seed Tasks - Semana 1
    week1_tasks = [
        {"title": "Kickoff meeting con cliente", "description": "Reunión inicial para alinear expectativas y cronograma", "priority": "Alta", "responsible": "Admin"},
        {"title": "Levantamiento de requerimientos", "description": "Documentar todos los requerimientos funcionales del CRM", "priority": "Alta", "responsible": "Admin"},
        {"title": "Mapa de módulos CRM", "description": "Definir estructura de módulos: Clientes, Pipeline, Actividades, etc.", "priority": "Alta", "responsible": "Admin"},
        {"title": "Definición de flujos principales", "description": "Crear diagramas de flujo para procesos clave", "priority": "Media", "responsible": "Admin"},
        {"title": "Diseño UI Dashboard", "description": "Mockup del dashboard principal en Figma", "priority": "Alta", "responsible": "Admin"},
        {"title": "Diseño UI Módulo Clientes", "description": "Pantallas CRUD de clientes y contactos", "priority": "Alta", "responsible": "Admin"},
        {"title": "Diseño UI Módulo Pipeline", "description": "Vista Kanban de oportunidades", "priority": "Alta", "responsible": "Admin"},
        {"title": "Componentes UI base", "description": "Botones, inputs, cards, tablas en Figma", "priority": "Media", "responsible": "Admin"},
        {"title": "Revisión 1 con cliente", "description": "Primera ronda de feedback sobre diseños", "priority": "Alta", "responsible": "Cliente"},
        {"title": "Ajustes post-revisión 1", "description": "Implementar cambios solicitados", "priority": "Media", "responsible": "Admin"},
        {"title": "Revisión 2 con cliente", "description": "Segunda ronda de feedback", "priority": "Alta", "responsible": "Cliente"},
        {"title": "Documento de alcance MVP", "description": "Formalizar alcance y exclusiones", "priority": "Alta", "responsible": "Admin"},
        {"title": "Aprobación Figma", "description": "Obtener aprobación final de diseños", "priority": "Alta", "responsible": "Cliente"},
    ]
    
    # Semana 2
    week2_tasks = [
        {"title": "Modelo de datos - Clientes", "description": "Esquema MongoDB para clientes y contactos", "priority": "Alta", "responsible": "Admin"},
        {"title": "Modelo de datos - Oportunidades", "description": "Esquema para pipeline de ventas", "priority": "Alta", "responsible": "Admin"},
        {"title": "Modelo de datos - Actividades", "description": "Esquema para llamadas, tareas, recordatorios", "priority": "Alta", "responsible": "Admin"},
        {"title": "Sistema de autenticación", "description": "Login, JWT, roles Admin/Cliente", "priority": "Alta", "responsible": "Admin"},
        {"title": "Multi-tenant conceptual", "description": "Segregación de datos por empresa", "priority": "Alta", "responsible": "Admin"},
        {"title": "CRUD Clientes API", "description": "Endpoints REST para gestión de clientes", "priority": "Alta", "responsible": "Admin"},
        {"title": "CRUD Oportunidades API", "description": "Endpoints para pipeline", "priority": "Alta", "responsible": "Admin"},
        {"title": "CRUD Actividades API", "description": "Endpoints para actividades CRM", "priority": "Alta", "responsible": "Admin"},
        {"title": "Políticas de acceso", "description": "Middleware de autorización por rol", "priority": "Media", "responsible": "Admin"},
        {"title": "Seed data inicial", "description": "Datos de prueba para desarrollo", "priority": "Media", "responsible": "Admin"},
        {"title": "Health checks", "description": "Endpoints de monitoreo /health", "priority": "Baja", "responsible": "Admin"},
        {"title": "Logging básico", "description": "Configurar logs estructurados", "priority": "Baja", "responsible": "Admin"},
        {"title": "Demo endpoints a cliente", "description": "Demostración de APIs funcionando", "priority": "Alta", "responsible": "Admin"},
    ]
    
    # Semana 3
    week3_tasks = [
        {"title": "Pantalla Login", "description": "Implementar UI de autenticación", "priority": "Alta", "responsible": "Admin"},
        {"title": "Dashboard principal", "description": "Vista con métricas y resumen", "priority": "Alta", "responsible": "Admin"},
        {"title": "Módulo Clientes UI", "description": "Lista, crear, editar, eliminar clientes", "priority": "Alta", "responsible": "Admin"},
        {"title": "Módulo Contactos UI", "description": "Gestión de contactos por cliente", "priority": "Alta", "responsible": "Admin"},
        {"title": "Módulo Pipeline UI", "description": "Vista Kanban de oportunidades", "priority": "Alta", "responsible": "Admin"},
        {"title": "Módulo Actividades UI", "description": "Lista y formularios de actividades", "priority": "Alta", "responsible": "Admin"},
        {"title": "Integración APIs Clientes", "description": "Conectar frontend con backend", "priority": "Alta", "responsible": "Admin"},
        {"title": "Integración APIs Pipeline", "description": "Drag & drop funcional", "priority": "Alta", "responsible": "Admin"},
        {"title": "Integración APIs Actividades", "description": "CRUD completo conectado", "priority": "Alta", "responsible": "Admin"},
        {"title": "Admin Central UI", "description": "Gestión de empresas y usuarios", "priority": "Media", "responsible": "Admin"},
        {"title": "Filtros y búsqueda", "description": "Implementar filtros en listas", "priority": "Media", "responsible": "Admin"},
        {"title": "Responsive design", "description": "Adaptar a móviles y tablets", "priority": "Media", "responsible": "Admin"},
    ]
    
    # Semana 4
    week4_tasks = [
        {"title": "QA - Flujo de clientes", "description": "Testing completo módulo clientes", "priority": "Alta", "responsible": "Admin"},
        {"title": "QA - Flujo de pipeline", "description": "Testing drag & drop y estados", "priority": "Alta", "responsible": "Admin"},
        {"title": "QA - Flujo de actividades", "description": "Testing CRUD actividades", "priority": "Alta", "responsible": "Admin"},
        {"title": "Fixes críticos", "description": "Corregir bugs encontrados en QA", "priority": "Alta", "responsible": "Admin"},
        {"title": "Configurar dominio .com", "description": "Apuntar DNS al servidor", "priority": "Alta", "responsible": "Cliente"},
        {"title": "Configurar SSL/HTTPS", "description": "Certificado Let's Encrypt", "priority": "Alta", "responsible": "Cliente"},
        {"title": "Deploy a producción", "description": "Subir aplicación al servidor", "priority": "Alta", "responsible": "Admin"},
        {"title": "Variables de entorno prod", "description": "Configurar .env producción", "priority": "Alta", "responsible": "Admin"},
        {"title": "Backup inicial DB", "description": "Primer respaldo de base de datos", "priority": "Media", "responsible": "Admin"},
        {"title": "Capacitación usuario admin", "description": "Entrenamiento en uso del CRM", "priority": "Alta", "responsible": "Admin"},
        {"title": "Capacitación usuario cliente", "description": "Entrenamiento básico", "priority": "Alta", "responsible": "Admin"},
        {"title": "Documentación de uso", "description": "Manual básico del sistema", "priority": "Media", "responsible": "Admin"},
        {"title": "Acta de entrega final", "description": "Documento formal de cierre", "priority": "Alta", "responsible": "Cliente"},
        {"title": "Verificar Go-Live", "description": "Checklist final de producción", "priority": "Alta", "responsible": "Admin"},
    ]
    
    task_id_counter = 1
    for week, tasks in [(1, week1_tasks), (2, week2_tasks), (3, week3_tasks), (4, week4_tasks)]:
        for task in tasks:
            task_doc = {
                "id": f"task-{task_id_counter:03d}",
                "project_id": "project-crm-amaru",
                "phase_id": f"phase-{min(week, 3)}",
                "title": task["title"],
                "description": task["description"],
                "week": week,
                "responsible": task["responsible"],
                "priority": task["priority"],
                "start_date": None,
                "end_date": None,
                "status": "Backlog",
                "checklist": [],
                "comments": [],
                "dependencies": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.tasks.insert_one(task_doc)
            task_id_counter += 1
    
    # Seed CRM Demo Data
    clients_data = [
        {"id": "client-001", "name": "Empresa ABC", "email": "contacto@empresaabc.com", "phone": "+505 8888-1111", "company": "ABC Corp", "tags": ["VIP", "Tecnología"]},
        {"id": "client-002", "name": "Comercial XYZ", "email": "ventas@xyz.com", "phone": "+505 8888-2222", "company": "XYZ S.A.", "tags": ["Retail"]},
        {"id": "client-003", "name": "Servicios Delta", "email": "info@delta.com", "phone": "+505 8888-3333", "company": "Delta Services", "tags": ["Servicios"]},
        {"id": "client-004", "name": "Industrias Omega", "email": "compras@omega.com", "phone": "+505 8888-4444", "company": "Omega Industries", "tags": ["Manufactura", "Grande"]},
        {"id": "client-005", "name": "Tech Solutions", "email": "hello@techsol.com", "phone": "+505 8888-5555", "company": "Tech Solutions LLC", "tags": ["Tecnología", "Startup"]},
    ]
    
    for client in clients_data:
        client["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.clients.insert_one(client)
    
    # Seed Opportunities
    opportunities_data = [
        {"id": "opp-001", "client_id": "client-001", "name": "Implementación ERP", "value": 15000, "probability": 70, "stage": "Propuesta", "expected_close_date": "2026-02-15"},
        {"id": "opp-002", "client_id": "client-002", "name": "Sistema POS", "value": 8000, "probability": 50, "stage": "Negociación", "expected_close_date": "2026-02-28"},
        {"id": "opp-003", "client_id": "client-003", "name": "App Móvil", "value": 12000, "probability": 30, "stage": "Prospecto", "expected_close_date": "2026-03-15"},
        {"id": "opp-004", "client_id": "client-004", "name": "Automatización", "value": 25000, "probability": 80, "stage": "Cierre", "expected_close_date": "2026-01-20"},
        {"id": "opp-005", "client_id": "client-005", "name": "Consultoría Cloud", "value": 5000, "probability": 90, "stage": "Ganada", "expected_close_date": "2026-01-10"},
    ]
    
    for opp in opportunities_data:
        opp["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.opportunities.insert_one(opp)
    
    # Seed Activities
    activities_data = [
        {"id": "act-001", "client_id": "client-001", "type": "llamada", "title": "Llamada de seguimiento ERP", "due_date": "2026-01-08", "completed": False},
        {"id": "act-002", "client_id": "client-002", "type": "tarea", "title": "Enviar cotización POS", "due_date": "2026-01-07", "completed": False},
        {"id": "act-003", "client_id": "client-003", "type": "recordatorio", "title": "Revisar propuesta App", "due_date": "2026-01-10", "completed": False},
        {"id": "act-004", "client_id": "client-004", "opportunity_id": "opp-004", "type": "llamada", "title": "Cerrar negociación", "due_date": "2026-01-06", "completed": False},
    ]
    
    for act in activities_data:
        act["created_at"] = datetime.now(timezone.utc).isoformat()
        act["created_by"] = "user-admin-001"
        await db.activities.insert_one(act)
    
    logger.info("Demo data seeded successfully")

# ===================== STARTUP =====================

@app.on_event("startup")
async def startup_event():
    await seed_demo_data()
    # Schedule cleanup of old logs
    await cleanup_old_logs()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/")
async def root():
    return {"message": "Mini-Pactum API v1.0", "status": "running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
