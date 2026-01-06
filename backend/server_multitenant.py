from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
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

# Create the main app
app = FastAPI(title="Multi-Tenant ERP/CRM API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

# Company/Tenant Models
class CompanyCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    admin_password: str
    selected_modules: List[str] = []

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    status: Optional[str] = None

class CompanyResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    status: str
    subscription_status: str
    trial_ends_at: Optional[str] = None
    active_modules: List[str] = []
    created_at: str

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "USER"
    company_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company_id: Optional[str] = None
    company_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Client Models
class ClientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None

# Activity Models
class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # llamada, reunion, tarea, seguimiento, email
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    status: str = "pendiente"
    priority: str = "media"

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

# Module Models
class ModuleAssignment(BaseModel):
    company_id: str
    module_ids: List[str]

# Subscription Models
class SubscriptionUpdate(BaseModel):
    status: str  # trial, active, suspended, cancelled
    plan_type: Optional[str] = None
    trial_days_extension: Optional[int] = None

# ===================== AUTH HELPERS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str, company_id: Optional[str] = None) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "company_id": company_id,
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

def require_super_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado. Se requiere rol SUPER_ADMIN")
    return user

def require_company_admin(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["SUPER_ADMIN", "COMPANY_ADMIN"]:
        raise HTTPException(status_code=403, detail="Acceso denegado. Se requiere rol COMPANY_ADMIN o superior")
    return user

async def get_user_company(user: dict = Depends(get_current_user)):
    if user.get("role") == "SUPER_ADMIN":
        return None
    
    if not user.get("company_id"):
        raise HTTPException(status_code=400, detail="Usuario no pertenece a ninguna empresa")
    
    company = await db.companies.find_one({"id": user["company_id"]}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Check if company is active
    if company.get("status") != "active":
        raise HTTPException(status_code=403, detail="Empresa inactiva o suspendida")
    
    # Check subscription status
    subscription_status = company.get("subscription_status", "trial")
    if subscription_status == "trial":
        trial_ends_at = company.get("trial_ends_at")
        if trial_ends_at:
            trial_end = datetime.fromisoformat(trial_ends_at)
            if datetime.now(timezone.utc) > trial_end:
                raise HTTPException(status_code=403, detail="Trial expirado. Contacte al administrador")
    elif subscription_status not in ["active", "trial"]:
        raise HTTPException(status_code=403, detail="Suscripción inactiva")
    
    return company

# ===================== ACTIVITY LOG =====================

async def log_activity(entity_type: str, entity_id: str, action: str, user: dict, company_id: Optional[str] = None, changes: dict = {}):
    log_entry = {
        "id": str(uuid.uuid4()),
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "user_id": user.get("id", "system"),
        "user_name": user.get("name", "Sistema"),
        "company_id": company_id,
        "changes": changes,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(log_entry)

# ===================== PUBLIC ENDPOINTS =====================

@api_router.post("/public/register-company", response_model=TokenResponse)
async def register_company(data: CompanyCreate):
    """Public endpoint for company registration with trial activation"""
    
    # Check if email already exists
    existing_company = await db.companies.find_one({"email": data.email})
    if existing_company:
        raise HTTPException(status_code=400, detail="Email de empresa ya registrado")
    
    existing_user = await db.users.find_one({"email": data.admin_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email de administrador ya registrado")
    
    # Create company
    company_id = str(uuid.uuid4())
    trial_ends_at = datetime.now(timezone.utc) + timedelta(days=14)
    
    company_doc = {
        "id": company_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "logo_url": None,
        "primary_color": "#3b82f6",
        "secondary_color": "#1e40af",
        "status": "active",
        "subscription_status": "trial",
        "trial_ends_at": trial_ends_at.isoformat(),
        "trial_started_at": datetime.now(timezone.utc).isoformat(),
        "active_modules": data.selected_modules,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.companies.insert_one(company_doc)
    
    # Create admin user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.admin_email,
        "password": hash_password(data.admin_password),
        "name": data.admin_name,
        "role": "COMPANY_ADMIN",
        "company_id": company_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Log activity
    await log_activity("company", company_id, "registered", {"id": "system", "name": "Sistema"}, company_id, {
        "trial_days": 14,
        "modules": data.selected_modules
    })
    
    # Create token
    token = create_token(user_id, data.admin_email, "COMPANY_ADMIN", company_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.admin_email,
            name=data.admin_name,
            role="COMPANY_ADMIN",
            company_id=company_id,
            company_name=data.name
        )
    )

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if user.get("status") != "active":
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    
    company_name = None
    if user.get("company_id"):
        company = await db.companies.find_one({"id": user["company_id"]}, {"_id": 0})
        if company:
            company_name = company.get("name")
    
    token = create_token(user["id"], user["email"], user["role"], user.get("company_id"))
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            company_id=user.get("company_id"),
            company_name=company_name
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    company_name = None
    if user.get("company_id"):
        company = await db.companies.find_one({"id": user["company_id"]}, {"_id": 0})
        if company:
            company_name = company.get("name")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        company_id=user.get("company_id"),
        company_name=company_name
    )

# ===================== SUPER ADMIN - COMPANY MANAGEMENT =====================

@api_router.get("/admin/companies")
async def get_all_companies(user: dict = Depends(require_super_admin)):
    """Get all companies (SUPER_ADMIN only)"""
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    
    # Add user count and client count for each company
    for company in companies:
        user_count = await db.users.count_documents({"company_id": company["id"]})
        client_count = await db.clients.count_documents({"company_id": company["id"]})
        company["user_count"] = user_count
        company["client_count"] = client_count
    
    return companies

@api_router.get("/admin/companies/{company_id}")
async def get_company_details(company_id: str, user: dict = Depends(require_super_admin)):
    """Get company details (SUPER_ADMIN only)"""
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Get users
    users = await db.users.find({"company_id": company_id}, {"_id": 0, "password": 0}).to_list(100)
    company["users"] = users
    
    # Get clients count
    client_count = await db.clients.count_documents({"company_id": company_id})
    company["client_count"] = client_count
    
    # Get activities count
    activity_count = await db.activities.count_documents({"company_id": company_id})
    company["activity_count"] = activity_count
    
    return company

@api_router.put("/admin/companies/{company_id}")
async def update_company(company_id: str, data: CompanyUpdate, user: dict = Depends(require_super_admin)):
    """Update company (SUPER_ADMIN only)"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.companies.update_one({"id": company_id}, {"$set": update_data})
    await log_activity("company", company_id, "updated", user, company_id, update_data)
    
    return {"message": "Empresa actualizada"}

@api_router.post("/admin/companies/{company_id}/modules")
async def assign_modules(company_id: str, module_ids: List[str], user: dict = Depends(require_super_admin)):
    """Assign modules to company (SUPER_ADMIN only)"""
    await db.companies.update_one(
        {"id": company_id},
        {"$set": {"active_modules": module_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    await log_activity("company", company_id, "modules_assigned", user, company_id, {"modules": module_ids})
    
    return {"message": "Módulos asignados"}

@api_router.post("/admin/companies/{company_id}/subscription")
async def update_subscription(company_id: str, data: SubscriptionUpdate, user: dict = Depends(require_super_admin)):
    """Update company subscription (SUPER_ADMIN only)"""
    update_data = {"subscription_status": data.status, "updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.trial_days_extension:
        company = await db.companies.find_one({"id": company_id}, {"_id": 0})
        if company:
            current_trial_end = datetime.fromisoformat(company.get("trial_ends_at", datetime.now(timezone.utc).isoformat()))
            new_trial_end = current_trial_end + timedelta(days=data.trial_days_extension)
            update_data["trial_ends_at"] = new_trial_end.isoformat()
    
    if data.plan_type:
        update_data["plan_type"] = data.plan_type
    
    await db.companies.update_one({"id": company_id}, {"$set": update_data})
    await log_activity("company", company_id, "subscription_updated", user, company_id, update_data)
    
    return {"message": "Suscripción actualizada"}

@api_router.get("/admin/metrics")
async def get_global_metrics(user: dict = Depends(require_super_admin)):
    """Get global system metrics (SUPER_ADMIN only)"""
    total_companies = await db.companies.count_documents({})
    active_companies = await db.companies.count_documents({"status": "active"})
    trial_companies = await db.companies.count_documents({"subscription_status": "trial"})
    paid_companies = await db.companies.count_documents({"subscription_status": "active"})
    total_users = await db.users.count_documents({})
    total_clients = await db.clients.count_documents({})
    total_activities = await db.activities.count_documents({})
    
    # Recent companies
    recent_companies = await db.companies.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "trial_companies": trial_companies,
        "paid_companies": paid_companies,
        "total_users": total_users,
        "total_clients": total_clients,
        "total_activities": total_activities,
        "recent_companies": recent_companies
    }

# ===================== COMPANY - CLIENT MANAGEMENT =====================

@api_router.get("/clients")
async def get_clients(user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Get all clients for the user's company"""
    company_id = user.get("company_id") if user.get("role") != "SUPER_ADMIN" else None
    
    if not company_id and user.get("role") != "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="Usuario no pertenece a ninguna empresa")
    
    query = {"company_id": company_id} if company_id else {}
    clients = await db.clients.find(query, {"_id": 0}).to_list(1000)
    return clients

@api_router.post("/clients")
async def create_client(data: ClientCreate, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Create a new client"""
    if user.get("role") == "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="SUPER_ADMIN debe especificar company_id")
    
    client_id = str(uuid.uuid4())
    client_doc = data.model_dump()
    client_doc["id"] = client_id
    client_doc["company_id"] = user["company_id"]
    client_doc["status"] = "active"
    client_doc["created_by"] = user["id"]
    client_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    client_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.clients.insert_one(client_doc)
    await log_activity("client", client_id, "created", user, user["company_id"], {"name": data.name})
    
    return {"id": client_id, "message": "Cliente creado"}

@api_router.get("/clients/{client_id}")
async def get_client(client_id: str, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Get client details"""
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Verify client belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and client.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    return client

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, data: ClientUpdate, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Update client"""
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Verify client belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and client.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.clients.update_one({"id": client_id}, {"$set": update_data})
    await log_activity("client", client_id, "updated", user, client.get("company_id"), update_data)
    
    return {"message": "Cliente actualizado"}

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Delete client"""
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Verify client belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and client.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    await db.clients.delete_one({"id": client_id})
    await log_activity("client", client_id, "deleted", user, client.get("company_id"), {"name": client.get("name")})
    
    return {"message": "Cliente eliminado"}

# ===================== COMPANY - ACTIVITY MANAGEMENT =====================

@api_router.get("/activities")
async def get_activities(
    user: dict = Depends(get_current_user),
    company: dict = Depends(get_user_company),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get all activities for the user's company with optional filters"""
    company_id = user.get("company_id") if user.get("role") != "SUPER_ADMIN" else None
    
    if not company_id and user.get("role") != "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="Usuario no pertenece a ninguna empresa")
    
    query = {"company_id": company_id} if company_id else {}
    
    if start_date:
        query["start_date"] = {"$gte": start_date}
    if end_date:
        query["start_date"] = {"$lte": end_date}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    
    activities = await db.activities.find(query, {"_id": 0}).to_list(1000)
    
    # Populate client names
    for activity in activities:
        if activity.get("client_id"):
            client = await db.clients.find_one({"id": activity["client_id"]}, {"_id": 0})
            if client:
                activity["client_name"] = client.get("name")
        
        if activity.get("assigned_to"):
            assigned_user = await db.users.find_one({"id": activity["assigned_to"]}, {"_id": 0})
            if assigned_user:
                activity["assigned_to_name"] = assigned_user.get("name")
    
    return activities

@api_router.post("/activities")
async def create_activity(data: ActivityCreate, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Create a new activity"""
    if user.get("role") == "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="SUPER_ADMIN debe especificar company_id")
    
    activity_id = str(uuid.uuid4())
    activity_doc = data.model_dump()
    activity_doc["id"] = activity_id
    activity_doc["company_id"] = user["company_id"]
    activity_doc["created_by"] = user["id"]
    activity_doc["completed"] = False
    activity_doc["created_at"] = datetime.now(timezone.utc).isoformat()
    activity_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.activities.insert_one(activity_doc)
    await log_activity("activity", activity_id, "created", user, user["company_id"], {"title": data.title})
    
    return {"id": activity_id, "message": "Actividad creada"}

@api_router.get("/activities/{activity_id}")
async def get_activity(activity_id: str, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Get activity details"""
    activity = await db.activities.find_one({"id": activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Verify activity belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and activity.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    return activity

@api_router.put("/activities/{activity_id}")
async def update_activity(activity_id: str, data: ActivityUpdate, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Update activity"""
    activity = await db.activities.find_one({"id": activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Verify activity belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and activity.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.activities.update_one({"id": activity_id}, {"$set": update_data})
    await log_activity("activity", activity_id, "updated", user, activity.get("company_id"), update_data)
    
    return {"message": "Actividad actualizada"}

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str, user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Delete activity"""
    activity = await db.activities.find_one({"id": activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    
    # Verify activity belongs to user's company
    if user.get("role") != "SUPER_ADMIN" and activity.get("company_id") != user.get("company_id"):
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    await db.activities.delete_one({"id": activity_id})
    await log_activity("activity", activity_id, "deleted", user, activity.get("company_id"), {"title": activity.get("title")})
    
    return {"message": "Actividad eliminada"}

# ===================== COMPANY - USER MANAGEMENT =====================

@api_router.get("/company/users")
async def get_company_users(user: dict = Depends(require_company_admin), company: dict = Depends(get_user_company)):
    """Get all users in the company"""
    users = await db.users.find({"company_id": user["company_id"]}, {"_id": 0, "password": 0}).to_list(100)
    return users

@api_router.post("/company/users")
async def create_company_user(data: UserCreate, user: dict = Depends(require_company_admin), company: dict = Depends(get_user_company)):
    """Create a new user in the company"""
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "role": data.role if data.role in ["USER", "COMPANY_ADMIN"] else "USER",
        "company_id": user["company_id"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    await log_activity("user", user_id, "created", user, user["company_id"], {"name": data.name})
    
    return {"id": user_id, "message": "Usuario creado"}

# ===================== MODULES =====================

@api_router.get("/modules")
async def get_available_modules():
    """Get all available modules"""
    modules = [
        {"id": "clients", "name": "Gestión de Clientes", "description": "CRUD completo de clientes"},
        {"id": "activities", "name": "Actividades y Tareas", "description": "Gestión de actividades, tareas y seguimientos"},
        {"id": "calendar", "name": "Calendario", "description": "Vista de calendario para actividades"},
        {"id": "pipeline", "name": "Pipeline de Ventas", "description": "Gestión de oportunidades y pipeline"},
        {"id": "projects", "name": "Gestión de Proyectos", "description": "Proyectos, fases y tareas"},
        {"id": "invoicing", "name": "Facturación", "description": "Gestión de facturas y pagos"},
        {"id": "reports", "name": "Reportes", "description": "Reportes y análisis"},
    ]
    return modules

# ===================== DASHBOARD STATS =====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user), company: dict = Depends(get_user_company)):
    """Get dashboard statistics for the company"""
    if user.get("role") == "SUPER_ADMIN":
        return await get_global_metrics(user)
    
    company_id = user["company_id"]
    
    # Client stats
    total_clients = await db.clients.count_documents({"company_id": company_id})
    active_clients = await db.clients.count_documents({"company_id": company_id, "status": "active"})
    
    # Activity stats
    total_activities = await db.activities.count_documents({"company_id": company_id})
    pending_activities = await db.activities.count_documents({"company_id": company_id, "status": "pendiente"})
    completed_activities = await db.activities.count_documents({"company_id": company_id, "completed": True})
    
    # User stats
    total_users = await db.users.count_documents({"company_id": company_id})
    
    # Recent activities
    recent_activities = await db.activities.find(
        {"company_id": company_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Recent clients
    recent_clients = await db.clients.find(
        {"company_id": company_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "total_activities": total_activities,
        "pending_activities": pending_activities,
        "completed_activities": completed_activities,
        "total_users": total_users,
        "recent_activities": recent_activities,
        "recent_clients": recent_clients
    }

# ===================== ACTIVITY LOGS =====================

@api_router.get("/activity-logs")
async def get_activity_logs(
    user: dict = Depends(get_current_user),
    company: dict = Depends(get_user_company),
    entity_type: Optional[str] = Query(None),
    limit: int = Query(100)
):
    """Get activity logs"""
    query = {}
    
    if user.get("role") != "SUPER_ADMIN":
        query["company_id"] = user["company_id"]
    
    if entity_type:
        query["entity_type"] = entity_type
    
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return logs

# ===================== SEED DATA =====================

@api_router.post("/seed/init")
async def seed_initial_data():
    """Initialize database with seed data"""
    
    # Check if super admin already exists
    existing_super_admin = await db.users.find_one({"role": "SUPER_ADMIN"})
    if existing_super_admin:
        return {"message": "Datos iniciales ya existen"}
    
    # Create Super Admin (Amaru Mojica)
    super_admin_id = str(uuid.uuid4())
    super_admin_doc = {
        "id": super_admin_id,
        "email": "amaru@softwarenicaragua.com",
        "password": hash_password("SuperAdmin2026!"),
        "name": "Amaru Mojica",
        "role": "SUPER_ADMIN",
        "company_id": None,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(super_admin_doc)
    
    # Create Software Nicaragua company
    software_nic_id = str(uuid.uuid4())
    software_nic_doc = {
        "id": software_nic_id,
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
    await db.companies.insert_one(software_nic_doc)
    
    # Create admin user for Software Nicaragua
    sn_admin_id = str(uuid.uuid4())
    sn_admin_doc = {
        "id": sn_admin_id,
        "email": "admin@softwarenicaragua.com",
        "password": hash_password("Admin2026!"),
        "name": "Admin Software Nicaragua",
        "role": "COMPANY_ADMIN",
        "company_id": software_nic_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(sn_admin_doc)
    
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
    
    # Create sample clients for demo company
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
    
    # Create sample activities for demo company
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
    
    return {
        "message": "Datos iniciales creados exitosamente",
        "super_admin": {
            "email": "amaru@softwarenicaragua.com",
            "password": "SuperAdmin2026!"
        },
        "software_nicaragua": {
            "email": "admin@softwarenicaragua.com",
            "password": "Admin2026!"
        },
        "demo_company": {
            "email": "admin@demo.com",
            "password": "Demo2026!"
        }
    }

# ===================== CORS & STARTUP =====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": "Multi-Tenant ERP/CRM API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
