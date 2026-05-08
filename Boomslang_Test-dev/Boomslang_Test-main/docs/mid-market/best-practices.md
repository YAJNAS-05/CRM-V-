# Best Practices Guide for Mid-Market Deployment

## Overview

This guide outlines best practices for deploying, managing, and optimizing CRM-V in mid-market environments. Following these practices ensures optimal performance, security, and maintainability.

## Security Best Practices

### Access Control

#### 1. Principle of Least Privilege

```bash
# Create dedicated service accounts
sudo useradd -r -s /bin/false crm-v-app
sudo useradd -r -s /bin/false crm-v-db

# Assign minimal required permissions
sudo setfacl -R -m u:crm-v-app:rw /opt/crm-v/uploads
sudo setfacl -R -m u:crm-v-app:rw /var/log/crm-v
```

#### 2. Multi-Factor Authentication

```properties
# Enable MFA for admin accounts
security.mfa.enabled=true
security.mfa.required-for-roles=ADMIN,MANAGER
security.mfa.backup-codes.enabled=true
security.mfa.session-timeout=3600
```

#### 3. Session Management

```properties
# Secure session configuration
server.servlet.session.timeout=1800
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=strict
```

### Data Protection

#### 1. Encryption at Rest

```sql
-- Enable transparent data encryption (PostgreSQL)
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
SELECT pg_reload_conf();
```

#### 2. Encryption in Transit

```nginx
# Force HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

#### 3. Data Anonymization

```java
// Implement data masking for sensitive fields
@Entity
public class Customer {
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    // Mask sensitive data in logs
    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", email='" + maskEmail(email) + '\'' +
                ", phone='" + maskPhone(phone) + '\'' +
                '}';
    }
}
```

### Network Security

#### 1. Firewall Configuration

```bash
# Configure UFW for minimal exposure
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Block suspicious IPs
sudo ufw deny from 192.168.1.100
```

#### 2. Intrusion Detection

```bash
# Install and configure fail2ban
sudo apt install fail2ban

# Configure fail2ban for CRM-V
sudo nano /etc/fail2ban/jail.local
```

```ini
[crm-v-auth]
enabled = true
port = http,https
filter = crm-v-auth
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
findtime = 600
```

#### 3. Rate Limiting

```nginx
# Implement rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

server {
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:8080;
    }
    
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:8080;
    }
}
```

## Performance Best Practices

### Database Optimization

#### 1. Indexing Strategy

```sql
-- Create strategic indexes
CREATE INDEX CONCURRENTLY idx_customers_email_active ON customers(email) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY idx_deals_status_value ON deals(status, amount) WHERE status IN ('OPEN', 'NEGOTIATING');
CREATE INDEX CONCURRENTLY idx_activities_date_type ON activities(created_date, activity_type);

-- Monitor index usage
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

#### 2. Query Optimization

```sql
-- Use EXPLAIN ANALYZE for query tuning
EXPLAIN ANALYZE 
SELECT c.*, COUNT(a.id) as activity_count
FROM customers c
LEFT JOIN activities a ON c.id = a.customer_id
WHERE c.status = 'ACTIVE'
GROUP BY c.id
ORDER BY c.created_date DESC
LIMIT 50;

-- Optimize with proper JOINs and indexes
```

#### 3. Connection Pooling

```properties
# Optimize HikariCP settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.leak-detection-threshold=60000
```

### Application Performance

#### 1. Caching Strategy

```properties
# Multi-level caching
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false

# Cache specific data
spring.cache.cache-names=users,customers,deals,reports,dashboards
```

```java
// Implement caching annotations
@Cacheable(value = "customers", key = "#id")
public Customer getCustomerById(Long id) {
    return customerRepository.findById(id).orElse(null);
}

@CacheEvict(value = "customers", key = "#customer.id")
public Customer updateCustomer(Customer customer) {
    return customerRepository.save(customer);
}
```

#### 2. Lazy Loading

```java
// Use lazy loading for large collections
@Entity
public class Customer {
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "customer")
    private List<Activity> activities;
    
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "customer")
    private List<Deal> deals;
}
```

#### 3. Pagination

```java
// Implement pagination for large datasets
@GetMapping("/customers")
public Page<Customer> getCustomers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "name") String sortBy) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    return customerService.findAll(pageable);
}
```

### Frontend Optimization

#### 1. Code Splitting

