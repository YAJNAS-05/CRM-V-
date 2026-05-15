# Custom Widget-Based Reporting System - Implementation Guide

## Overview
This document describes the custom widget-based reporting system that has been integrated into the CRM V! application. This system allows users to create dynamic, interactive reports by combining different widget types (charts, metrics, tables, text).

## Architecture

### Component Hierarchy
```
CustomReportBuilderPage
├── Report Header (name, description, controls)
├── Widget Manager
│   ├── Add Widget Button
│   ├── Widget Type Selector
│   └── Widget Grid
│       └── WidgetCard (configurable)
└── Report Settings
    ├── Auto-Refresh Rate
    └── Filter Configuration
```

### Backend Architecture
```
REST Client (Frontend)
    ↓
CustomReportController (REST Endpoints)
    ↓
CustomReportService (Business Logic)
    ↓
CustomReportRepository (Data Access)
    ↓
Database (custom_reports, widgets, report_access)
```

## Getting Started

### Frontend Setup

1. **Access the Custom Report Builder**
   ```
   Navigate to: http://localhost:3000/reports/custom
   ```

2. **Create a New Report**
   - Click "New Report" button
   - Enter report name and description
   - Click "Add Widget" to begin adding widgets

3. **Add Widgets**
   - Select widget type: Chart, Metric, Table, or Text
   - Configure widget settings
   - Save report to persist changes

### Backend Setup

1. **Database Migration**
   - Run Flyway migrations to create tables:
     - `custom_reports` - Main report configuration
     - `widgets` - Widget definitions
     - `report_access` - User access control
     - `report_execution_log` - Execution history

2. **Service Configuration**
   - CustomReportService is auto-wired in controller
   - Repositories are auto-configured by Spring Data JPA
   - All beans are registered in Spring context

3. **API Endpoints**
   - Base URL: `/api/v1/custom-reports`
   - All endpoints require authentication
   - Role-based access control (ADMIN, SALES_MANAGER, FINANCE_MANAGER)

## API Reference

### List Reports
```http
GET /api/v1/custom-reports?page=0&size=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Sales Pipeline",
        "description": "Q4 Sales Overview",
        "widgets": [...],
        "status": "ACTIVE",
        "accessType": "SHARED",
        "createdBy": "user@example.com",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "totalPages": 5,
    "totalElements": 100
  }
}
```

### Create Report
```http
POST /api/v1/custom-reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Q4 Sales Report",
  "description": "Q4 2024 Sales Analysis",
  "widgets": [
    {
      "type": "chart",
      "title": "Sales by Region",
      "config": {
        "chartType": "bar",
        "dataField": "sales",
        "groupBy": "region"
      }
    }
  ],
  "refreshRate": 5,
  "filters": {}
}
```

### Get Report
```http
GET /api/v1/custom-reports/{reportId}
Authorization: Bearer {token}
```

### Update Report
```http
PUT /api/v1/custom-reports/{reportId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Report Name",
  "description": "Updated description",
  "widgets": [...]
}
```

### Execute Report
```http
POST /api/v1/custom-reports/{reportId}/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "region": "North America"
  }
}
```

### Export Report
```http
POST /api/v1/custom-reports/{reportId}/export?format=EXCEL
Authorization: Bearer {token}

{
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31"
  }
}
```

Response: Binary file (Excel/PDF/CSV)

### Share Report
```http
POST /api/v1/custom-reports/{reportId}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "userIds": ["user1@example.com", "user2@example.com"],
  "roleIds": ["SALES_MANAGER"],
  "accessLevel": "VIEW",
  "sendNotification": true
}
```

### Duplicate Report
```http
POST /api/v1/custom-reports/{reportId}/duplicate
Authorization: Bearer {token}

{
  "name": "Q4 Sales Report - Copy"
}
```

### Get Widget Options
```http
GET /api/v1/custom-reports/widgets/chart/options
Authorization: Bearer {token}
```

**Response:**
```json
{
  "data": {
    "chartTypes": ["bar", "line", "pie", "area", "scatter"],
    "dataFields": ["name", "value", "category"]
  }
}
```

### Validate Widget
```http
POST /api/v1/custom-reports/widgets/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "chart",
  "title": "Sales Chart",
  "config": {
    "chartType": "bar"
  }
}
```

