# Configuration Guide for Mid-Market Deployment

## Overview

This guide covers the configuration options available for mid-market deployments of CRM-V, including system settings, feature flags, security configurations, and performance tuning.

## Configuration Files

### Primary Configuration Files

- **Backend**: `backend/src/main/resources/application.properties`
- **Frontend**: `frontend/.env`
- **Database**: Database-specific configuration files
- **Server**: Nginx/Apache configuration
- **Environment**: System environment variables

## Backend Configuration

### Database Configuration

#### PostgreSQL Configuration

```properties
# Database Connection
spring.datasource.url=jdbc:postgresql://localhost:5432/crm_v_midmarket
spring.datasource.username=crm_v_user
spring.datasource.password=secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

#### MySQL Configuration

```properties
# Database Connection
spring.datasource.url=jdbc:mysql://localhost:3306/crm_v_midmarket?useSSL=false&serverTimezone=UTC
spring.datasource.username=crm_v_user
spring.datasource.password=secure_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# MySQL Specific
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.storage_engine=innodb
```

### Security Configuration

#### JWT Authentication

```properties
# JWT Settings
jwt.secret=your-super-secret-jwt-key-for-midmarket-deploymentment
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS Configuration
cors.allowed-origins=http://localhost:3000,https://your-domain.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
```

#### Password Security

```properties
# Password Policy
password.policy.min-length=8
password.policy.require-uppercase=true
password.policy.require-lowercase=true
password.policy.require-numbers=true
password.policy.require-special-chars=true
password.policy.max-age=90

# Account Lockout
security.lockout.max-attempts=5
security.lockout.duration=900
security.lockout.reset-after=1800
```

### Multi-Tenancy Configuration

```properties
# Multi-Tenancy Settings
crm.multi-tenancy.enabled=true
crm.multi-tenancy.strategy=database-per-tenant
crm.multi-tenancy.default-tenant=main

# Tenant Management
crm.tenant.auto-create=false
crm.tenant.isolation.level=strict
crm.tenant.max-tenants=50
crm.tenant.max-users-per-tenant=500
```

### Feature Flags

#### Core Features

```properties
# Essential Features (Always Enabled)
crm.features.core.enabled=true
crm.features.crm.enabled=true
crm.features.user-management.enabled=true
crm.features.reporting.enabled=true

# Mid-Market Features
crm.features.advanced-analytics.enabled=true
crm.features.custom-reports.enabled=true
crm.features.api-access.enabled=true
crm.features.integrations.enabled=true
crm.features.automation.enabled=true
crm.features.workflows.enabled=true
crm.features.audit-log.enabled=true

# Enterprise Features (Disabled for Mid-Market)
crm.features.ai-insights.enabled=false
crm.features.advanced-security.enabled=false
crm.features.white-label.enabled=false
crm.features.custom-domains.enabled=false
crm.features.sso.enabled=false
```

#### Module-Specific Features

```properties
# CRM Module Features
crm.crm.features.leads.enabled=true
crm.crm.features.deals.enabled=true
crm.crm.features.contacts.enabled=true
crm.crm.features.accounts.enabled=true
crm.crm.features.activities.enabled=true

# Customer Success Features
crm.customersuccess.features.health-scores.enabled=true
crm.customersuccess.features.engagement-tracking.enabled=true
crm.customersuccess.features.satisfaction-surveys.enabled=true

# Analytics Features
crm.analytics.features.custom-dashboards.enabled=true
crm.analytics.features.predictive-analytics.enabled=false
crm.analytics.features.real-time-reports.enabled=true
```

### Performance Configuration

#### Caching

```properties
# Redis Cache Configuration
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=
spring.redis.database=0
spring.redis.timeout=2000

# Cache Settings
spring.cache.cache-names=users,customers,deals,reports,analytics
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false

# Session Management
spring.session.store-type=redis
spring.session.timeout=1800
spring.session.redis.namespace=spring:session
```

#### Background Jobs

```properties
# Job Configuration
crm.jobs.enabled=true
crm.jobs.pool-size=5
crm.jobs.max-concurrent=10
crm.jobs.queue-capacity=100

# Scheduled Tasks
crm.schedules.enabled=true
crm.schedules.health-score-calculation=0 0 2 * * *
crm.schedules.report-generation=0 0 6 * * *
crm.schedules.data-cleanup=0 0 3 * * SUN
```

### Email Configuration

#### SMTP Settings

```properties
# SMTP Configuration
spring.mail.host=smtp.yourcompany.com
spring.mail.port=587
spring.mail.username=noreply@yourcompany.com
spring.mail.password=your-email-password
spring.mail.protocol=smtp
spring.mail.default-encoding=UTF-8

