# Troubleshooting Guide for Mid-Market Deployment

## Overview

This guide provides comprehensive troubleshooting steps for common issues encountered in mid-market deployments of CRM-V. It covers system diagnostics, error resolution, and performance optimization.

## Quick Diagnostic Commands

### System Health Check

```bash
#!/bin/bash
# quick-health-check.sh

echo "=== CRM-V System Health Check ==="
echo "Timestamp: $(date)"
echo ""

# Check application status
echo "1. Application Status:"
systemctl is-active crm-v || echo "❌ CRM-V service is not running"
systemctl is-active nginx || echo "❌ Nginx service is not running"
systemctl is-active postgresql || echo "❌ PostgreSQL service is not running"
systemctl is-active redis || echo "❌ Redis service is not running"
echo ""

# Check resource usage
echo "2. Resource Usage:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%"), $3/$2 * 100.0}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo ""

# Check application health endpoint
echo "3. Application Health:"
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Application health endpoint responding"
else
    echo "❌ Application health endpoint not responding"
fi
echo ""

# Check database connectivity
echo "4. Database Connectivity:"
if sudo -u postgres psql -d crm_v_midmarket -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi
echo ""

# Check Redis connectivity
echo "5. Redis Connectivity:"
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful"
else
    echo "❌ Redis connection failed"
fi
echo ""

echo "=== Health Check Complete ==="
```

### Log Analysis Commands

```bash
# Application logs
sudo journalctl -u crm-v -f --since "1 hour ago"

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# System logs
sudo journalctl -f --since "1 hour ago"
```

## Common Issues and Solutions

### 1. Application Startup Issues

#### Problem: Application fails to start

**Symptoms:**
- CRM-V service shows "failed" status
- Application logs show startup errors
- Health endpoint not responding

**Diagnostic Steps:**
```bash
# Check service status
sudo systemctl status crm-v

# View application logs
sudo journalctl -u crm-v -n 50

# Check configuration file
sudo -u crm-v java -jar /opt/crm-v/app/backend/target/crm-v-*.jar --spring.config.location=file:/opt/crm-v/app/backend/src/main/resources/application.properties --debug
```

**Common Causes and Solutions:**

1. **Port Already in Use**
```bash
# Check what's using port 8080
sudo netstat -tlnp | grep :8080

# Kill the process
sudo kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

2. **Database Connection Failed**
```bash
# Test database connection
sudo -u postgres psql -h localhost -U crm_v_user -d crm_v_midmarket

# Check database credentials
grep -E "(spring.datasource.username|spring.datasource.password)" /opt/crm-v/app/backend/src/main/resources/application.properties

# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Memory Issues**
```bash
# Check available memory
free -h

# Increase JVM heap size
export JAVA_OPTS="-Xmx2g -Xms1g"

# Or add to application.properties
java -Xmx2g -Xms1g -jar crm-v.jar
```

4. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R crm-v:crm-v /opt/crm-v
sudo chmod -R 755 /opt/crm-v

# Check log directory permissions
sudo chown -R crm-v:adm /var/log/crm-v
sudo chmod -R 755 /var/log/crm-v
```

### 2. Database Performance Issues

#### Problem: Slow database queries

**Symptoms:**
- Application response times are slow
- Database CPU usage is high
- Timeouts in application logs

**Diagnostic Steps:**
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

**Solutions:**

1. **Add Missing Indexes**
```sql
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
CREATE INDEX CONCURRENTLY idx_deals_status ON deals(status);
CREATE INDEX CONCURRENTLY idx_activities_customer_id ON activities(customer_id);

-- Create composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_deals_customer_status ON deals(customer_id, status);
```

2. **Optimize Database Configuration**
```sql
-- Update PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
SELECT pg_reload_conf();
```

3. **Database Maintenance**
```bash
# Run VACUUM and ANALYZE
sudo -u postgres psql -d crm_v_midmarket -c "VACUUM ANALYZE;"

