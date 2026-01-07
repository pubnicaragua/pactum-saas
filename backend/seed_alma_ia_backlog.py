"""
Script para agregar usuarios y tareas del backlog de Alma IA
Ejecutar después de init_database.py
"""
import asyncio
import sys
import os
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# MongoDB connection - usar variable de entorno de Render
MONGODB_URL = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL", "mongodb+srv://pubnicaragua:Pactum2026@cluster0.mongodb.net/?retryWrites=true&w=majority")
DATABASE_NAME = "pactum_saas"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_alma_ia_backlog():
    """Agregar usuarios y tareas para proyecto Alma IA"""
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("\n" + "="*60)
    print("🎯 CONFIGURANDO BACKLOG ALMA IA")
    print("="*60 + "\n")
    
    # Buscar empresa Pactum (Software Nicaragua)
    pactum_company = await db.companies.find_one({"name": "Software Nicaragua"})
    if not pactum_company:
        print("❌ Error: No se encontró la empresa Software Nicaragua")
        return
    
    pactum_company_id = pactum_company["id"]
    
    # Buscar cliente Alma IA
    alma_client = await db.clients.find_one({"name": "Alma IA"})
    if not alma_client:
        print("❌ Error: No se encontró el cliente Alma IA")
        return
    
    alma_client_id = alma_client["id"]
    
    # Buscar proyecto de Alma IA
    alma_project = await db.projects.find_one({"client_id": alma_client_id})
    if not alma_project:
        print("❌ Error: No se encontró el proyecto de Alma IA")
        return
    
    alma_project_id = alma_project["id"]
    
    print(f"✅ Empresa encontrada: {pactum_company['name']}")
    print(f"✅ Cliente encontrado: {alma_client['name']}")
    print(f"✅ Proyecto encontrado: {alma_project['name']}\n")
    
    # ============================================================
    # CREAR USUARIOS DEL EQUIPO ALMA IA
    # ============================================================
    
    print("👥 Creando usuarios del equipo Alma IA...\n")
    
    # Usuario 1: Miguel Estanga (Frontend Developer)
    miguel_user_id = str(uuid.uuid4())
    miguel_hashed_password = pwd_context.hash("MiguelAlma2026!")
    miguel_user_doc = {
        "id": miguel_user_id,
        "company_id": pactum_company_id,
        "email": "miguel.estanga@almaia.com",
        "hashed_password": miguel_hashed_password,
        "full_name": "Miguel Alejandro Estanga",
        "role": "TEAM_MEMBER",
        "status": "active",
        "position": "Frontend Developer - Alma IA",
        "department": "Desarrollo",
        "phone": "+505 8888-1111",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_miguel = await db.users.find_one({"email": "miguel.estanga@almaia.com"})
    if not existing_miguel:
        await db.users.insert_one(miguel_user_doc)
        print("✅ Usuario creado: Miguel Alejandro Estanga (Frontend)")
    else:
        miguel_user_id = existing_miguel["id"]
        print("ℹ️  Usuario ya existe: Miguel Alejandro Estanga")
    
    # Usuario 2: Jonathan Roque (Backend Developer)
    jroque_user_id = str(uuid.uuid4())
    jroque_hashed_password = pwd_context.hash("JRoqueAlma2026!")
    jroque_user_doc = {
        "id": jroque_user_id,
        "company_id": pactum_company_id,
        "email": "jonathan.roque@almaia.com",
        "hashed_password": jroque_hashed_password,
        "full_name": "Jonathan Roque",
        "role": "TEAM_MEMBER",
        "status": "active",
        "position": "Backend Developer - Alma IA",
        "department": "Desarrollo",
        "phone": "+505 8888-2222",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_jroque = await db.users.find_one({"email": "jonathan.roque@almaia.com"})
    if not existing_jroque:
        await db.users.insert_one(jroque_user_doc)
        print("✅ Usuario creado: Jonathan Roque (Backend)")
    else:
        jroque_user_id = existing_jroque["id"]
        print("ℹ️  Usuario ya existe: Jonathan Roque")
    
    print()
    
    # ============================================================
    # TAREAS DE FRONTEND - MIGUEL ESTANGA
    # ============================================================
    
    print("📱 Creando tareas de Frontend para Miguel Estanga...\n")
    
    frontend_tasks = [
        {
            "title": "HomeScreen2 (Gamificado) - Diseño y Maquetación",
            "description": "Implementar pantalla principal gamificada con elementos visuales atractivos, badges, progreso del usuario y animaciones. Incluir screenshots del progreso cada hora.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo Diario - Frontend",
            "description": "Crear interfaz para registro diario del usuario. Incluir formularios, validaciones y feedback visual. Documentar endpoints utilizados y subir screenshots.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo SOS - Frontend",
            "description": "Implementar botón de emergencia SOS con grabación de audio/video, envío de texto y geolocalización. Probar en iOS y Android. Screenshots cada hora.",
            "priority": "urgent",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo PyR (Preguntas y Respuestas) - Frontend",
            "description": "Crear interfaz para sistema de preguntas diarias (Emoción, Neurodivergencia, Patologías). Validar que todas las preguntas se muestren correctamente. Documentar endpoints.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo AVISOS - Frontend",
            "description": "Implementar sistema de notificaciones y avisos. Diferenciar visualmente avisos simples de encuestas (colores + iconos). Ordenar descendente (más reciente primero). Screenshots.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo ENCUESTAS - Frontend",
            "description": "Crear interfaz para encuestas dinámicas. Permitir 2-4 opciones (no obligar 4ta opción). Navegación desde avisos a encuestas. Manejo de errores al guardar. Screenshots.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Módulo BENEFICIOS - Frontend",
            "description": "Implementar pantalla de beneficios para usuarios. Diseño atractivo con cards, imágenes y descripciones. Documentar endpoints y subir screenshots cada hora.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Registro Semanal - Frontend",
            "description": "Crear interfaz para registro semanal de actividades. Calendario interactivo, gráficas de progreso. Validar que no se rompa la gráfica al seleccionar fechas. Screenshots.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "Pruebas y Validaciones Frontend - Miguel",
            "description": "Realizar pruebas exhaustivas de todos los módulos frontend implementados. Detectar errores, validar flujos de usuario, verificar responsive design en iOS y Android. Documentar bugs encontrados antes de entregar.",
            "priority": "high",
            "estimated_hours": 2,
            "status": "backlog",
            "assigned_to": miguel_user_id
        }
    ]
    
    frontend_count = 0
    for task_data in frontend_tasks:
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "project_id": alma_project_id,
            **task_data,
            "created_by": miguel_user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tasks.insert_one(task_doc)
        frontend_count += 1
        print(f"  ✅ {task_data['title']}")
    
    print(f"\n✅ {frontend_count} tareas de Frontend creadas\n")
    
    # ============================================================
    # TAREAS DE BACKEND - JONATHAN ROQUE
    # ============================================================
    
    print("⚙️  Creando tareas de Backend para Jonathan Roque...\n")
    
    backend_tasks = [
        {
            "title": "Validar funcionalidad en App y Web",
            "description": "Verificar que todos los endpoints funcionen correctamente en ambas plataformas (App móvil y Web). Documentar diferencias y problemas encontrados. Screenshots de pruebas.",
            "priority": "urgent",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Garantizar Preguntas Diarias - Sistema automático",
            "description": "Implementar sistema que garantice que las 3 preguntas diarias (Emoción, Neurodivergencia, Patologías) se muestren correctamente. Validar nombres exactos en BD vs App.",
            "priority": "urgent",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Informes automáticos - Inicio y fin de día",
            "description": "Crear sistema de informes automáticos que se envíen al inicio y final del día con status del sistema, usuarios activos, errores y métricas clave.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Garantizar operación Dev y Prod con datos correctos",
            "description": "Validar que ambos ambientes (Desarrollo y Producción) operen correctamente con sus respectivos datos. Documentar configuraciones y diferencias.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Fix: Endpoint preguntas - Validar nombres exactos",
            "description": "Revisar endpoint de preguntas diarias. El problema reportado: solo aparecen 2 de 3 preguntas (falta Patologías). Validar que nombres en BD coincidan exactamente con lo que espera la App.",
            "priority": "urgent",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Fix: SOS Audio - Visualización en Web",
            "description": "Corregir bug donde audios enviados por SOS desde App no se visualizan en Web. Validar almacenamiento y recuperación de archivos de audio.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Fix: Encuestas - Error al guardar segunda respuesta",
            "description": "Investigar y corregir error que ocurre al guardar la segunda respuesta de una encuesta. Primera respuesta OK, segunda falla. Logs y screenshots.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Optimización: Cambio de contraseña",
            "description": "Revisar flujo de cambio de contraseña. Reportado: indica que guardó OK pero luego no permite login. Validar hash y actualización en BD.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "Pruebas y Validaciones Backend - Jonathan",
            "description": "Realizar pruebas exhaustivas de todos los endpoints y funcionalidades backend. Validar respuestas, tiempos de respuesta, manejo de errores. Probar en Dev y Prod. Documentar bugs encontrados antes de entregar.",
            "priority": "high",
            "estimated_hours": 2,
            "status": "backlog",
            "assigned_to": jroque_user_id
        }
    ]
    
    backend_count = 0
    for task_data in backend_tasks:
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "project_id": alma_project_id,
            **task_data,
            "created_by": jroque_user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tasks.insert_one(task_doc)
        backend_count += 1
        print(f"  ✅ {task_data['title']}")
    
    print(f"\n✅ {backend_count} tareas de Backend creadas\n")
    
    # ============================================================
    # ISSUES REPORTADOS - TAREAS ADICIONALES
    # ============================================================
    
    print("🐛 Creando tareas para Issues Reportados...\n")
    
    issues_tasks = [
        {
            "title": "BUG iOS: Gráfica de actividades se rompe al seleccionar fecha",
            "description": "Reproducir y corregir bug donde la gráfica en sección de actividades se rompe al escoger una fecha. Solo reportado en iOS. Screenshots del error.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "BUG iOS: SOS exige texto cuando solo se grabó voz",
            "description": "Corregir validación en SOS. Si usuario solo graba voz, no debería exigir texto obligatorio. Validar en iOS y Android.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "BUG iOS: Cerrar sesión cierra la app en lugar de ir a login",
            "description": "Al cerrar sesión, la app se cierra completamente. Debería redirigir a pantalla de login. Corregir navegación.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Avisos sin título muestran 'Sin título'",
            "description": "Mejorar UX: cuando un aviso no tiene título, mostrar primeras palabras del contenido en lugar de 'Sin título'.",
            "priority": "low",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Ordenar avisos descendente (más reciente primero)",
            "description": "Cambiar orden de avisos para que el más reciente aparezca primero (orden descendente por fecha).",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "UX: Contador de mensajes no leídos no cuadra con total",
            "description": "Investigar discrepancia entre total de mensajes y contador de no leídos. Validar lógica de marcado como leído.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": jroque_user_id
        },
        {
            "title": "UX: Diferenciar avisos de encuestas visualmente",
            "description": "Agregar colores e iconos diferentes para distinguir avisos simples de encuestas. Mejorar navegación desde aviso a encuesta (doble clic).",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Encuestas no deben obligar 4ta opción",
            "description": "Modificar formulario de creación de encuestas para permitir 2-4 opciones sin obligar la cuarta opción.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "BUG Android: Encuestas no muestran preguntas",
            "description": "Reportado en Android: las encuestas llegan pero no se muestran las preguntas. Validar parsing y renderizado de preguntas.",
            "priority": "high",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Texto largo 'denunciémoslo' se corta",
            "description": "Ajustar UI para que palabra 'denunciémoslo' aparezca completa. Considerar cambiar a 'Denuncia' o ajustar ancho del contenedor.",
            "priority": "low",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Menú inferior desaparece en algunas pantallas",
            "description": "El menú de navegación inferior (Home, Agenda, etc) desaparece en algunas pantallas. Hacer que sea persistente en todas las vistas principales.",
            "priority": "medium",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        },
        {
            "title": "UX: Inconsistencia en tonos de azul",
            "description": "Estandarizar paleta de colores. Los azules no son iguales en diferentes secciones. Crear guía de estilos y aplicar consistentemente.",
            "priority": "low",
            "estimated_hours": 1,
            "status": "backlog",
            "assigned_to": miguel_user_id
        }
    ]
    
    issues_count = 0
    for task_data in issues_tasks:
        task_id = str(uuid.uuid4())
        task_doc = {
            "id": task_id,
            "project_id": alma_project_id,
            **task_data,
            "created_by": jroque_user_id if "Backend" in task_data.get("description", "") or "endpoint" in task_data.get("description", "").lower() else miguel_user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tasks.insert_one(task_doc)
        issues_count += 1
        print(f"  ✅ {task_data['title']}")
    
    print(f"\n✅ {issues_count} tareas de Issues creadas\n")
    
    # ============================================================
    # RESUMEN FINAL
    # ============================================================
    
    total_tasks = frontend_count + backend_count + issues_count
    
    print("\n" + "="*60)
    print("✨ BACKLOG ALMA IA CONFIGURADO EXITOSAMENTE")
    print("="*60 + "\n")
    
    print(f"📊 RESUMEN:")
    print(f"   👥 Usuarios creados: 2")
    print(f"   📱 Tareas Frontend (Miguel): {frontend_count} (incluye 2h pruebas)")
    print(f"   ⚙️  Tareas Backend (Jonathan): {backend_count} (incluye 2h pruebas)")
    print(f"   🐛 Issues reportados: {issues_count}")
    print(f"   📋 TOTAL TAREAS: {total_tasks}")
    print(f"   ⏱️  Horas estimadas: {frontend_count + backend_count + issues_count} horas (1h por tarea + 2h pruebas c/u)\n")
    
    print("🔐 CREDENCIALES NUEVOS USUARIOS:\n")
    print("👨‍💻 MIGUEL ALEJANDRO ESTANGA (Frontend Developer):")
    print("   Email:    miguel.estanga@almaia.com")
    print("   Password: MiguelAlma2026!")
    print("   Rol:      TEAM_MEMBER")
    print("   Tareas:   Frontend + UX Issues\n")
    
    print("👨‍💻 JONATHAN ROQUE (Backend Developer):")
    print("   Email:    jonathan.roque@almaia.com")
    print("   Password: JRoqueAlma2026!")
    print("   Rol:      TEAM_MEMBER")
    print("   Tareas:   Backend + Validaciones\n")
    
    print("👁️  ACCESO PARA VISUALIZACIÓN:")
    print("   • COMPANY_ADMIN (admin@pactum.com) puede ver todas las tareas")
    print("   • Admin Alma IA (admin@almaia.com) puede ver su proyecto")
    print("   • Usar ProjectSelector para cambiar entre clientes\n")
    
    print("="*60)
    print("🚀 Las tareas ya están en el backlog del proyecto Alma IA")
    print("🎯 Accede al Kanban o Lista de Tareas para gestionarlas")
    print("="*60 + "\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_alma_ia_backlog())