# SMTP Properties
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=*
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
```

#### Email Templates

```properties
# Email Template Configuration
crm.email.templates.enabled=true
crm.email.templates.customizable=true
crm.email.templates.path=classpath:templates/email/
crm.email.from-address=nore-reply@yourcompany.com
crm.email.reply-to=support@yourcompany.com
crm.email.from-name=CRM-V System

# Email Features
crm.email.track-opens=true
crm.email.track-clicks=true
crm.email.unsubscribe-link=true
crm.email.bounce-handling=true
```

### File Storage Configuration

#### Local Storage

```properties
# File Upload Settings
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.servlet.multipart.enabled=true

# Storage Configuration
crm.storage.type=local
crm.storage.base-path=/opt/crm-v/uploads
crm.storage.max-total-size=10GB
crm.storage.allowed-extensions=pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif
```

#### Cloud Storage (Optional)

```properties
# AWS S3 Configuration
crm.storage.type=s3
crm.storage.s3.bucket=your-crm-bucket
crm.storage.s3.region=us-east-1
crm.storage.s3.access-key=your-access-key
crm.storage.s3.secret-key=your-secret-key
crm.storage.s3.endpoint=https://s3.amazonaws.com
```

## Frontend Configuration

### Environment Variables

#### Basic Configuration

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_ENVIRONMENT=production

# Application Info
REACT_APP_VERSION=2.0.0-midmarket
REACT_APP_COMPANY_NAME=Your Company
REACT_APP_PRODUCT_NAME=CRM-V

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DARKBOARDS=true
REACT_APP_ENABLE_CUSTOM_REPORTS=true
```

#### UI Configuration

```env
# UI Settings
REACT_APP_THEME=default
REACT_APP_PRIMARY_COLOR=#2563eb
REACT_APP_SECONDARY_COLOR=#64748b
REACT_APP_SUCCESS_COLOR=#10b981
REACT_APP_WARNING_COLOR=#f59e0b
REACT_APP_ERROR_COLOR=#ef4444

# Layout Configuration
REACT_APP_SIDEBAR_COLLAPSIBLE=true
REACT_APP_HEADER_FIXED=true
REACT_APP_FOOTER_ENABLED=false
REACT_APP_BREADCRUMB_ENABLED=true
```

#### Performance Configuration

```env
# Performance Settings
REACT_APP_LAZY_LOADING=true
REACT_APP_VIRTUAL_SCROLLING=true
REACT_APP_CACHE_ENABLED=true
REACT_APP_OFFLINE_SUPPORT=true

# File Upload
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif
```

## Database Configuration

### PostgreSQL Optimization

#### Performance Tuning

```sql
-- Memory Settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Connection Settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Logging Settings
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Apply changes
SELECT pg_reload_conf();
```

#### Security Settings

```sql
-- Enable Row Level Security
ALTER SYSTEM SET row_security = on;

-- SSL Configuration
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';

-- Apply changes
SELECT pg_reload_conf();
```

### Index Optimization

```sql
-- Customer Table Indexes
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY idx_customers_company ON customers(company);
CREATE INDEX CONCURRENTLY idx_customers_status ON customers(status);
CREATE INDEX CONCURRENTLY idx_customers_created_date ON customers(created_date);

-- Deal Table Indexes
CREATE INDEX CONCURRENTLY idx_deals_customer_id ON deals(customer_id);
CREATE INDEX CONCURRENTLY idx_deals_status ON deals(status);
CREATE INDEX CONCURRENTLY idx_deals_amount ON deals(amount);
CREATE INDEX CONCURRENTLY idx_deals_expected_close_date ON deals(expected_close_date);

-- Activity Table Indexes
CREATE INDEX CONCURRENTLY idx_activities_customer_id ON activities(customer_id);
CREATE INDEX CONCURRENTLY idx_activities_type ON activities(type);
CREATE INDEX CONCURRENTLY idx_activities_created_date ON activities(created_date);
CREATE INDEX CONCURRENTLY idx_activities_due_date ON activities(due_date);

-- Composite Indexes
CREATE INDEX CONCURRENTLY idx_deals_customer_status ON deals(customer_id, status);
CREATE INDEX CONCURRENTLY idx_activities_customer_type ON activities(customer_id, type);
```

## Server Configuration

### Nginx Configuration

#### Basic Setup

