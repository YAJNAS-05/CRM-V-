# Custom Reporting System - Integration & Testing Guide

## Pre-Deployment Checklist

### Database Setup
- [ ] Run Flyway migration: `V999__create_custom_reports.sql`
- [ ] Verify tables created successfully:
  ```sql
  SHOW TABLES LIKE 'custom_%';
  SHOW TABLES LIKE 'widgets%';
  SHOW TABLES LIKE 'report_%';
  ```
- [ ] Verify indexes are created
- [ ] Backup existing database

### Backend Setup
- [ ] Spring Boot dependencies in `pom.xml`:
  ```xml
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <!-- Add for export functionality later -->
  <!-- <dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
  </dependency> -->
  ```

- [ ] Verify all Java classes compiled:
  - CustomReportController.java
  - CustomReportService.java
  - CustomReportServiceImpl.java
  - CustomReport.java (entity)
  - CustomReportRepository.java
  - CustomReportMapper.java
  - Custom DTOs

- [ ] Configure application.yml:
  ```yaml
  spring:
    jpa:
      hibernate:
        ddl-auto: validate
      show-sql: false
      properties:
        hibernate:
          dialect: org.hibernate.dialect.MySQLDialect
  ```

- [ ] Restart Spring Boot application
  ```bash
  cd backend
  mvn clean install
  mvn spring-boot:run
  ```

### Frontend Setup
- [ ] Install dependencies:
  ```bash
  cd frontend
  npm install
  ```

- [ ] Verify all TypeScript files:
  - CustomReportBuilderPage.tsx
  - reportApi.ts (updated with new methods)

- [ ] Check routes in App.tsx:
  ```javascript
  // Routes should include:
  /reports
  /reports/custom
  /reports/custom/:reportId
  /reports/templates
  ```

- [ ] Start development server:
  ```bash
  npm run dev
  ```

## Integration Steps

### 1. Backend Integration

**Step 1: Update Spring Boot Main Application**
```java
// Ensure proper component scanning
@SpringBootApplication
@ComponentScan(basePackages = {
  "com.everx.auth",
  "com.everx.crm.report",
  "com.everx.shared"
})
public class CrmApplication {
  public static void main(String[] args) {
    SpringApplication.run(CrmApplication.class, args);
  }
}
```

**Step 2: Verify Security Configuration**
- CustomReportController endpoints are protected by @PreAuthorize
- Ensure SecurityConfig allows authenticated access

**Step 3: Test API with curl**
```bash
# Get all reports (requires auth token)
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/custom-reports

# Create new report
curl -X POST http://localhost:8080/api/v1/custom-reports \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Report",
    "description": "Test",
    "widgets": []
  }'
```

### 2. Frontend Integration

**Step 1: Verify API Configuration**
- Check `axiosInstance.ts` has correct base URL
- Verify authentication headers are included

**Step 2: Test Report Creation**
1. Navigate to `http://localhost:3000/reports/custom`
2. Create new report with:
   - Name: "Test Report"
   - Description: "Testing the system"
3. Add a metric widget
4. Save report
5. Verify report appears in `/reports` list

**Step 3: Verify Routes**
- [ ] POST `/reports/custom` creates new report
- [ ] GET `/reports/custom/{id}` loads report for editing
- [ ] PUT saves changes
- [ ] DELETE removes report
- [ ] GET `/reports` lists all reports

## Manual Testing Scenarios

### Scenario 1: Create Basic Report
1. Navigate to Reports section
2. Click "New Report"
3. Enter name: "Q4 Sales Summary"
4. Enter description: "Q4 2024 sales analysis"
5. Click "Add Widget"
6. Select "Metric" widget type
7. Set title to "Total Revenue"
8. Click "Save"
9. Verify report is created and appears in list

### Scenario 2: Edit Report
1. Open existing report from list
2. Update report name
3. Add new widget (Chart)
4. Configure chart settings
5. Save changes
6. Verify updates are persisted

### Scenario 3: Export Report
1. Open report
2. Click "Download" button
3. Select format (Excel/CSV/PDF)
4. Verify file downloads
5. Check file content

### Scenario 4: Share Report
1. Open report
2. Click "Share" (when implemented)
3. Add users/roles
4. Verify shared users can view report

### Scenario 5: Delete Report
1. Open report
2. Click delete button
3. Confirm deletion
4. Verify report removed from list

## Unit Testing

### Backend Tests
Create `CustomReportServiceTest.java`:

```java
@SpringBootTest
@Transactional
public class CustomReportServiceTest {

  @Autowired
  private CustomReportService customReportService;

  @MockBean
  private CustomReportRepository customReportRepository;

  @Test
  public void testCreateReport() {
    CustomReportRequest request = CustomReportRequest.builder()
      .name("Test Report")
      .description("Test Description")
      .widgets(new ArrayList<>())
      .build();

    CustomReportDTO result = customReportService.createReport(request, "test-user");

    assertNotNull(result.getId());
    assertEquals("Test Report", result.getName());
    assertEquals("DRAFT", result.getStatus());
    assertEquals("PRIVATE", result.getAccessType());
  }

  @Test
  public void testGetReport() {
    String reportId = "test-id";
    CustomReport report = new CustomReport();
    report.setId(reportId);
    report.setName("Test Report");
    report.setCreatedBy("test-user");

    when(customReportRepository.findById(reportId))
      .thenReturn(Optional.of(report));

    CustomReportDTO result = customReportService.getReport(reportId, "test-user");

    assertNotNull(result);
    assertEquals("Test Report", result.getName());
  }

  @Test
  public void testUpdateReport() {
    String reportId = "test-id";
    CustomReport report = new CustomReport();
    report.setId(reportId);
    report.setName("Original");
    report.setCreatedBy("test-user");

    CustomReportRequest request = CustomReportRequest.builder()
      .name("Updated Name")
      .build();

    when(customReportRepository.findById(reportId))
      .thenReturn(Optional.of(report));
    when(customReportRepository.save(any()))
      .thenReturn(report);

    CustomReportDTO result = customReportService.updateReport(reportId, request, "test-user");

    assertNotNull(result);
  }

  @Test
  public void testDeleteReport() {
    String reportId = "test-id";
    CustomReport report = new CustomReport();
    report.setId(reportId);
    report.setCreatedBy("test-user");

    when(customReportRepository.findById(reportId))
      .thenReturn(Optional.of(report));

    customReportService.deleteReport(reportId, "test-user");

    verify(customReportRepository).delete(report);
  }

  @Test
  public void testValidateWidget() {
    WidgetDTO widget = WidgetDTO.builder()
      .type("chart")
      .title("Sales Chart")
      .config(new HashMap<>())
      .build();

    ValidationResult result = customReportService.validateWidget(widget);

    assertTrue(result.isValid());
    assertTrue(result.getErrors().isEmpty());
  }
}
```

### Frontend Tests
Create `CustomReportBuilderPage.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomReportBuilderPage } from './CustomReportBuilderPage'
import * as reportApi from '../../api/reportApi'

jest.mock('../../api/reportApi')
jest.mock('react-router-dom')

describe('CustomReportBuilderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders report builder', () => {
    render(<CustomReportBuilderPage />)
    expect(screen.getByText('New Custom Report')).toBeInTheDocument()
  })

  test('adds widget', async () => {
    render(<CustomReportBuilderPage />)
    
    const addButton = screen.getByText('Add Widget')
    fireEvent.click(addButton)

    const chartButton = screen.getByText('chart')
    fireEvent.click(chartButton)

    await waitFor(() => {
      expect(screen.getByText('New chart')).toBeInTheDocument()
    })
  })

  test('saves report', async () => {
    ;(reportApi.createCustomReport as jest.Mock).mockResolvedValue({
      id: 'test-id'
    })

    render(<CustomReportBuilderPage />)

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(reportApi.createCustomReport).toHaveBeenCalled()
    })
  })
})
```

## API Testing with Postman

### Create Collection
1. Open Postman
2. Create new collection "Custom Reports API"
3. Add environment variables:
   - `base_url`: http://localhost:8080
   - `auth_token`: {your_token}
   - `report_id`: {saved_report_id}

### Test Endpoints
```
POST {{base_url}}/api/v1/custom-reports
Headers: Authorization: Bearer {{auth_token}}
Body: {
  "name": "Test Report",
  "description": "Testing",
  "widgets": []
}

GET {{base_url}}/api/v1/custom-reports
Headers: Authorization: Bearer {{auth_token}}

GET {{base_url}}/api/v1/custom-reports/{{report_id}}
Headers: Authorization: Bearer {{auth_token}}

PUT {{base_url}}/api/v1/custom-reports/{{report_id}}
Headers: Authorization: Bearer {{auth_token}}
Body: {
  "name": "Updated Name",
  "description": "Updated",
  "widgets": []
}

DELETE {{base_url}}/api/v1/custom-reports/{{report_id}}
Headers: Authorization: Bearer {{auth_token}}
```

## Performance Testing

### Load Testing with JMeter
1. Create test plan with following scenarios:
   - 10 concurrent users creating reports
   - 50 concurrent users listing reports
   - 20 concurrent users executing reports
2. Set ramp-up time: 2 seconds
3. Run for 5 minutes
4. Verify response times < 1 second

### Database Performance
```sql
-- Check index usage
EXPLAIN SELECT * FROM custom_reports WHERE created_by = 'user@example.com';

-- Check query performance
SELECT query_time, query, rows_examined FROM mysql.slow_log 
WHERE db = 'crm_db' 
ORDER BY query_time DESC LIMIT 10;
```

## Deployment Steps

1. **Backup Production Database**
   ```bash
   mysqldump -u [user] -p [database] > backup_$(date +%Y%m%d).sql
   ```

2. **Run Migrations**
   - Flyway automatically runs on startup
   - Verify migration V999 completed successfully

3. **Deploy Backend**
   ```bash
   docker build -t crm-backend:latest .
   docker push crm-backend:latest
   kubectl apply -f k8s/backend-deployment.yaml
   ```

4. **Deploy Frontend**
   ```bash
   npm run build
   npm run deploy
   ```

5. **Verify Deployment**
   - Test API endpoints
   - Verify reports can be created
   - Check logs for errors
   - Monitor database performance

## Rollback Plan

If deployment fails:
1. Restore database from backup
2. Revert to previous backend version
3. Clear frontend cache
4. Notify users of service restoration

---

**Last Updated:** January 2025
**Version:** 1.0.0