# Rebuild indexes
sudo -u postgres psql -d crm_v_midmarket -c "REINDEX DATABASE crm_v_midmarket;"
```

### 3. Memory and Performance Issues

#### Problem: High memory usage

**Symptoms:**
- System becomes unresponsive
- OutOfMemoryError in application logs
- High swap usage

**Diagnostic Steps:**
```bash
# Check memory usage
free -h
top -o %MEM

# Check Java heap usage
jstat -gc <PID>

# Check memory leaks
jmap -histo <PID> | head -20
```

**Solutions:**

1. **Increase JVM Heap Size**
```bash
# Update service file
sudo nano /etc/systemd/system/crm-v.service

# Add Java options
ExecStart=/usr/bin/java -Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar target/crm-v-2.0.0.jar

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart crm-v
```

2. **Enable Garbage Collection Logging**
```bash
# Add GC logging options
-XX:+PrintGCDetails
-XX:+PrintGCTimeStamps
-XX:+PrintGCDateStamps
-Xloggc:/var/log/crm-v/gc.log
```

3. **Monitor Memory Usage**
```bash
# Create memory monitoring script
#!/bin/bash
while true; do
    echo "$(date): $(free -h | grep Mem)" >> /var/log/crm-v/memory.log
    sleep 300
done
```

### 4. Network and Connectivity Issues

#### Problem: Cannot access application from browser

**Symptoms:**
- Connection refused error
- Timeout errors
- SSL certificate errors

**Diagnostic Steps:**
```bash
# Check if application is listening
sudo netstat -tlnp | grep :8080

# Test local connection
curl -I http://localhost:8080/actuator/health

# Check firewall status
sudo ufw status
sudo iptables -L

# Check Nginx configuration
sudo nginx -t
sudo systemctl status nginx
```

**Solutions:**

1. **Fix Firewall Issues**
```bash
# Allow necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp

# Reset firewall if needed
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Fix Nginx Configuration**
```bash
# Test configuration
sudo nginx -t

# Check syntax errors
sudo nginx -T

# Restart Nginx
sudo systemctl restart nginx
```

3. **Fix SSL Certificate Issues**
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/crm-v.crt -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 5. Email and Notification Issues

#### Problem: Emails not sending

**Symptoms:**
- Users not receiving password reset emails
- Notification failures in logs
- SMTP connection errors

**Diagnostic Steps:**
```bash
# Test SMTP connection
telnet smtp.yourcompany.com 587

# Check email configuration
grep -E "(spring.mail|crm.email)" /opt/crm-v/app/backend/src/main/resources/application.properties

# Check email logs
sudo journalctl -u crm-v | grep -i email
```

**Solutions:**

1. **Fix SMTP Configuration**
```properties
# Update email settings
spring.mail.host=smtp.yourcompany.com
spring.mail.port=587
spring.mail.username=noreply@yourcompany.com
spring.mail.password=your-email-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

2. **Test Email Configuration**
```bash
# Send test email
curl -X POST http://localhost:8080/api/system/test-email \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -d '{
        "to": "test@example.com",
        "subject": "Test Email",
        "body": "This is a test email"
    }'
```

### 6. File Upload Issues

#### Problem: File uploads failing

**Symptoms:**
- Upload progress gets stuck
- File size limit errors
- Permission denied errors

**Diagnostic Steps:**
```bash
# Check upload directory permissions
ls -la /opt/crm-v/uploads/

# Check disk space
df -h /opt/crm-v/uploads/

# Check Nginx upload limits
grep -E "(client_max_body_size|max_file_size)" /etc/nginx/nginx.conf
```

**Solutions:**

1. **Fix Permissions**
```bash
# Fix upload directory permissions
sudo chown -R crm-v:www-data /opt/crm-v/uploads/
sudo chmod -R 775 /opt/crm-v/uploads/
```

2. **Increase Upload Limits**
```nginx
# Update Nginx configuration
client_max_body_size 50M;
```

```properties
# Update application.properties
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

## Performance Optimization

### Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM customers WHERE email = 'test@example.com';

-- Update table statistics
ANALYZE customers;