```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conff;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp
        text/css
        application/javascript
        application/json
        application/xml
        text/xml
        text/plain;

    # Include site configurations
    include /etc/nginx/conf.conf-enabled/*;
}
```

#### Site Configuration

```nginx
# /etc/nginx/sites-available/crm-v
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/crm-v.crt;
    ssl_certificate_key /etc/ssl/private/crm-v.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';" always;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File Uploads
    location /uploads {
        alias /opt/crm-v/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security
        location ~* \.(php|jsp|asp|sh|py)$ {
            deny all;
        }
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Monitoring Configuration

### Application Monitoring

#### Actuator Configuration

```properties
# Spring Boot Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoints.web.exposure.exclude=*
management.endpoint.health.show-details=when-authorized
management.metrics.export.prometheus.enabled=true

# Health Checks
management.health.db.enabled=true
management.health.redis.enabled=true
management.health.disk.enabled=true
management.health.mail.enabled=true
```

#### Logging Configuration

```properties
# Logging Configuration
logging.level.com.everx.crm=INFO
logging.level.org.springframework.security=WARN
logging.level.org.hibernate.SQL=WARN
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=WARN

# Log File Configuration
logging.file.name=/var/log/crm-v/application.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30
logging.logback.rollingpolicy.total-size-cap=1GB

# Audit Logging
logging.level.com.everx.crm.audit=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### System Monitoring

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "crm-v-rules.yml"

scrape_configs:
  - job_name: 'crm-v'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 30s
```

## Security Configuration

### SSL/TLS Configuration

#### Certificate Configuration

```nginx
# Strong SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

#### Security Headers

```nginx
# Comprehensive Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'self';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Firewall Configuration

#### UFW Configuration

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### iptables Rules

```bash
# iptables rules for additional security
sudo iptables -A INPUT -p tcp --dport 8080 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
sudo iptables -A INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP
sudo iptables -A INPUT -p tcp --dport 6379 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 6379 -j DROP
```

## Environment-Specific Configuration

### Development Environment

```properties
# Development Settings
spring.profiles.active=dev
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.com.everx.crm=DEBUG

# Hot Reload
spring.devtools.restart.enabled=true
spring.devtools.livereload.enabled=true
```

### Staging Environment

```properties
# Staging Settings
spring.profiles.active=staging
spring.jpa.show-sql=false
logging.level.com.everx.crm=INFO

# External Services
crm.email.enabled=false
crm.notifications.enabled=false
```

### Production Environment

```properties
# Production Settings
spring.profiles.active=prod
spring.jpa.show-sql=false
logging.level.com.everx.crm=WARN

# Security
security.require-ssl=true
crm.sessions.timeout=1800

# Performance
spring.datasource.hikari.maximum-pool-size=50
crm.cache.enabled=true
```

## Configuration Validation

### Health Check Script

```bash
#!/bin/bash
# config-validation.sh

echo "Validating CRM-V Configuration..."

# Check Application Health
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✓ Application is healthy"
else
    echo "✗ Application health check failed"
    exit 1
fi

# Check Database Connection
if sudo -u postgres psql -d crm_v_midmarket -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    exit 1
fi

# Check Redis Connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis connection successful"
else
    echo "✗ Redis connection failed"
    exit 1
fi

# Check SSL Certificate
if openssl x509 -checkend 86400 -noout -in /etc/ssl/certs/crm-v.crt > /dev/null 2>&1; then
    echo "✓ SSL certificate is valid"
else
    echo "✗ SSL certificate is expired or invalid"
    exit 1
fi

echo "Configuration validation completed successfully!"
```

### Configuration Backup

```bash
#!/bin/bash
# backup-config.sh

BACKUP_DIR="/backups/crm-v/config"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration files
cp /opt/crm-v/backend/src/main/resources/application.properties $BACKUP_DIR/application_$DATE.properties
cp /opt/crm-v/frontend/.env $BACKUP_DIR/frontend_$DATE.env
cp /etc/nginx/sites-available/crm-v $BACKUP_DIR/nginx_$DATE
cp /etc/postgresql/14/main/postgresql.conf $BACKUP_DIR/postgres_$DATE.conf

# Create tarball
tar -czf $BACKUP_DIR/crm-v-config_$DATE.tar.gz $BACKUP_DIR/*_$DATE.*

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Configuration backup completed: $BACKUP_DIR/crm-v-config_$DATE.tar.gz"
```

---

*For detailed configuration examples and troubleshooting, refer to the main documentation or contact our support team.*