```javascript
// Implement lazy loading for components
const CustomerDashboard = React.lazy(() => import('./components/CustomerDashboard'));
const Reports = React.lazy(() => import('./components/Reports'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/reports" element={<Reports />} />
            </Routes>
        </Suspense>
    );
}
```

#### 2. Virtual Scrolling

```javascript
// Use virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const CustomerList = ({ customers }) => (
    <List
        height={600}
        itemCount={customers.length}
        itemSize={50}
        itemData={customers}
    >
        {({ index, style, data }) => (
            <div style={style}>
                <CustomerCard customer={data[index]} />
            </div>
        )}
    </List>
);
```

#### 3. Image Optimization

```javascript
// Implement lazy loading for images
const LazyImage = ({ src, alt, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsLoaded(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} {...props}>
            {isLoaded && <img src={src} alt={alt} />}
        </div>
    );
};
```

## Monitoring and Maintenance

### Proactive Monitoring

#### 1. Health Checks

```java
// Implement comprehensive health checks
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // Check database connectivity
        // Check external services
        // Check disk space
        // Check memory usage
        
        if (allSystemsHealthy()) {
            return Health.up()
                .withDetail("database", "Available")
                .withDetail("redis", "Available")
                .withDetail("disk", "85% used")
                .build();
        } else {
            return Health.down()
                .withDetail("error", "Database connection failed")
                .build();
        }
    }
}
```

#### 2. Metrics Collection

```java
// Implement custom metrics
@Component
public class CustomMetrics {
    
    private final Counter userLoginCounter;
    private final Timer apiResponseTimer;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.userLoginCounter = Counter.builder("user.logins")
            .description("Total user logins")
            .register(meterRegistry);
            
        this.apiResponseTimer = Timer.builder("api.response.time")
            .description("API response time")
            .register(meterRegistry);
    }
    
    public void recordUserLogin() {
        userLoginCounter.increment();
    }
    
    public void recordApiResponseTime(Duration duration) {
        apiResponseTimer.record(duration);
    }
}
```

#### 3. Alerting

```yaml
# Prometheus alerting rules
groups:
  - name: crm-v-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
          
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 150
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database has {{ $value }} active connections"
```

### Regular Maintenance

#### 1. Database Maintenance

```bash
#!/bin/bash
# database-maintenance.sh

# Weekly maintenance script
echo "Starting database maintenance..."

# VACUUM and ANALYZE
sudo -u postgres psql -d crm_v_midmarket -c "VACUUM ANALYZE;"

# Rebuild indexes
sudo -u postgres psql -d crm_v_midmarket -c "REINDEX DATABASE crm_v_midmarket;"

# Update statistics
sudo -u postgres psql -d crm_v_midmarket -c "UPDATE pg_statistic SET stadistinct = 0;"

# Check table bloat
sudo -u postgres psql -d crm_v_midmarket -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_live_tuples(c.oid) as live_tuples,
    pg_stat_get_dead_tuples(c.oid) as dead_tuples
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE relkind = 'r' AND n.nspname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

echo "Database maintenance completed"
```

#### 2. Log Management

```bash
#!/bin/bash
# log-management.sh

# Rotate and compress logs
find /var/log/crm-v -name "*.log" -mtime +7 -exec gzip {} \;
find /var/log/crm-v -name "*.log.gz" -mtime +30 -delete

# Clean old application logs
journalctl --vacuum-time=30d

# Archive important logs
tar -czf /backups/logs/crm-v-logs-$(date +%Y%m%d).tar.gz /var/log/crm-v/*.log
```

#### 3. Backup Verification

```bash
#!/bin/bash
# backup-verification.sh

BACKUP_DIR="/backups/crm-v"
DATE=$(date +%Y%m%d)

# Verify database backup
if gunzip -t $BACKUP_DIR/db_$DATE.sql.gz; then
    echo "✓ Database backup is valid"
else
    echo "✗ Database backup is corrupted"
    exit 1
fi

# Verify file backup
if tar -tzf $BACKUP_DIR/files_$DATE.tar.gz > /dev/null; then
    echo "✓ File backup is valid"
else
    echo "✗ File backup is corrupted"
    exit 1
fi

# Test restore on staging environment
echo "Testing backup restore on staging..."
# Implement restore test logic

echo "Backup verification completed"
```

## Scalability Best Practices

### Horizontal Scaling

#### 1. Load Balancing

