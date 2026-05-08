# Installation Guide for Mid-Market Deployment

## Quick Start Installation

### Prerequisites Verification

Before starting installation, verify your system meets the requirements:

```bash
# Check Java version
java -version
# Should show Java 17+

# Check Node.js version
node --version
# Should show v18+

# Check available memory
free -h
# Should show at least 8GB available

# Check disk space
df -h
# Should show at least 50GB free
```

### Automated Installation Script

For quick deployment, use our automated installation script:

```bash
# Download installation script
curl -fsSL https://get.crm-v.com/install-midmarket | bash

# Or download and run manually
wget https://get.crm-v.com/install-midmarket
chmod +x install-midmarket
sudo ./install-midmarket
```

The script will:
- Install system dependencies
- Configure database
- Build and deploy the application
- Set up systemd services
- Configure nginx reverse proxy

### Manual Installation Steps

#### Step 1: System Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    openjdk-17-jdk \
    postgresql-14 \
    nginx \
    redis-server \
    git \
    curl \
    wget \
    unzip

# Add application user
sudo useradd -r -s /bin/false crm-v
sudo mkdir -p /opt/crm-v
sudo chown crm-v:crm-v /opt/crm-v
```

#### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE crm_v_midmarket;
CREATE USER crm_v_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crm_v_midmarket TO crm_v_user;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf.conf
```

Add these lines to postgresql.conf:
```
# CRM-V Configuration
listen_addresses = 'localhost'
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

#### Step 3: Application Deployment

```bash
# Clone repository
sudo -u crm-v git clone https://github.com/your-org/crm-v.git /opt/crm-v/app
cd /opt/crm-v/app

# Build backend
sudo -u crm-v cd backend
sudo -u crm-v ./mvnw clean package -DskipTests

# Build frontend
sudo -u crm-v cd ../frontend
sudo -u crm-v npm install
sudo -u crm-v npm run build

# Copy frontend build to nginx
sudo cp -r build/* /var/www/html/
```

#### Step 4: Configuration

```bash
# Create application properties
sudo -u crm-v cp backend/src/main/resources/application.properties.example \
    backend/src/main/resources/application.properties

# Edit configuration
sudo nano backend/src/main/resources/application.properties
```

#### Step 5: Service Configuration

Create systemd service file:

```bash
sudo nano /etc/systemd/system/crm-v.service
```

```ini
[Unit]
Description=CRM-V Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=crm-v
WorkingDirectory=/opt/crm-v/app/backend
ExecStart=/usr/bin/java -jar target/crm-v-2.0.0.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable crm-v
sudo systemctl start crm-v
```

#### Step 6: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/crm-v
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend static files
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File uploads
    location /uploads {
        alias /opt/crm-v/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/crm-v /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### SSL Certificate Setup

#### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL Certificate

```bash
# Generate private key
sudo openssl genrsa -out /etc/ssl/private/crm-v.key 2048

# Generate CSR
sudo openssl req -new -key /etc/ssl/private/crm-v.key -out /etc/ssl/certs/crm-v.csr

# Self-signed certificate (for testing)
sudo openssl x509 -req -days 365 -in /etc/ssl/certs/crm-v.csr \
    -signkey /etc/ssl/private/crm-v.key -out /etc/ssl/certs/crm-v.crt
```

Update nginx configuration for HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/crm-v.crt;
    ssl_certificate_key /etc/ssl/private/crm-v.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Docker Installation

#### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/crm_v_midmarket
      - SPRING_DATASOURCE_USERNAME=crm_v_user
      - SPRING_DATASOURCE_PASSWORD=secure_password
      - SPRING_REDIS_HOST=redis
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=crm_v_midmarket
      - POSTGRES_USER=crm_v_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf.conf:/etc/nginx/conf.conf
      - ./ssl:/etc/ssl
      - ./frontend/build:/usr/share/nginx/html
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy application
COPY backend/target/crm-v-*.jar app.jar

# Create non-root user
RUN addgroup --system crm-v && adduser --system crm-v --group crm-v
USER crm-v

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3

# Backup volumes
docker run --rm -v crm-v_postgres_data:/data -v $(pwd):/backup \
    alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Update application
docker-compose pull
docker-compose up -d
```

### Cloud Deployment

#### AWS Deployment

```bash
# Using AWS CLI
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --instance-type t3.xlarge \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxxx \
    --subnet-id subnet-xxxxxxxxx \
    --user-data file://cloud-init.sh

# cloud-init.sh
#!/bin/bash
apt update
apt install -y docker.io docker-compose
usermod -aG docker ubuntu
cd /home/ubuntu
git clone https://github.com/your-org/crm-v.git
cd crm-v
docker-compose up -d
```

#### Azure Deployment

```bash
# Using Azure CLI
az group create --name crm-v-rg --location eastus
az vm create \
    --resource-group crm-v-rg \
    --name crm-v-vm \
    --image UbuntuLTS \
    --size Standard_D4s_v3 \
    --admin-username azureuser \
    --generate-ssh-keys \
    --custom-data cloud-init.sh
```

#### Google Cloud Deployment

```bash
# Using gcloud
gcloud compute instances create crm-v-vm \
    --zone=us-central1-a \
    --machine-type=n2-standard-4 \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --metadata-from-file startup-script=cloud-init.sh
```

### Verification

After installation, verify everything is working:

```bash
# Check application status
sudo systemctl status crm-v
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis

# Check application health
curl -f http://localhost:8080/actuator/health

# Check API endpoints
curl http://localhost:8080/api/public/health

# Check database connection
sudo -u postgres psql -d crm_v_midmarket -c "SELECT version();"

# Check logs
sudo journalctl -u crm-v -f
sudo tail -f /var/log/nginx/error.log
```

### Post-Installation Configuration

#### 1. Create Admin User

```bash
# Access application
curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@yourcompany.com",
        "password": "secure_admin_password",
        "role": "ADMIN"
    }'
```

#### 2. Configure Email

```bash
# Test email configuration
curl -X POST http://localhost:8080/api/system/test-email \
    -H "Content-Type: application/json" \
    -d '{
        "to": "test@example.com",
        "subject": "Test Email",
        "body": "This is a test email from CRM-V"
    }'
```

#### 3. Initialize Data

```bash
# Load sample data (optional)
curl -X POST http://localhost:8080/api/system/load-sample-data \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Troubleshooting Installation

#### Common Issues

1. **Port Already in Use**
```bash
# Check what's using port 8080
sudo netstat -tlnp | grep :8080
# Kill the process or change port in application.properties
```

2. **Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check connection
sudo -u postgres psql -h localhost -U crm_v_user -d crm_v_midmarket
```

3. **Permission Denied**
```bash
# Fix file permissions
sudo chown -R crm-v:crm-v /opt/crm-v
sudo chmod -R 755 /opt/crm-v
```

4. **Memory Issues**
```bash
# Check memory usage
free -h
# Increase swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Performance Tuning

#### Database Optimization

```sql
-- PostgreSQL performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

#### Application Optimization

```properties
# application.properties performance settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# JPA settings
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.batch_versioned_data=true
```

---

*For additional support, refer to the main documentation or contact our support team.*
