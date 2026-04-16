# Custom Widget-Based Reporting System - Quick Reference

## Files Created/Modified

### Frontend Files

#### New Components
| File | Purpose | Location |
|------|---------|----------|
| CustomReportBuilderPage.tsx | Main UI for creating/editing reports | `/frontend/src/pages/reports/` |

#### Modified Files
| File | Changes | Location |
|------|---------|----------|
| App.tsx | Updated routes, removed Freshworks dashboard | `/frontend/src/` |
| reportApi.ts | Added custom report API methods | `/frontend/src/api/` |

### Backend Files

#### Controllers
| File | Purpose | Package |
|------|---------|---------|
| CustomReportController.java | REST API endpoints | `com.everx.crm.report` |

#### Services
| File | Purpose | Package |
|------|---------|---------|
| CustomReportService.java | Service interface | `com.everx.crm.report` |
| CustomReportServiceImpl.java | Service implementation | `com.everx.crm.report` |

#### Entities & Repository
| File | Purpose | Package |
|------|---------|---------|
| CustomReport.java | JPA entities (CustomReport, Widget) | `com.everx.crm.report` |
| CustomReportRepository.java | Data access repository | `com.everx.crm.report` |
| CustomReportMapper.java | Entity-DTO mapper | `com.everx.crm.report` |

#### DTOs
| File | Purpose | Package |
|------|---------|---------|
| CustomReportDTOs.java | All DTO classes | `com.everx.crm.report` |

#### Database
| File | Purpose | Location |
|------|---------|----------|
| V999__create_custom_reports.sql | Database migration | `/backend/src/main/resources/db/migration/` |

### Documentation Files
| File | Purpose | Location |
|------|---------|----------|
| CUSTOM_REPORTING_GUIDE.md | Architecture & API documentation | `/` |
| TESTING_AND_INTEGRATION_GUIDE.md | Integration & testing guide | `/` |

## File Size Reference
```
CustomReportBuilderPage.tsx: ~4.5 KB
reportApi.ts (updated): +2 KB
CustomReportController.java: ~5 KB
CustomReportServiceImpl.java: ~7 KB
CustomReport.java: ~2.5 KB
CustomReportRepository.java: ~2 KB
CustomReportMapper.java: ~2.5 KB
CustomReportDTOs.java: ~6 KB
V999__create_custom_reports.sql: ~3 KB
----------
Total: ~35.5 KB
```

## Key Classes & Interfaces

### Frontend
```typescript
interface CustomReport {
  id?: string
  name: string
  description: string
  widgets: Widget[]
  refreshRate?: number
  filters?: any
}

interface Widget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'text'
  title: string
  config: any
  position: number
}

class CustomReportBuilderPage {
  - handleSaveReport()
  - handleAddWidget()
  - handleRemoveWidget()
  - handleUpdateWidget()
  - handleDownloadReport()
  - handleDuplicateReport()
}
```

### Backend
```java
@RestController
class CustomReportController {
  GET /api/v1/custom-reports
  POST /api/v1/custom-reports
  GET /api/v1/custom-reports/{reportId}
  PUT /api/v1/custom-reports/{reportId}
  DELETE /api/v1/custom-reports/{reportId}
  POST /api/v1/custom-reports/{reportId}/execute
  POST /api/v1/custom-reports/{reportId}/export
  POST /api/v1/custom-reports/{reportId}/duplicate
  POST /api/v1/custom-reports/{reportId}/share
  GET /api/v1/custom-reports/{reportId}/access
}

interface CustomReportService {
  - listReports()
  - getReport()
  - createReport()
  - updateReport()
  - deleteReport()
  - executeReport()
  - exportReport()
  - shareReport()
  - getWidgetOptions()
  - validateWidget()
}

@Entity
class CustomReport {
  - id: String
  - name: String
  - widgets: List<Widget>
  - status: String (ACTIVE, DRAFT, ARCHIVED)
  - accessType: String (PRIVATE, SHARED, PUBLIC)
  - createdBy: String
  - createdAt: LocalDateTime
}

@Entity
class Widget {
  - id: String
  - type: String (chart, metric, table, text)
  - title: String
  - config: Map<String, Object>
  - position: int
}
```

## Database Schema

### Tables Created
1. **custom_reports** - Main report configuration
2. **widgets** - Widget definitions
3. **report_access** - Share permissions
4. **report_execution_log** - Execution history

### Indexes
- `idx_created_by` - Fast user queries
- `idx_status` - Filter by status
- `idx_access_type` - Filter by access type
- `idx_created_at` - Sort by date
- `idx_report_id` - Widget-Report relationship
- `idx_type` - Filter by widget type

## Routes

### Frontend Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/reports` | ReportListPage | View all reports |
| `/reports/custom` | CustomReportBuilderPage | Create new report |
| `/reports/custom/:reportId` | CustomReportBuilderPage | Edit existing report |
| `/reports/builder` | ReportBuilderPage | Template builder |
| `/reports/templates` | TemplateReportPage | View templates |

## API Endpoints Summary