```nginx
# Configure multiple application servers
upstream crm_v_backend {
    server 10.0.1.10:8080 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:8080 weight=1 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:8080 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    location /api {
        proxy_pass http://crm_v_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. Database Replication

```sql
-- Set up read replicas
-- Primary server configuration
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 64;
SELECT pg_reload_conf();

-- Create replication user
CREATE USER replicator REPLICATION LOGIN CONNECTION LIMIT 3 ENCRYPTED PASSWORD 'replicator_password';
```

#### 3. Session Sharing

```properties
# Configure Redis for session sharing
spring.session.store-type=redis
spring.session.redis.namespace=spring:session
spring.session.timeout=1800
```

### Vertical Scaling

#### 1. Resource Optimization

```bash
# Monitor resource usage
top -p $(pgrep java)
iostat -x 1
netstat -i

# Optimize JVM settings
export JAVA_OPTS="-Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication"
```

#### 2. Connection Pool Tuning

```properties
# Scale connection pool based on resources
spring.datasource.hikari.maximum-pool-size=40
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
```

## Disaster Recovery

### Backup Strategy

#### 1. 3-2-1 Backup Rule

```bash
#!/bin/bash
# comprehensive-backup.sh

# 3 copies of data (1 primary, 2 backups)
# 2 different media types (local, cloud)
# 1 off-site backup

# Local backup
pg_dump crm_v_midmarket | gzip > /backups/local/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Network backup
scp /backups/local/db_$(date +%Y%m%d_%H%M%S).sql.gz backup-server:/backups/

# Cloud backup
aws s3 cp /backups/local/db_$(date +%Y%m%d_%H%M%S).sql.gz s3://crm-v-backups/
```

#### 2. Point-in-Time Recovery

```bash
#!/bin/bash
# point-in-time-recovery.sh

TARGET_TIME=$1

if [ -z "$TARGET_TIME" ]; then
    echo "Usage: $0 'YYYY-MM-DD HH:MI:SS'"
    exit 1
fi

# Stop application
sudo systemctl stop crm-v

# Restore to point in time
sudo -u postgres pg_ctl start -D /var/lib/postgresql/14/main
sudo -u postgres psql -c "SELECT pg_create_restore_point('before_recovery');"

# Restore from backup and apply WAL logs
gunzip -c /backups/db_latest.sql.gz | sudo -u postgres psql crm_v_midmarket
sudo -u postgres psql -c "SELECT pg_wal_replay_resume();"

# Start application
sudo systemctl start crm-v
```

### High Availability

#### 1. Database Clustering

```sql
-- Configure PostgreSQL streaming replication
-- Primary server
ALTER SYSTEM SET synchronous_commit = on;
ALTER SYSTEM SET synchronous_standby_names = 'standby1,standby2';

-- Standby server configuration
standby_mode = 'on'
primary_conninfo = 'host=primary-db user=replicator password=replicator_password'
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
```

#### 2. Application Redundancy

```yaml
# Docker Compose for high availability
version: '3.8'
services:
  app1:
    image: crm-v:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SERVER_PORT=8080
    networks:
      - crm-network
      
  app2:
    image: crm-v:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SERVER_PORT=8080
    networks:
      - crm-network
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app1
      - app2
    networks:
      - crm-network

networks:
  crm-network:
    driver: bridge
```

## Compliance and Governance

### Data Governance

#### 1. Data Retention Policy

```sql
-- Implement data retention
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete inactive customers after 7 years
    DELETE FROM customers 
    WHERE status = 'INACTIVE' 
    AND updated_date < NOW() - INTERVAL '7 years';
    
    -- Archive activities after 5 years
    DELETE FROM activities 
    WHERE created_date < NOW() - INTERVAL '5 years';
    
    -- Log cleanup actions
    INSERT INTO audit_log (action, table_name, record_count, timestamp)
    VALUES ('CLEANUP', 'customers', (SELECT COUNT(*) FROM customers WHERE status = 'INACTIVE' AND updated_date < NOW() - INTERVAL '7 years'), NOW());
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

#### 2. Audit Logging

