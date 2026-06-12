package com.everx.reporting.controller;

import com.everx.reporting.dto.CustomReportDto;
import com.everx.reporting.dto.CustomReportRequest;
import com.everx.reporting.export.ExportFormat;
import com.everx.reporting.export.ExportResult;
import com.everx.reporting.service.CustomReportService;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/custom-reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('REPORT_VIEW')")
public class CustomReportController {

    private final CustomReportService customReportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomReportDto>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                customReportService.list(PageRequest.of(page, size))));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<CustomReportDto>> get(@PathVariable String reportId) {
        return ResponseEntity.ok(ApiResponse.success(customReportService.get(reportId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomReportDto>> create(
            @RequestBody @Valid CustomReportRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(customReportService.create(request, resolveOwner(authentication))));
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<ApiResponse<CustomReportDto>> update(
            @PathVariable String reportId,
            @RequestBody @Valid CustomReportRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                customReportService.update(reportId, request, resolveOwner(authentication))));
    }

    private String resolveOwner(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        return authentication.getName();
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String reportId) {
        customReportService.delete(reportId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Custom report deleted"));
    }

    @PostMapping("/{reportId}/execute")
    public ResponseEntity<ApiResponse<Map<String, Object>>> execute(
            @PathVariable String reportId,
            @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> filters = body != null && body.get("filters") instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : body;
        return ResponseEntity.ok(ApiResponse.success(customReportService.execute(reportId, filters)));
    }

    @PostMapping("/{reportId}/export")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW','REPORT_EXPORT')")
    public ResponseEntity<Resource> export(
            @PathVariable String reportId,
            @RequestParam(defaultValue = "EXCEL") ExportFormat format) {
        ExportResult exported = customReportService.export(reportId, format);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(exported.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + exported.getFilename() + "\"")
                .body(new ByteArrayResource(exported.getData()));
    }

    @GetMapping("/widgets/{widgetType}/options")
    public ResponseEntity<ApiResponse<Map<String, Object>>> widgetOptions(
            @PathVariable String widgetType) {
        return ResponseEntity.ok(ApiResponse.success(customReportService.widgetOptions(widgetType)));
    }

    @PostMapping("/widgets/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateWidget(
            @RequestBody Map<String, Object> widget) {
        return ResponseEntity.ok(ApiResponse.success(customReportService.validateWidget(widget)));
    }
}
