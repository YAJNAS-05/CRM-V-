package com.everx.reporting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

/**
 * Service for generating reports using JasperReports
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JasperReportService {

    /**
     * Compile a Jasper template from JRXML file
     */
    public JasperReport compileReport(String templateName) {
        try {
            String resourcePath = String.format("/jasper/%s.jrxml", templateName);
            InputStream resourceAsStream = getClass().getResourceAsStream(resourcePath);
            
            if (resourceAsStream == null) {
                log.warn("Jasper template not found: {}, using fallback", templateName);
                return createFallbackReport(templateName);
            }
            
            JasperReport jasperReport = JasperCompileManager.compileReport(resourceAsStream);
            log.info("Compiled Jasper report: {}", templateName);
            return jasperReport;
        } catch (Exception e) {
            log.error("Failed to compile Jasper report: {}", templateName, e);
            return createFallbackReport(templateName);
        }
    }

    /**
     * Fill a Jasper report with data and generate PDF bytes
     */
    public byte[] generatePDF(JasperReport jasperReport, List<Map<String, Object>> data, Map<String, Object> parameters) {
        try {
            JRMapCollectionDataSource dataSource = new JRMapCollectionDataSource((java.util.Collection<java.util.Map<String, ?>>) (Object) data);
            
            Map<String, Object> params = new HashMap<>();
            if (parameters != null) {
                params.putAll(parameters);
            }
            // Add default parameters
            params.put("REPORT_LOCALE", Locale.US);
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);
            byte[] pdfBytes = JasperExportManager.exportReportToPdf(jasperPrint);
            
            log.info("Generated PDF report with {} records", data.size());
            return pdfBytes;
        } catch (Exception e) {
            log.error("Failed to generate PDF from Jasper report", e);
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    /**
     * Fill a Jasper report and generate Excel bytes
     */
    public byte[] generateExcel(JasperReport jasperReport, List<Map<String, Object>> data, Map<String, Object> parameters) {
        try {
            JRMapCollectionDataSource dataSource = new JRMapCollectionDataSource((java.util.Collection<java.util.Map<String, ?>>) (Object) data);
            
            Map<String, Object> params = new HashMap<>();
            if (parameters != null) {
                params.putAll(parameters);
            }
            params.put("REPORT_LOCALE", Locale.US);
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);
            
            // Export to Excel using JimuReport approach
            net.sf.jasperreports.engine.export.JRXlsExporter exporter = 
                new net.sf.jasperreports.engine.export.JRXlsExporter();
            exporter.setExporterInput(new net.sf.jasperreports.export.SimpleExporterInput(jasperPrint));
            
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            exporter.setExporterOutput(new net.sf.jasperreports.export.SimpleOutputStreamExporterOutput(baos));
            exporter.exportReport();
            
            byte[] excelBytes = baos.toByteArray();
            baos.close();
            
            log.info("Generated Excel report with {} records", data.size());
            return excelBytes;
        } catch (Exception e) {
            log.error("Failed to generate Excel from Jasper report", e);
            throw new RuntimeException("Excel generation failed", e);
        }
    }

    /**
     * Fill a Jasper report with data and return as JasperPrint (for preview)
     */
    public JasperPrint fillReport(JasperReport jasperReport, List<Map<String, Object>> data, Map<String, Object> parameters) {
        try {
            JRMapCollectionDataSource dataSource = new JRMapCollectionDataSource((java.util.Collection<java.util.Map<String, ?>>) (Object) data);
            
            Map<String, Object> params = new HashMap<>();
            if (parameters != null) {
                params.putAll(parameters);
            }
            params.put("REPORT_LOCALE", Locale.US);
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, params, dataSource);
            
            log.info("Filled Jasper report with {} records", data.size());
            return jasperPrint;
        } catch (Exception e) {
            log.error("Failed to fill Jasper report", e);
            throw new RuntimeException("Report fill failed", e);
        }
    }

    /**
     * Create a fallback empty report when template is not found
     */
    private JasperReport createFallbackReport(String reportName) {
        log.warn("Fallback: No Jasper template found for: {}, will return null", reportName);
        return null;
    }

    /**
     * Extract page count from a JasperPrint
     */
    public int getPageCount(JasperPrint jasperPrint) {
        return jasperPrint != null ? jasperPrint.getPages().size() : 0;
    }

    /**
     * Get metadata about report pages
     */
    public Map<String, Object> getReportMetadata(JasperPrint jasperPrint) {
        Map<String, Object> metadata = new HashMap<>();
        if (jasperPrint != null) {
            metadata.put("pageCount", jasperPrint.getPages().size());
            metadata.put("name", jasperPrint.getName());
            metadata.put("width", jasperPrint.getPageWidth());
            metadata.put("height", jasperPrint.getPageHeight());
        }
        return metadata;
    }
}
