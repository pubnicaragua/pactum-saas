# 🚀 Guía de Despliegue - Pactum SaaS en Producción

## 📋 Información del Servidor

**Servidor:** Ubuntu 24.04.3 LTS  
**IP Interna:** 10.0.0.40/24  
**Gateway:** 10.0.0.254  
**DNS:** 186.1.31.8, 186.1.31.2  
**IP Pública:** 186.1.56.251  
**Puerto SSH:** 1510  
**Usuario:** extel  
**Password:** exteladmin26  

**Contacto:** Anibal Trutié - 58734147 (WhatsApp)

---

## 🔐 Paso 1: Conectarse al Servidor

```bash
ssh -p 1510 extel@186.1.56.251
```

---

## 📦 Paso 2: Instalar Dependencias del Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python 3.12 y pip
sudo apt install -y python3.12 python3.12-venv python3-pip

# Instalar Node.js 20.x (para el frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MongoDB
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar Nginx (servidor web)
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git

# Instalar herramientas adicionales
sudo apt install -y build-essential certbot python3-certbot-nginx
```

---

## 📂 Paso 3: Clonar el Repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/pactum-saas
sudo chown -R extel:extel /var/www/pactum-saas

# Clonar repositorio
cd /var/www/pactum-saas
git clone https://github.com/pubnicaragua/pactum-saas.git .

# Verificar que se clonó correctamente
ls -la
```

---

## 🐍 Paso 4: Configurar Backend (Python/FastAPI)

```bash
cd /var/www/pactum-saas/backend

# Crear entorno virtual
python3.12 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Crear archivo .env para variables de entorno
cat > .env << 'EOF'
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=pactum_saas
JWT_SECRET_KEY=tu-clave-secreta-super-segura-cambiar-en-produccion
ENVIRONMENT=production
EOF

# Inicializar base de datos
python init_database.py
```

---

## ⚛️ Paso 5: Configurar Frontend (React)

```bash
cd /var/www/pactum-saas/frontend

# Instalar dependencias
npm install

# Crear archivo .env para producción
cat > .env.production << 'EOF'
REACT_APP_API_URL=http://10.0.0.40:8000/api
EOF

# Construir aplicación para producción
npm run build
```

---

## 🔧 Paso 6: Configurar Servicios Systemd

### Backend Service

```bash
sudo nano /etc/systemd/system/pactum-backend.service
```

Contenido:
```ini
[Unit]
Description=Pactum SaaS Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=extel
WorkingDirectory=/var/www/pactum-saas/backend
Environment="PATH=/var/www/pactum-saas/backend/venv/bin"
ExecStart=/var/www/pactum-saas/backend/venv/bin/uvicorn server_multitenant:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pactum-backend
sudo systemctl start pactum-backend
sudo systemctl status pactum-backend
```

---

## 🌐 Paso 7: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/pactum-saas
```

Contenido:
```nginx
server {
    listen 80;
    server_name 186.1.56.251 10.0.0.40;

    # Frontend (React build)
    location / {
        root /var/www/pactum-saas/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

Activar configuración:
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/pactum-saas /etc/nginx/sites-enabled/

# Eliminar configuración default si existe
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Paso 8: Configurar Firewall

```bash
# Permitir SSH en puerto 1510
sudo ufw allow 1510/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir MongoDB solo localmente (no exponer)
# MongoDB ya está en localhost por defecto

# Habilitar firewall
sudo ufw --force enable

# Verificar estado
sudo ufw status
```

---

## 🔐 Paso 9: SSL/HTTPS (Opcional pero Recomendado)

Si tienes un dominio apuntando al servidor:

```bash
# Instalar certificado SSL con Let's Encrypt
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática
sudo systemctl enable certbot.timer
```

---

## 📊 Paso 10: Monitoreo y Logs

### Ver logs del backend
```bash
sudo journalctl -u pactum-backend -f
```

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ver logs de MongoDB
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### Verificar servicios
```bash
sudo systemctl status pactum-backend
sudo systemctl status nginx
sudo systemctl status mongod
```

---

## 🔄 Paso 11: Actualizar la Aplicación

Cuando hagas cambios en GitHub:

```bash
cd /var/www/pactum-saas

# Descargar cambios
git pull origin main

# Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart pactum-backend

# Actualizar frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## 🧪 Paso 12: Verificar Instalación

### Desde el servidor:
```bash
# Verificar backend
curl http://localhost:8000/health

# Verificar MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### Desde tu computadora:
```bash
# Verificar acceso externo
curl http://186.1.56.251/health
```

### En el navegador:
- Frontend: `http://186.1.56.251`
- API Health: `http://186.1.56.251/health`

---

## 👥 Credenciales de Acceso

### Super Admin
- Email: `admin@pactum.com`
- Password: `Pactum#2026!`

### Cliente Amaru Mojica
- Email: `activo2_26@gmail.com`
- Password: `Pactum#2026!`

---

## 🚨 Troubleshooting

### Backend no inicia
```bash
# Ver logs detallados
sudo journalctl -u pactum-backend -n 100 --no-pager

# Verificar puerto 8000
sudo netstat -tlnp | grep 8000

# Reiniciar servicio
sudo systemctl restart pactum-backend
```

### Frontend no carga
```bash
# Verificar que el build existe
ls -la /var/www/pactum-saas/frontend/build

# Verificar permisos
sudo chown -R www-data:www-data /var/www/pactum-saas/frontend/build

# Verificar Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
sudo systemctl status mongod

# Verificar conexión
mongosh --eval "db.runCommand({ connectionStatus: 1 })"

# Reiniciar MongoDB
sudo systemctl restart mongod
```

---

## 📝 Notas Importantes

1. **Seguridad:**
   - Cambiar `JWT_SECRET_KEY` en producción
   - Configurar backups automáticos de MongoDB
   - Mantener sistema actualizado: `sudo apt update && sudo apt upgrade`

2. **Performance:**
   - El backend usa 4 workers (ajustar según CPU disponible)
   - Nginx cachea assets estáticos por 1 año
   - MongoDB indexado automáticamente

3. **Backups:**
   ```bash
   # Backup manual de MongoDB
   mongodump --out=/backup/mongodb/$(date +%Y%m%d)
   
   # Backup automático (agregar a crontab)
   0 2 * * * mongodump --out=/backup/mongodb/$(date +\%Y\%m\%d)
   ```

4. **Monitoreo:**
   - Configurar alertas de espacio en disco
   - Monitorear uso de memoria y CPU
   - Revisar logs regularmente

---

## 📞 Soporte

**Contacto Servidor:** Anibal Trutié - 58734147 (WhatsApp)  
**Repositorio:** https://github.com/pubnicaragua/pactum-saas