**Response:**
```json
{
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

## Widget Types

### 1. Chart Widget
**Use for:** Data visualization and trends

**Configuration:**
```json
{
  "type": "chart",
  "title": "Sales Trend",
  "config": {
    "chartType": "line",
    "dataField": "salesAmount",
    "groupBy": "month",
    "colors": ["#3B82F6", "#10B981"],
    "height": 400
  }
}
```

**Supported Chart Types:**
- `bar` - Bar chart
- `line` - Line chart
- `pie` - Pie chart
- `area` - Area chart
- `scatter` - Scatter plot

### 2. Metric Widget
**Use for:** Key Performance Indicators (KPIs)

**Configuration:**
```json
{
  "type": "metric",
  "title": "Total Revenue",
  "config": {
    "displayFormat": "currency",
    "aggregation": "sum",
    "dataField": "revenue",
    "precision": 2,
    "showTrend": true,
    "trendField": "monthlyTrend"
  }
}
```

**Display Formats:**
- `number` - Regular number
- `percentage` - Percentage display
- `currency` - Currency format

**Aggregations:**
- `sum` - Sum of values
- `avg` - Average value
- `count` - Count of records
- `min` - Minimum value
- `max` - Maximum value

### 3. Table Widget
**Use for:** Detailed data display

**Configuration:**
```json
{
  "type": "table",
  "title": "Sales Details",
  "config": {
    "rowsPerPage": 25,
    "enableSorting": true,
    "enableFiltering": true,
    "columns": [
      {
        "field": "accountName",
        "label": "Account",
        "sortable": true,
        "width": "30%"
      },
      {
        "field": "amount",
        "label": "Amount",
        "sortable": true,
        "format": "currency",
        "width": "20%"
      }
    ]
  }
}
```

### 4. Text Widget
**Use for:** Descriptions, notes, and documentation

**Configuration:**
```json
{
  "type": "text",
  "title": "Report Summary",
  "config": {
    "textFormat": "markdown",
    "content": "# Q4 Sales Overview\n\nContent here..."
  }
}
```

## Data Filtering

Reports support dynamic filtering:

```javascript
const filters = {
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31",
  region: "North America",
  salesStage: ["Negotiation", "Closed Won"],
  customField: "customValue"
}

await reportApi.executeCustomReport(reportId, filters)
```

## Access Control

### Role-Based Access
- `ADMIN` - Full access to all reports
- `SALES_MANAGER` - Can create and manage sales reports
- `FINANCE_MANAGER` - Can create and manage finance reports

### Sharing Options
- **PRIVATE** - Only owner can access
- **SHARED** - Selected users/roles can access
- **PUBLIC** - All authenticated users can access

### Access Levels
- `VIEW` - Read-only access
- `EDIT` - Can modify report
- `MANAGE` - Can share and control access

## Database Schema

### custom_reports Table
```sql
- id (VARCHAR 36) - Primary key
- name (VARCHAR 255) - Report name
- description (LONGTEXT) - Report description
- refresh_rate (INT) - Auto-refresh interval in minutes
- filters (JSON) - Default filters
- created_by (VARCHAR 100) - Creator username
- created_at (TIMESTAMP) - Creation timestamp
- updated_at (TIMESTAMP) - Last update timestamp
- status (VARCHAR 50) - ACTIVE, DRAFT, ARCHIVED
- access_type (VARCHAR 50) - PRIVATE, SHARED, PUBLIC
```

### widgets Table
```sql
- id (VARCHAR 36) - Primary key
- report_id (VARCHAR 36) - Foreign key to custom_reports
- type (VARCHAR 50) - Widget type (chart, metric, table, text)
- title (VARCHAR 255) - Widget title
- config (JSON) - Widget configuration
- position (INT) - Position in report
- data_source (JSON) - Data source configuration
- enabled (BOOLEAN) - Widget active status
- created_at (TIMESTAMP) - Creation timestamp
```

### report_access Table
```sql
- id (VARCHAR 36) - Primary key
- report_id (VARCHAR 36) - Foreign key to custom_reports
- user_id (VARCHAR 100) - User with access
- role_id (VARCHAR 100) - Role with access
- access_level (VARCHAR 50) - VIEW, EDIT, MANAGE
- granted_at (TIMESTAMP) - When access was granted
- granted_by (VARCHAR 100) - Who granted access
```

## Performance Considerations

1. **Caching**
   - Reports with `refreshRate = 0` are cached indefinitely
   - Other reports are refreshed on query execution

2. **Indexing**
   - Indexed on: created_by, status, access_type, created_at
   - Foreign keys properly indexed for fast joins

3. **Query Optimization**
   - Use filters to reduce data volume
   - Limit rows per page for table widgets
   - Consider scheduled exports for large datasets

## Future Enhancements

1. **Advanced Features**
   - Widget drag-and-drop reordering
   - Custom widget development SDK
   - Real-time collaborative editing
   - Report scheduling and email delivery

2. **Performance**
   - Query result caching
   - Data materialization
   - Report job queue
   - Incremental data refresh

3. **Visualization**
   - More chart types (heatmap, treemap, sunburst)
   - Custom color schemes
   - Interactive drill-down
   - Conditional formatting

## Troubleshooting

### Common Issues

1. **Report not loading**
   - Check authentication token
   - Verify report ID exists
   - Check user access permissions

2. **Widgets not displaying**
   - Validate widget configuration
   - Check data source availability
   - Review browser console for errors

3. **Export fails**
   - Ensure temporary directory has write permissions
   - Check export service dependencies (POI, iText)
   - Verify data availability

## Support

For issues or questions:
1. Check application logs: `backend/logs/application.log`
2. Review browser console for frontend errors
3. Verify database connectivity
4. Check API response status codes

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** Production Ready
