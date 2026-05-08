# CRM-V Mid-Market Deployment Guide

## Overview

This guide provides comprehensive documentation for deploying and configuring the CRM-V system for mid-market organizations (50-500 employees). It includes installation, configuration, customization, and maintenance procedures specifically tailored for mid-market requirements.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Guide](#installation-guide)
3. [Configuration](#configuration)
4. [Customization](#customization)
5. [Data Migration](#data-migration)
6. [User Training](#user-training)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## System Requirements

### Minimum Requirements
- **CPU**: 4 cores (Intel i5/AMD Ryzen 5 or equivalent)
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps
- **Users**: Up to 100 concurrent users
- **Database**: PostgreSQL 13+ or MySQL 8.0+

### Recommended Requirements
- **CPU**: 8 cores (Intel i7/AMD Ryzen 7 or equivalent)
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **Network**: 1 Gbps
- **Users**: Up to 500 concurrent users
- **Database**: PostgreSQL 14+ with read replicas

### Cloud Requirements
- **AWS**: t3.large (minimum), t3.xlarge (recommended)
- **Azure**: Standard_D4s_v3 (minimum), Standard_D8s_v3 (recommended)
- **GCP**: n2-standard-4 (minimum), n2-standard-8 (recommended)

## Installation Guide

### Prerequisites

1. **Operating System**
   - Ubuntu 20.04 LTS or later
   - CentOS 8 or later
   - Windows Server 2019 or later

2. **Software Dependencies**
   - Java 17+ (OpenJDK or Oracle JDK)
   - Node.js 18+ (for frontend build)
   - Docker 20.10+ (optional, for containerized deployment)
   - Git 2.30+

### Step-by-Step Installation

#### 1. Environment Setup

```bash
# Create application directory
sudo mkdir -p /opt/crm-v
sudo chown $USER:$USER /opt/crm-v
cd /opt/crm-v

# Clone repository
git clone https://github.com/your-org/crm-v.git .

# Set environment variables
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export NODE_PATH=/usr/local/lib/node_modules
```

#### 2. Database Setup

**PostgreSQL:**
```sql
-- Create database
CREATE DATABASE crm_v_midmarket;
CREATE USER crm_v_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE crm_v_midmarket TO crm_v_user;

-- Enable required extensions
\c crm_v_midmarket;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**MySQL:**
```sql
CREATE DATABASE crm_v_midmarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_v_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON crm_v_midmarket.* TO 'crm_v_user'@'%';
FLUSH PRIVILEGES;
```

#### 3. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Configure application properties
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit configuration
nano src/main/resources/application.properties
```

**application.properties:**
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/crm_v_midmarket
spring.datasource.username=crm_v_user
spring.datasource.password=secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# Mid-Market Specific Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Performance Tuning
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# Security
jwt.secret=your-midmarket-jwt-secret-key
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Email Configuration
spring.mail.host=smtp.yourcompany.com
spring.mail.port=587
spring.mail.username=noreply@yourcompany.com
spring.mail.password=your-email-password
```

#### 4. Frontend Build

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
nano .env
```

**.env file:**
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=2.0.0-midmarket
REACT_APP_COMPANY_NAME=Your Company
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ENABLE_ANALYTICS=true
```

```bash
# Build production bundle
npm run build

# Copy build files to web server directory
sudo cp -r build/* /var/www/html/
```

#### 5. Application Startup

```bash
# Navigate back to backend
cd ../backend

# Build application
./mvnw clean package -DskipTests

# Start application
java -jar target/crm-v-2.0.0.jar
```

### Docker Deployment (Alternative)

```bash
# Build Docker image
docker build -t crm-v-midmarket:latest .

# Run with Docker Compose
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    image: crm-v-midmarket:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/crm_v_midmarket
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=crm_v_midmarket
      - POSTGRES_USER=crm_v_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf.conf
```

## Configuration

### Mid-Market Feature Configuration

#### 1. Multi-Tenancy Setup

```properties
# Enable multi-tenancy
crm.multi-tenancy.enabled=true
crm.multi-tenancy.strategy=database-per-tenant
crm.multi-tenancy.default-tenant=main

# Tenant isolation
crm.tenant.isolation.enabled=true
crm.tenant.isolation.level=strict
```

#### 2. User Management

```properties
# User limits
crm.users.max-per-tenant=500
crm.users.default-role=USER
crm.users.require-email-verification=true

# Role configuration
crm.roles.enabled=true
crm.roles.custom-roles=true
crm.roles.max-custom-roles=20
```

#### 3. Feature Flags

```properties
# Mid-market specific features
crm.features.advanced-analytics=true
crm.features.custom-reports=true
crm.features.api-access=true
crm.features.integrations=true
crm.features.automation=true

# Disabled enterprise features
crm.features.advanced-security=false
crm.features.ai-insights=false
crm.features.white-label=false
```

#### 4. Performance Settings

```properties
# Caching
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379

# Session management
spring.session.store-type=redis
spring.session.timeout=1800

# Background jobs
crm.jobs.enabled=true
crm.jobs.pool-size=5
crm.jobs.max-concurrent=10
```

### Email Configuration

```properties
# SMTP Settings
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=*

# Email templates
crm.email.templates.enabled=true
crm.email.templates.customizable=true
crm.email.from-address=nore-reply@yourcompany.com
crm.email.reply-to=support@yourcompany.com
```

## Customization

### Branding

#### 1. Logo and Colors

```css
/* Custom branding variables */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --accent-color: #10b981;
  --logo-url: /assets/your-logo.png;
  --favicon-url: /assets/favicon.ico;
}
```

#### 2. Company Information

```properties
# Company details
crm.company.name=Your Company Name
crm.company.domain=yourcompany.com
crm.company.address=123 Business St, City, State 12345
crm.company.phone=+1-555-0123
crm.company.email=info@yourcompany.com
```

### Custom Fields

#### 1. Adding Custom Fields

```java
// Custom field configuration
@Entity
public class CustomCustomerField {
    @Id
    private Long id;
    
    private String fieldName;
    private String fieldType; // TEXT, NUMBER, DATE, BOOLEAN
    private String defaultValue;
    private Boolean required;
    private Integer displayOrder;
    
    // Getters and setters
}
```

#### 2. Field Validation

```properties
# Custom field validation
crm.custom-fields.enabled=true
crm.custom-fields.max-per-entity=20
crm.custom-fields.validation.enabled=true
```

### Workflow Customization

#### 1. Custom Workflows

```json
{
  "workflows": [
    {
      "name": "Mid-Market Sales Process",
      "trigger": "lead_created",
      "steps": [
        {
          "name": "Initial Contact",
          "assignee": "sales_rep",
          "duration": "24h",
          "actions": ["send_email", "create_task"]
        },
        {
          "name": "Qualification",
          "assignee": "sales_manager",
          "duration": "48h",
          "conditions": ["budget_confateral", "decision_maker_identified"]
        }
      ]
    }
  ]
}
```

## Data Migration

### Migration Planning

#### 1. Data Assessment

```bash
# Run data assessment tool
java -jar migration-assessment.jar \
  --source-system=legacy-crm \
  --target-system=crm-v \
  --output=migration-report.json
```

#### 2. Migration Strategy

**Phased Migration:**
1. **Phase 1**: Master data (customers, contacts)
2. **Phase 2**: Transactional data (deals, activities)
3. **Phase 3**: Historical data (reports, analytics)

**Data Mapping:**
```json
{
  "fieldMappings": {
    "legacy_customer": {
      "customer_id": "id",
      "customer_name": "name",
      "customer_email": "email",
      "customer_phone": "phone"
    },
    "legacy_deal": {
      "deal_id": "id",
      "deal_value": "amount",
      "deal_stage": "status",
      "deal_close_date": "closedDate"
    }
  }
}
```

### Migration Execution

#### 1. Pre-Migration Checklist

- [ ] Backup source database
- [ ] Validate target schema
- [ ] Test migration with sample data
- [ ] Schedule migration window
- [ ] Prepare rollback plan

#### 2. Migration Script

```bash
#!/bin/bash
# Migration script

# Set variables
SOURCE_DB="legacy_crm"
TARGET_DB="crm_v_midmarket"
MIGRATION_LOG="/var/log/crm-migration.log"

# Start migration
echo "Starting migration at $(date)" >> $MIGRATION_LOG

# Phase 1: Master data
java -jar data-migration.jar \
  --phase=1 \
  --source-db=$SOURCE_DB \
  --target-db=$TARGET_DB \
  --batch-size=1000 \
  --log-file=$MIGRATION_LOG

# Validate migration
java -jar migration-validator.jar \
  --source-db=$SOURCE_DB \
  --target-db=$TARGET_DB \
  --report-file=migration-validation.json

echo "Migration completed at $(date)" >> $MIGRATION_LOG
```

#### 3. Post-Migration Validation

```sql
-- Validation queries
SELECT 
  (SELECT COUNT(*) FROM legacy_customers) as legacy_count,
  (SELECT COUNT(*) FROM customers) as new_count,
  (SELECT COUNT(*) FROM customers WHERE migrated_from IS NOT NULL) as migrated_count;

-- Data integrity checks
SELECT 
  c.email,
  c.name,
  lc.customer_email,
  lc.customer_name
FROM customers c
JOIN legacy_customers lc ON c.email = lc.customer_email
WHERE c.name != lc.customer_name;
```

## User Training

### Training Plan

#### 1. User Roles and Training Modules

| Role | Training Duration | Key Topics |
|------|------------------|------------|
| Sales Rep | 4 hours | Lead management, deal tracking, activity logging |
| Sales Manager | 6 hours | Pipeline management, team oversight, reporting |
| Customer Success | 4 hours | Customer health, engagement tracking, support |
| Administrator | 8 hours | System configuration, user management, troubleshooting |

#### 2. Training Materials

**User Manuals:**
- Getting Started Guide
- Feature Reference Manual
- Best Practices Guide
- Troubleshooting FAQ

**Video Tutorials:**
- System Overview (15 min)
- Daily Workflow (20 min)
- Advanced Features (30 min)
- Admin Functions (45 min)

#### 3. Training Schedule

```bash
# Week 1: Basic Training
Day 1: System overview and navigation
Day 2: Core CRM functionality
Day 3: User-specific workflows
Day 4: Hands-on practice

# Week 2: Advanced Training
Day 5: Reporting and analytics
Day 6: Customization and configuration
Day 7: Integration and automation
Day 8: Admin functions and troubleshooting
```

### Training Resources

#### 1. Online Training Portal

```properties
# Training portal configuration
crm.training.enabled=true
crm.training.portal-url=https://training.yourcompany.com
crm.training.progress-tracking=true
crm.training.certification-required=true
```

#### 2. In-App Guidance

```javascript
// In-app tooltips and walkthroughs
const trainingConfig = {
  enableTooltips: true,
  enableWalkthroughs: true,
  contextualHelp: true,
  progressTracking: true
};
```

## Maintenance

### Routine Maintenance

#### 1. Daily Tasks

```bash
#!/bin/bash
# Daily maintenance script

# Log rotation
logrotate /etc/logrotate.d/crm-v

# Database backup
pg_dump crm_v_midmarket | gzip > /backups/crm-v-$(date +%Y%m%d).sql.gz

# System health check
curl -f http://localhost:8080/actuator/health || alert-admin

# Clean up temporary files
find /tmp/crm-v -type f -mtime +1 -delete
```

#### 2. Weekly Tasks

- Review system performance metrics
- Check error logs for issues
- Update security patches
- Validate backup integrity
- Review user feedback

#### 3. Monthly Tasks

- Database maintenance (VACUUM, ANALYZE)
- Security audit
- Performance tuning
- Feature usage analysis
- Capacity planning

### Monitoring

#### 1. System Monitoring

```yaml
# Prometheus configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'crm-v'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
```

#### 2. Alerting

```yaml
# Alert rules
groups:
  - name: crm-v-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseConnectionFailure
        expr: up{job="database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
```

### Backup and Recovery

#### 1. Backup Strategy

```bash
#!/bin/bash
# Comprehensive backup script

BACKUP_DIR="/backups/crm-v"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump crm_v_midmarket | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# File backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/crm-v/uploads

# Configuration backup
cp /opt/crm-v/backend/config/application.properties $BACKUP_DIR/config_$DATE.properties

# Upload to cloud storage
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/crm-v/
```

#### 2. Recovery Procedures

```bash
# Database recovery
gunzip -c /backups/crm-v/db_20240115.sql.gz | psql crm_v_midmarket

# File recovery
tar -xzf /backups/crm-v/files_20240115.tar.gz -C /

# Configuration recovery
cp /backups/crm-v/config_20240115.properties /opt/crm-v/backend/config/
```

## Troubleshooting

### Common Issues

#### 1. Performance Issues

**Symptoms:**
- Slow page loads
- Timeout errors
- High CPU usage

**Solutions:**
```bash
# Check database connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Clear cache
redis-cli FLUSHALL
```

#### 2. Login Issues

**Symptoms:**
- Unable to login
- Invalid credentials error
- Session timeout

**Solutions:**
```bash
# Check user status
SELECT * FROM users WHERE email = 'user@example.com';

# Reset password
UPDATE users SET password = '$2a$10$...' WHERE email = 'user@example.com';

# Clear session cache
redis-cli DEL "session:*"
```

#### 3. Email Issues

**Symptoms:**
- Emails not sending
- Bounce notifications
- SMTP errors

**Solutions:**
```bash
# Test email configuration
telnet smtp.yourcompany.com 587

# Check email logs
tail -f /var/log/crm-v/email.log

# Verify SMTP credentials
echo "Test email" | mail -s "Test" test@example.com
```

### Debug Mode

```properties
# Enable debug logging
logging.level.com.everx.crm=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

## Best Practices

### Security

#### 1. Access Control

- Implement principle of least privilege
- Regular security audits
- Multi-factor authentication
- Session timeout configuration
- IP whitelisting for admin access

#### 2. Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Regular security updates
- Data anonymization for analytics
- GDPR compliance measures

### Performance

#### 1. Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_activities_date ON activities(created_date);

-- Partition large tables
CREATE TABLE activities_2024 PARTITION OF activities
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

#### 2. Caching Strategy

```properties
# Cache configuration
spring.cache.cache-names=users,customers,deals,reports
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false
```

### Scalability

#### 1. Horizontal Scaling

- Load balancer configuration
- Database read replicas
- Microservices architecture
- Container orchestration

#### 2. Vertical Scaling

- Resource monitoring
- Performance tuning
- Capacity planning
- Auto-scaling configuration

## Support

### Contact Information

- **Technical Support**: support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com/crm-v
- **Community Forum**: https://community.yourcompany.com
- **Status Page**: https://status.yourcompany.com

### Service Level Agreement (SLA)

- **Uptime**: 99.5% (excluding planned maintenance)
- **Response Time**: 
  - Critical: 1 hour
  - High: 4 hours
  - Medium: 24 hours
  - Low: 72 hours
- **Resolution Time**:
  - Critical: 4 hours
  - High: 24 hours
  - Medium: 72 hours
  - Low: 5 business days

---

*This guide is regularly updated. For the latest version, visit our documentation portal.*
