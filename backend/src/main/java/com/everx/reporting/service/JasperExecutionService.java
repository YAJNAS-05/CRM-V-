package com.everx.reporting.service;

import com.everx.reporting.dto.ReportExecutionRequest;
import com.everx.reporting.dto.ReportResult;
import com.everx.reporting.entity.ReportDefinitionEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Jasper-based report execution service
 * Integrates JasperReports for professional report generation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JasperExecutionService {

    private final JasperReportService jasperReportService;
    private final DynamicReportService dynamicReportService;
    private final ReportDefinitionService reportDefinitionService;

    /**
     * Execute a report using JasperReports
     */
    public ReportResult executeWithJasper(Long reportId, ReportExecutionRequest request, UserDetails user) {
        long startTime = System.currentTimeMillis();
        
        try {
            ReportDefinitionEntity reportDef = reportDefinitionService.getReport(reportId);
            
            // Get report data
            ReportResult baseResult = dynamicReportService.execute(reportId, request, user);
            
            // Extract template name from report key or definition
            String templateName = extractTemplateName(reportDef);
            
            // Compile Jasper template
            JasperReport jasperReport = jasperReportService.compileReport(templateName);
            
            // Convert result rows to map collection for Jasper
            List<Map<String, Object>> dataList = convertToMapList(baseResult.getRows());
            
            // Fill and generate report
            Map<String, Object> parameters = extractParameters(request);
            parameters.put("reportTitle", reportDef.getReportName());
            parameters.put("reportDescription", reportDef.getDescription());
            
            var jasperPrint = jasperReportService.fillReport(jasperReport, dataList, parameters);
            
            // Update result with Jasper metadata
            baseResult.setDurationMs((long)(System.currentTimeMillis() - startTime));
            log.info("Jasper report filled with {} pages", jasperReportService.getPageCount(jasperPrint));
            
            return baseResult;
            
        } catch (Exception e) {
            log.error("Jasper execution failed for report: {}, falling back to standard execution", reportId, e);
            
            // Fallback to standard execution
            ReportResult fallbackResult = dynamicReportService.execute(reportId, request, user);
            fallbackResult.setDurationMs((long)(System.currentTimeMillis() - startTime));
            return fallbackResult;
        }
    }

    /**
     * Generate PDF from report using JasperReports
     */
    public byte[] generatePDF(Long reportId, ReportExecutionRequest request, UserDetails user) {
        try {
            ReportDefinitionEntity reportDef = reportDefinitionService.getReport(reportId);
            
            // Get report data
            ReportResult result = dynamicReportService.execute(reportId, request, user);
            
            // Get template name
            String templateName = extractTemplateName(reportDef);
            
            // Compile Jasper template
            JasperReport jasperReport = jasperReportService.compileReport(templateName);
            
            // Convert to map list
            List<Map<String, Object>> dataList = convertToMapList(result.getRows());
            
            // Extract parameters
            Map<String, Object> parameters = extractParameters(request);
            parameters.put("reportTitle", reportDef.getReportName());
            
            // Generate PDF
            return jasperReportService.generatePDF(jasperReport, dataList, parameters);
            
        } catch (Exception e) {
            log.error("PDF generation failed for report: {}", reportId, e);
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    /**
     * Generate Excel from report using JasperReports
     */
    public byte[] generateExcel(Long reportId, ReportExecutionRequest request, UserDetails user) {
        try {
            ReportDefinitionEntity reportDef = reportDefinitionService.getReport(reportId);
            
            // Get report data
            ReportResult result = dynamicReportService.execute(reportId, request, user);
            
            // Get template name
            String templateName = extractTemplateName(reportDef);
            
            // Compile Jasper template
            JasperReport jasperReport = jasperReportService.compileReport(templateName);
            
            // Convert to map list
            List<Map<String, Object>> dataList = convertToMapList(result.getRows());
            
            // Extract parameters
            Map<String, Object> parameters = extractParameters(request);
            parameters.put("reportTitle", reportDef.getReportName());
            
            // Generate Excel
            return jasperReportService.generateExcel(jasperReport, dataList, parameters);
            
        } catch (Exception e) {
            log.error("Excel generation failed for report: {}", reportId, e);
            throw new RuntimeException("Excel generation failed", e);
        }
    }

    /**
     * Extract template name from report definition
     */
    private String extractTemplateName(ReportDefinitionEntity reportDef) {
        if (reportDef.getReportKey() != null) {
            return reportDef.getReportKey();
        }
        
        // Generate from report name (replace spaces with underscores)
        String name = reportDef.getReportName()
            .replaceAll("\\s+", "")
            .replaceAll("[^a-zA-Z0-9]", "");
        
        return name.isEmpty() ? "DefaultReport" : name;
    }

    /**
     * Convert report result rows to map list for Jasper
     */
    private List<Map<String, Object>> convertToMapList(List<Map<String, Object>> rows) {
        if (rows == null) {
            return new ArrayList<>();
        }
        return new ArrayList<>(rows);
    }

    /**
     * Extract parameters from execution request
     */
    private Map<String, Object> extractParameters(ReportExecutionRequest request) {
        Map<String, Object> params = new HashMap<>();
        
        if (request.getDateFrom() != null) {
            params.put("dateFrom", request.getDateFrom());
        }
        if (request.getDateTo() != null) {
            params.put("dateTo", request.getDateTo());
        }
        if (request.getCompanyCode() != null) {
            params.put("companyCode", request.getCompanyCode());
        }
        
        // Add execution timestamp
        params.put("executedAt", LocalDateTime.now());
        
        return params;
    }
}