### Report Management
```
GET    /api/v1/custom-reports                    # List reports
POST   /api/v1/custom-reports                    # Create report
GET    /api/v1/custom-reports/{reportId}         # Get report
PUT    /api/v1/custom-reports/{reportId}         # Update report
DELETE /api/v1/custom-reports/{reportId}         # Delete report
```

### Report Execution & Export
```
POST   /api/v1/custom-reports/{reportId}/execute # Execute report
POST   /api/v1/custom-reports/{reportId}/export  # Export report
```

### Report Operations
```
POST   /api/v1/custom-reports/{reportId}/duplicate # Duplicate report
POST   /api/v1/custom-reports/{reportId}/share     # Share report
GET    /api/v1/custom-reports/{reportId}/access    # Get access info
```

### Widget Management
```
GET    /api/v1/custom-reports/widgets/{type}/options # Widget options
POST   /api/v1/custom-reports/widgets/validate       # Validate widget
```

## Widget Types & Configurations

### Chart Widget
```json
{
  "type": "chart",
  "chartTypes": ["bar", "line", "pie", "area", "scatter"]
}
```

### Metric Widget
```json
{
  "type": "metric",
  "formats": ["number", "percentage", "currency"],
  "aggregations": ["sum", "avg", "count", "min", "max"]
}
```

### Table Widget
```json
{
  "type": "table",
  "rowsPerPage": [10, 25, 50, 100],
  "features": ["sorting", "filtering"]
}
```

### Text Widget
```json
{
  "type": "text",
  "formats": ["plain", "html", "markdown"]
}
```

## Environment Variables

### Backend (.env or application.yml)
```yaml
SPRING_JPA_HIBERNATE_DDL_AUTO: validate
SPRING_JPA_SHOW_SQL: false
DATABASE_URL: jdbc:mysql://localhost:3306/crm_db
DATABASE_USERNAME: root
DATABASE_PASSWORD: password
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_TOKEN_KEY=auth_token
```

## Common Usage Patterns

### Create Report
```typescript
const report = await reportApi.createCustomReport({
  name: "Q4 Sales",
  description: "Q4 Analysis",
  widgets: [
    { type: "metric", title: "Revenue", config: {...} },
    { type: "chart", title: "Trend", config: {...} }
  ]
})
```

### Execute Report with Filters
```typescript
const result = await reportApi.executeCustomReport(reportId, {
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  region: "North America"
})
```

### Export Report
```typescript
const data = await reportApi.exportCustomReport(reportId, "EXCEL")
// Handle file download
```

### Share Report
```typescript
await reportApi.shareReport(reportId, {
  userIds: ["user1@example.com"],
  accessLevel: "VIEW"
})
```

## Security & Permissions

### Protected Endpoints
All endpoints require authentication (Bearer token)

### Role-Based Access
- ADMIN - Full access
- SALES_MANAGER - Create/manage sales reports
- FINANCE_MANAGER - Create/manage finance reports

### Data Isolation
- Users can only access reports they created
- Shared reports visible to authorized users/roles
- Public reports visible to all authenticated users

## Performance Tips

1. **Limit widget count** - 5-10 widgets per report recommended
2. **Use filters** - Reduce dataset size with date ranges
3. **Cache queries** - Reports with same filters share results
4. **Pagination** - Use in table widgets for large datasets
5. **Refresh interval** - Set higher for heavy reports (10+ minutes)

## Troubleshooting Commands

### Check Backend Service
```bash
# Health check
curl http://localhost:8080/actuator/health

# Test API
curl -H "Authorization: Bearer {TOKEN}" \
  http://localhost:8080/api/v1/custom-reports
```

### Check Database
```sql
-- Verify tables
SHOW TABLES LIKE 'custom_%';

-- Check sample data
SELECT * FROM custom_reports LIMIT 5;

-- Verify indexes
SHOW INDEX FROM custom_reports;
```

### Check Frontend
```bash
# Error logs
open browser console (F12)

# Network requests
Network tab in Dev Tools

# LocalStorage/SessionStorage
Application tab > Storage
```

## Migration Checklist

- [ ] Database: Tables created
- [ ] Database: Indexes verified
- [ ] Backend: Compile successful
- [ ] Backend: Start without errors
- [ ] Frontend: Build successful
- [ ] Frontend: Routes working
- [ ] API: Endpoints accessible
- [ ] Security: Auth working
- [ ] UI: Reports can be created
- [ ] Data: Reports persist correctly
- [ ] Export: Download functional
- [ ] Sharing: Access control working

## Support Resources

1. **Documentation**
   - `CUSTOM_REPORTING_GUIDE.md` - Full guide
   - `TESTING_AND_INTEGRATION_GUIDE.md` - Testing guide

2. **Code Examples**
   - Frontend: `CustomReportBuilderPage.tsx`
   - Backend: `CustomReportServiceImpl.java`
   - API: `reportApi.ts`

3. **Databases**
   - Migration: `V999__create_custom_reports.sql`
   - Schema: Documented in guide

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team
