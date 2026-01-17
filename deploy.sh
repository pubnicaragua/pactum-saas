#!/bin/bash

# 🚀 Script de Despliegue Automatizado - Pactum SaaS
# Uso: ./deploy.sh [install|update|restart|status]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
APP_DIR="/var/www/pactum-saas"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
SERVICE_NAME="pactum-backend"

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar si el script se ejecuta como root
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_error "No ejecutar como root. Usa sudo cuando sea necesario."
        exit 1
    fi
}

# Función de instalación completa
install() {
    print_info "Iniciando instalación completa de Pactum SaaS..."
    
    # Actualizar sistema
    print_info "Actualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependencias
    print_info "Instalando dependencias del sistema..."
    sudo apt install -y python3.12 python3.12-venv python3-pip nodejs npm nginx git build-essential
    
    # Instalar MongoDB
    print_info "Instalando MongoDB..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt update
    sudo apt install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Crear directorio de aplicación
    print_info "Creando directorio de aplicación..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    
    # Clonar repositorio
    print_info "Clonando repositorio..."
    cd $APP_DIR
    git clone https://github.com/pubnicaragua/pactum-saas.git .
    
    # Configurar backend
    print_info "Configurando backend..."
    cd $BACKEND_DIR
    python3.12 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Crear archivo .env
    cat > .env << 'EOF'
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=pactum_saas
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENVIRONMENT=production
EOF
    
    # Inicializar base de datos
    print_info "Inicializando base de datos..."
    python init_database.py
    deactivate
    
    # Configurar frontend
    print_info "Configurando frontend..."
    cd $FRONTEND_DIR
    npm install
    
    # Crear archivo .env.production
    cat > .env.production << 'EOF'
REACT_APP_API_URL=http://10.0.0.40:8000/api
EOF
    
    # Build frontend
    print_info "Construyendo frontend..."
    npm run build
    
    # Configurar servicio systemd
    print_info "Configurando servicio systemd..."
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=Pactum SaaS Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/uvicorn server_multitenant:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME
    sudo systemctl start $SERVICE_NAME
    
    # Configurar Nginx
    print_info "Configurando Nginx..."
    sudo tee /etc/nginx/sites-available/pactum-saas > /dev/null << 'EOF'
server {
    listen 80;
    server_name 186.1.56.251 10.0.0.40;

    location / {
        root /var/www/pactum-saas/frontend/build;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/pactum-saas /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    # Configurar firewall
    print_info "Configurando firewall..."
    sudo ufw allow 1510/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "¡Instalación completada!"
    print_info "Accede a la aplicación en: http://186.1.56.251"
    print_info "Credenciales admin: admin@pactum.com / Pactum#2026!"
}

# Función de actualización
update() {
    print_info "Actualizando Pactum SaaS..."
    
    cd $APP_DIR
    
    # Descargar cambios
    print_info "Descargando cambios desde GitHub..."
    git pull origin main
    
    # Actualizar backend
    print_info "Actualizando backend..."
    cd $BACKEND_DIR
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    sudo systemctl restart $SERVICE_NAME
    
    # Actualizar frontend
    print_info "Actualizando frontend..."
    cd $FRONTEND_DIR
    npm install
    npm run build
    sudo systemctl reload nginx
    
    print_success "¡Actualización completada!"
}

# Función de reinicio
restart() {
    print_info "Reiniciando servicios..."
    
    sudo systemctl restart $SERVICE_NAME
    sudo systemctl restart nginx
    sudo systemctl restart mongod
    
    print_success "Servicios reiniciados"
}

# Función de estado
status() {
    print_info "Estado de servicios:"
    echo ""
    
    echo "🐍 Backend (FastAPI):"
    sudo systemctl status $SERVICE_NAME --no-pager -l
    echo ""
    
    echo "🌐 Nginx:"
    sudo systemctl status nginx --no-pager -l
    echo ""
    
    echo "🍃 MongoDB:"
    sudo systemctl status mongod --no-pager -l
    echo ""
    
    echo "📊 Logs recientes del backend:"
    sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
}

# Función de logs
logs() {
    print_info "Mostrando logs en tiempo real (Ctrl+C para salir)..."
    sudo journalctl -u $SERVICE_NAME -f
}

# Función de backup
backup() {
    print_info "Creando backup de MongoDB..."
    
    BACKUP_DIR="/backup/mongodb/$(date +%Y%m%d_%H%M%S)"
    sudo mkdir -p $BACKUP_DIR
    sudo mongodump --out=$BACKUP_DIR
    
    print_success "Backup creado en: $BACKUP_DIR"
}

# Main
check_root

case "$1" in
    install)
        install
        ;;
    update)
        update
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    backup)
        backup
        ;;
    *)
        echo "Uso: $0 {install|update|restart|status|logs|backup}"
        echo ""
        echo "Comandos:"
        echo "  install  - Instalación completa del sistema"
        echo "  update   - Actualizar desde GitHub"
        echo "  restart  - Reiniciar todos los servicios"
        echo "  status   - Ver estado de servicios"
        echo "  logs     - Ver logs en tiempo real"
        echo "  backup   - Crear backup de MongoDB"
        exit 1
        ;;
esac

exit 0