-- Rebuild indexes
REINDEX INDEX CONCURRENTLY idx_customers_email;

-- Partition large tables
CREATE TABLE activities_2024 PARTITION OF activities
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Application Optimization

```bash
# Enable application caching
echo "spring.cache.type=redis" >> /opt/crm-v/app/backend/src/main/resources/application.properties

# Tune connection pool
echo "spring.datasource.hikari.maximum-pool-size=30" >> /opt/crm-v/app/backend/src/main/resources/application.properties

# Enable compression
echo "server.compression.enabled=true" >> /opt/crm-v/app/backend/src/main/resources/application.properties
```

### System Optimization

```bash
# Optimize system limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize kernel parameters
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sysctl -p
```

## Monitoring and Alerting

### Setup Monitoring

```bash
# Install Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xzf prometheus-2.40.0.linux-amd64.tar.gz
sudo cp prometheus-2.40.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-2.40.0.linux-amd64/promtool /usr/local/bin/

# Create Prometheus configuration
sudo mkdir -p /etc/prometheus
sudo nano /etc/prometheus/prometheus.yml
```

### Create Alert Rules

```yaml
# /etc/prometheus/crm-v-alerts.yml
groups:
  - name: crm-v-alerts
    rules:
      - alert: ApplicationDown
        expr: up{job="crm-v"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CRM-V application is down"
          
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
```

### Setup Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/crm-v

# Content:
/var/log/crm-v/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 crm-v adm
    postrotate
        systemctl reload crm-v
    endscript
}
```

## Emergency Procedures

### Application Recovery

```bash
#!/bin/bash
# emergency-recovery.sh

echo "Starting emergency recovery procedure..."

# Stop services
sudo systemctl stop crm-v nginx

# Backup current state
sudo cp /opt/crm-v/app/backend/src/main/resources/application.properties /tmp/application.properties.backup

# Restore from last known good configuration
sudo cp /backups/crm-v/config/application_*.properties /opt/crm-v/app/backend/src/main/resources/application.properties

# Clear caches
redis-cli FLUSHALL

# Start services
sudo systemctl start postgresql redis
sleep 10
sudo systemctl start crm-v
sleep 10
sudo systemctl start nginx

# Verify services
systemctl status crm-v nginx postgresql redis
curl -f http://localhost:8080/actuator/health

echo "Emergency recovery completed"
```

### Database Recovery

```bash
#!/bin/bash
# database-recovery.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting database recovery from $BACKUP_FILE..."

# Stop application
sudo systemctl stop crm-v

# Drop existing database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS crm_v_midmarket;"

# Create new database
sudo -u postgres psql -c "CREATE DATABASE crm_v_midmarket OWNER crm_v_user;"

# Restore from backup
gunzip -c $BACKUP_FILE | sudo -u postgres psql crm_v_midmarket

# Start application
sudo systemctl start crm-v

echo "Database recovery completed"
```

## Contact Support

### When to Contact Support

- Critical system failures
- Security incidents
- Data corruption issues
- Performance degradation that can't be resolved
- Unknown errors not covered in this guide

### Information to Provide

1. **System Information**
```bash
# Collect system information
uname -a > support-info.txt
free -h >> support-info.txt
df -h >> support-info.txt
systemctl status crm-v nginx postgresql redis >> support-info.txt
```

2. **Application Logs**
```bash
# Collect recent logs
sudo journalctl -u crm-v --since "1 hour ago" > crm-v-logs.txt
sudo tail -100 /var/log/nginx/error.log > nginx-logs.txt
```

3. **Configuration Files**
```bash
# Collect configuration (remove sensitive data)
sudo cp /opt/crm-v/app/backend/src/main/resources/application.properties config.properties
# Remove passwords and sensitive data before sending
```

### Support Channels

- **Email**: support@yourcompany.com
- **Phone**: +1-555-SUPPORT
- **Chat**: https://support.yourcompany.com/chat
- **Portal**: https://support.yourcompany.com

---

*For additional assistance or to report issues not covered in this guide, please contact our support team.*
