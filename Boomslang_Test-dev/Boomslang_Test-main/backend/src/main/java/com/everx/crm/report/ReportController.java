package com.everx.crm.report;

import com.everx.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("crmReportController")
@RequestMapping("/api/v1/crm/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(@Qualifier("crmReportService") ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<ReportResponse.DashboardKPIs>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardKPIs(), "Dashboard KPIs retrieved"));
    }

    @GetMapping("/pipeline")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<ReportResponse.PipelineReport>> getPipeline() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getPipelineReport(), "Pipeline report retrieved"));
    }

    @GetMapping("/conversion")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<ReportResponse.ConversionReport>> getConversion() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getConversionReport(), "Conversion report retrieved"));
    }

    @GetMapping("/activities")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<ReportResponse.ActivityReport>> getActivities() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getActivityReport(), "Activity report retrieved"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<ReportResponse>> getFullReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getFullReport(), "Full report retrieved"));
    }
}