```java
// Implement comprehensive audit logging
@Aspect
@Component
public class AuditAspect {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String action = auditable.action();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        try {
            Object result = joinPoint.proceed();
            
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setUsername(username);
            log.setTimestamp(LocalDateTime.now());
            log.setStatus("SUCCESS");
            log.setDetails(joinPoint.getArgs().toString());
            
            auditLogRepository.save(log);
            
            return result;
        } catch (Exception e) {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setUsername(username);
            log.setTimestamp(LocalDateTime.now());
            log.setStatus("FAILED");
            log.setDetails(e.getMessage());
            
            auditLogRepository.save(log);
            
            throw e;
        }
    }
}
```

### Regulatory Compliance

#### 1. GDPR Compliance

```java
// Implement GDPR data subject rights
@Service
public class GdprService {
    
    @Transactional
    public void exportUserData(String email) {
        Customer customer = customerRepository.findByEmail(email);
        UserDataExport export = new UserDataExport();
        
        export.setPersonalInfo(customer.getPersonalData());
        export.setActivities(activityRepository.findByCustomerId(customer.getId()));
        export.setDeals(dealRepository.findByCustomerId(customer.getId()));
        
        // Generate encrypted export file
        generateEncryptedExport(export);
    }
    
    @Transactional
    public void deleteUserData(String email) {
        Customer customer = customerRepository.findByEmail(email);
        
        // Anonymize data instead of hard delete
        customer.setEmail("deleted-" + customer.getId() + "@deleted.com");
        customer.setName("DELETED USER");
        customer.setPhone(null);
        customer.setAddress(null);
        
        customerRepository.save(customer);
        
        // Log deletion request
        auditLogRepository.logDataDeletion(email, "GDPR deletion request");
    }
}
```

#### 2. Access Control Compliance

```java
// Implement role-based access control
@PreAuthorize("hasRole('ADMIN') or (hasRole('MANAGER') and @securityService.canAccessCustomer(principal, #customerId))")
public Customer getCustomer(Long customerId) {
    return customerService.findById(customerId);
}

@PreAuthorize("hasRole('ADMIN') or @securityService.canModifyCustomer(principal, #customerId)")
public Customer updateCustomer(Long customerId, Customer customer) {
    return customerService.update(customerId, customer);
}
```

## Development Best Practices

### Code Quality

#### 1. Code Reviews

```yaml
# GitHub Actions for code quality
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
          distribution: 'adopt'
      - name: Run tests
        run: ./mvnw test
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

#### 2. Testing Strategy

```java
// Implement comprehensive testing
@SpringBootTest
@Transactional
@Rollback
public class CustomerServiceTest {
    
    @Autowired
    private CustomerService customerService;
    
    @Test
    public void testCreateCustomer() {
        Customer customer = new Customer();
        customer.setName("Test Customer");
        customer.setEmail("test@example.com");
        
        Customer created = customerService.create(customer);
        
        assertNotNull(created.getId());
        assertEquals("Test Customer", created.getName());
    }
    
    @Test
    public void testDuplicateEmail() {
        // Test duplicate email validation
    }
}
```

### Deployment Best Practices

#### 1. Blue-Green Deployment

```bash
#!/bin/bash
# blue-green-deployment.sh

CURRENT_ENV=$(curl -s http://your-domain.com/api/info | jq -r '.environment')
NEW_ENV="green"

if [ "$CURRENT_ENV" = "green" ]; then
    NEW_ENV="blue"
fi

echo "Deploying to $NEW_ENV environment..."

# Deploy new version
docker-compose -f docker-compose.$NEW_ENV.yml up -d

# Health check
sleep 30
if curl -f http://$NEW_ENV.your-domain.com/actuator/health; then
    echo "Health check passed, switching traffic..."
    # Update load balancer
    # Switch DNS
else
    echo "Health check failed, rolling back..."
    docker-compose -f docker-compose.$NEW_ENV.yml down
    exit 1
fi
```

#### 2. Infrastructure as Code

```yaml
# Terraform configuration
resource "aws_instance" "crm_v_app" {
    ami           = "ami-0c02fb55956c7d316"
    instance_type = "t3.xlarge"
    
    tags = {
        Name        = "crm-v-app"
        Environment = var.environment
        Project     = "crm-v"
    }
    
    user_data = file("cloud-init.sh")
    
    security_groups = [aws_security_group.crm_v_sg.name]
}

resource "aws_security_group" "crm_v_sg" {
    name        = "crm-v-sg"
    description = "Security group for CRM-V"
    
    ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
```

---

*Following these best practices will ensure a secure, performant, and maintainable CRM-V deployment for your mid-market organization.*
