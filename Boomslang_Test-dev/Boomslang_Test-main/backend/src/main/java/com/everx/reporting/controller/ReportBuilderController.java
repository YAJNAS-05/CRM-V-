package com.everx.reporting.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.reporting.dto.*;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.export.ExportFormat;
import com.everx.reporting.export.ExportService;
import com.everx.reporting.export.ExportResult;
import com.everx.reporting.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReportBuilderController {

    private final ReportDefinitionService definitionService;
    private final DynamicReportService executionService;
    private final ReportExecutionService reportExecutionService;
    private final ExportService exportService;
    private final ReportMetadataService metadataService;
    private final JasperExecutionService jasperExecutionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<?>>> listReports(
            @RequestParam(required = false) String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            definitionService.listReports(module, PageRequest.of(page, size))));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportDefinitionEntity>> getReport(
            @PathVariable Long reportId) {
        return ResponseEntity.ok(ApiResponse.success(
            definitionService.getReport(reportId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportDefinitionEntity>> createReport(
            @RequestBody @Valid CreateReportRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(definitionService.create(request, user)));
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportDefinitionEntity>> updateReport(
            @PathVariable Long reportId,
            @RequestBody @Valid UpdateReportRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            definitionService.update(reportId, request, user)));
    }

    @PostMapping("/{reportId}/clone")
    public ResponseEntity<ApiResponse<ReportDefinitionEntity>> cloneReport(
            @PathVariable Long reportId,
            @RequestBody CloneReportRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            definitionService.clone(reportId, request.getNewName(), user)));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        definitionService.delete(reportId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Report deleted"));
    }

    @PostMapping("/{reportId}/execute")
    public ResponseEntity<ApiResponse<ReportResult>> execute(
            @PathVariable Long reportId,
            @RequestBody ReportExecutionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            reportExecutionService.execute(reportId, request, user)));
    }

    @PostMapping("/{reportId}/export")
    public ResponseEntity<Resource> export(
            @PathVariable Long reportId,
            @RequestParam ExportFormat format,
            @RequestBody ReportExecutionRequest request,
            @AuthenticationPrincipal UserDetails user) {

        request.setPage(null);
        ReportResult result = reportExecutionService.execute(reportId, request, user);
        ExportResult exported = exportService.export(result, format, result.getReportName());

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(exported.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + exported.getFilename() + "\"")
            .body(new ByteArrayResource(exported.getData()));
    }

    // ==================== Jasper-Based Endpoints ====================

    @PostMapping("/{reportId}/jasper/execute")
    public ResponseEntity<ApiResponse<ReportResult>> executeWithJasper(
            @PathVariable Long reportId,
            @RequestBody ReportExecutionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
            jasperExecutionService.executeWithJasper(reportId, request, user)));
    }

    @PostMapping("/{reportId}/jasper/export-pdf")
    public ResponseEntity<Resource> exportToPdfWithJasper(
            @PathVariable Long reportId,
            @RequestBody ReportExecutionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        
        byte[] pdfBytes = jasperExecutionService.generatePDF(reportId, request, user);
        ReportDefinitionEntity report = definitionService.getReport(reportId);
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + report.getReportName() + ".pdf\"")
            .body(new ByteArrayResource(pdfBytes));
    }

    @PostMapping("/{reportId}/jasper/export-excel")
    public ResponseEntity<Resource> exportToExcelWithJasper(
            @PathVariable Long reportId,
            @RequestBody ReportExecutionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        
        byte[] excelBytes = jasperExecutionService.generateExcel(reportId, request, user);
        ReportDefinitionEntity report = definitionService.getReport(reportId);
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + report.getReportName() + ".xlsx\"")
            .body(new ByteArrayResource(excelBytes));
    }

    @GetMapping("/metadata/fields")
    public ResponseEntity<ApiResponse<Map<String, List<?>>>> getAvailableFields() {
        return ResponseEntity.ok(ApiResponse.success(
            (Map<String, List<?>>) (Map<?, ?>) metadataService.getAllAvailableFields()));
    }

    @GetMapping("/metadata/modules")
    public ResponseEntity<ApiResponse<List<?>>> getModules() {
        return ResponseEntity.ok(ApiResponse.success(
            (List<?>) (List<?>) metadataService.getAllModules()));
    }
}
