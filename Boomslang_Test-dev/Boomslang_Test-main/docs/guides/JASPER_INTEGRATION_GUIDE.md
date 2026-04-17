# JasperReports Integration Guide

## Overview
The reporting system now integrates **JasperReports** v6.20.6 for professional-grade report generation with support for PDF and Excel exports.

## Architecture

### Components Added

#### 1. **JasperReportService** 
Core service for all JasperReports operations:
- `compileReport(templateName)` - Compile JRXML templates to JasperReport objects
- `generatePDF(jasperReport, data, parameters)` - Generate PDF output
- `generateExcel(jasperReport, data, parameters)` - Generate Excel (XLSX) output
- `fillReport(jasperReport, data, parameters)` - Fill report with data for preview
- `getPageCount(jasperPrint)` - Get number of pages in generated report
- `getReportMetadata(jasperPrint)` - Get report metadata (page count, dimensions, etc.)

#### 2. **JasperExecutionService**
High-level report execution wrapper:
- `executeWithJasper(reportId, request, user)` - Execute report using JasperReports
- `generatePDF(reportId, request, user)` - Generate PDF export
- `generateExcel(reportId, request, user)` - Generate Excel export

Features:
- Automatic fallback to standard execution if Jasper fails
- Template name resolution from report key
- Parameter extraction from execution requests
- Automatic page count and metadata tracking

#### 3. **Updated ReportBuilderController**
New API endpoints for Jasper-based operations:

```
POST   /api/v1/reports/{reportId}/jasper/execute
POST   /api/v1/reports/{reportId}/jasper/export-pdf
POST   /api/v1/reports/{reportId}/jasper/export-excel
```

## Template System

### JRXML Templates Location
```
backend/src/main/resources/jasper/
```

### Available Templates
- `InventoryStockReport.jrxml` - Inventory tracking report
- Additional templates can be added by creating new `.jrxml` files

### Template Naming Convention
- JRXML file name (without extension) is the template key
- Example: `InventoryStockReport.jrxml` → template key `InventoryStockReport`

## Dependencies Added to POM.xml

```xml
<!-- JasperReports -->
<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports</artifactId>
    <version>6.20.6</version>
</dependency>

<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports-functions</artifactId>
    <version>6.20.6</version>
</dependency>

<dependency>
    <groupId>net.sf.jasperreports</groupId>
    <artifactId>jasperreports-fonts</artifactId>
    <version>6.20.6</version>
</dependency>
```

## API Usage Examples

### 1. Execute Report with Jasper
```bash
curl -X POST http://localhost:8080/api/v1/reports/1/jasper/execute \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [],
    "sorts": [],
    "page": 0,
    "pageSize": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": 1,
    "reportName": "Inventory Stock Report",
    "columns": [...],
    "rows": [...],
    "totalCount": 250,
    "page": 0,
    "pageSize": 50,
    "durationMs": 1234,
    "executedAt": "2026-04-15T20:44:45"
  }
}
```

### 2. Export to PDF using Jasper
```bash
curl -X POST http://localhost:8080/api/v1/reports/1/jasper/export-pdf \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [],
    "sorts": [],
    "page": null,
    "pageSize": 50
  }' \
  -o inventory-report.pdf
```

### 3. Export to Excel using Jasper
```bash
curl -X POST http://localhost:8080/api/v1/reports/1/jasper/export-excel \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [],
    "sorts": [],
    "page": null,
    "pageSize": 50
  }' \
  -o inventory-report.xlsx
```

## Report Parameters

Parameters passed to Jasper templates:
```java
{
  "reportTitle": "Report Name",
  "reportDescription": "Report Description",
  "dateFrom": "2026-04-01",
  "dateTo": "2026-04-15",
  "companyCode": "AUS",
  "executedAt": LocalDateTime.now(),
  "REPORT_LOCALE": Locale.US
}
```

## Creating New Jasper Templates

### Step 1: Create JRXML File
Place in: `backend/src/main/resources/jasper/YourReport.jrxml`

### Step 2: Define Fields
```xml
<field name="item_code" class="java.lang.String"/>
<field name="quantity" class="java.lang.Integer"/>
<field name="price" class="java.math.BigDecimal"/>
```

### Step 3: Layout Sections
- **Title**: Report header and title
- **Column Header**: Column names and styling
- **Detail**: Data rows template
- **Page Footer**: Page numbers and summary

### Step 4: Reference in Report Definition
```java
// Create report with reportKey pointing to template name
new CreateReportRequest()
  .setReportName("Your Report")
  .setModule("ERP")
  .setDescription("Description")
  .setDefinition(Map.of(
    "jasperTemplate", "YourReport",
    ...
  ))
```

## Data Source Mapping

### From Database to Jasper
```
List<Map<String, Object>> (Query Results)
        ↓
JRMapCollectionDataSource (Jasper Data Source)
        ↓
Report Fields (Field names must match Map keys)
```

### Example Data Structure
```java
Map<String, Object> row = Map.of(
  "item_code", "INV-001",
  "name", "Medical Equipment",
  "current_stock", 50,
  "location", "Warehouse A",
  "status", "IN_STOCK",
  "unit_cost", new BigDecimal("10000.00")
);
```

## Error Handling

### Fallback Strategy
If Jasper report compilation or generation fails:
1. Log the error with context
2. Fall back to standard DynamicReportService execution
3. Return result without Jasper-specific metadata

### Common Issues

**Issue**: Template not found
- **Solution**: Check template name matches JRXML file (case-sensitive)
- **Fallback**: Service will log warning and use standard execution

**Issue**: Field mapping error
- **Solution**: Ensure Java field types match Jasper field class declarations
- **Fallback**: Automatic field mapping with Object type

**Issue**: Memory issues with large datasets
- **Solution**: Implement pagination at database level
- **Recommendation**: Use page-based queries instead of loading all rows

## Performance Considerations

### Optimization Tips
1. **Pagination**: Always use page-based queries for large result sets
2. **Caching**: Templates are compiled once and reused
3. **Streaming**: PDF/Excel generation is streamed to client
4. **Async Processing**: Long-running exports can be made async

### Typical Rendering Times
- **PDF Generation**: 100-500ms for 1000 rows
- **Excel Generation**: 200-1000ms for 1000 rows
- **Template Compilation**: One-time ~100ms per template

## Supported Export Formats

### PDF
- Format: `application/pdf`
- Endpoint: `/jasper/export-pdf`
- Features: AcroForms, embedded fonts, page breaks

### Excel (XLSX)
- Format: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Endpoint: `/jasper/export-excel`
- Features: Styling, formulas, multiple sheets support

## Integration with Frontend

### Typescript API Client Addition
```typescript
// In frontend/src/api/reportApi.ts

jasperExecute: (reportId: number, request: ReportExecutionRequest) =>
  axiosInstance.post<{ data: ReportResult }>(
    `/v1/reports/${reportId}/jasper/execute`,
    request
  ),

jasperExportPdf: (reportId: number, request: ReportExecutionRequest) =>
  axiosInstance.post(
    `/v1/reports/${reportId}/jasper/export-pdf`,
    request,
    { responseType: 'blob' }
  ),

jasperExportExcel: (reportId: number, request: ReportExecutionRequest) =>
  axiosInstance.post(
    `/v1/reports/${reportId}/jasper/export-excel`,
    request,
    { responseType: 'blob' }
  ),
```

### UI Usage
```typescript
// Download PDF
const pdfBlob = await reportApi.jasperExportPdf(reportId, filters);
const url = window.URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = `report-${reportId}.pdf`;
a.click();
```

## Admin Configuration

### Report Metadata
Each report can specify:
- `jasperTemplate`: Template file name
- `parameters`: Custom parameters to pass to Jasper
- `styling`: Font, colors, margins

### Template Management
Templates are version-controlled in:
```
backend/src/main/resources/jasper/
```

## Troubleshooting

### Check JasperReports Version
```bash
mvn dependency:tree | grep jasperreports
```

### Verify Template Compilation
Enable logging:
```properties
logging.level.com.everx.reporting.service.JasperReportService=DEBUG
```

### Test Jasper Compilation
```java
JasperReport report = JasperCompileManager.compileReport("template.jrxml");
```

## Future Enhancements

- [ ] Template Designer UI integration
- [ ] Scheduled report generation with Jasper
- [ ] Email delivery of Jasper reports
- [ ] Batch report processing
- [ ] BIRT/iReport template support
- [ ] Dashboard widget rendering with Jasper

## References
- [JasperReports Documentation](https://jasperreports.sourceforge.net/)
- [JRXML Schema](https://jasperreports.sourceforge.net/xsd/jasperreport.xsd)
- [Expressions Language](https://jasperreports.sourceforge.net/sample-documents)
