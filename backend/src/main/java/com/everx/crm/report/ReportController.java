package com.everx.crm.report;

import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController("crmReportController")
@RequestMapping("/api/v1/crm/reports")
@Slf4j
public class ReportController {

    private final ReportService reportService;

    public ReportController(@Qualifier("crmReportService") ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_SELF_VIEW','DASHBOARD_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.DashboardKPIs>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getDashboardKPIs, emptyDashboardKPIs()),
                "Dashboard KPIs retrieved"
        ));
    }

    @GetMapping("/dashboard/user")
    @PreAuthorize("hasAuthority('DASHBOARD_SELF_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.DashboardKPIs>> getUserDashboard() {
        ReportResponse.DashboardKPIs fallback = emptyDashboardKPIs();
        fallback.setVisibilityScope("SELF");
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getDashboardKPIsForSelf, fallback),
                "User dashboard KPIs retrieved"
        ));
    }

    @GetMapping("/dashboard/team")
    @PreAuthorize("hasAuthority('DASHBOARD_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.DashboardKPIs>> getTeamDashboard() {
        ReportResponse.DashboardKPIs fallback = emptyDashboardKPIs();
        fallback.setVisibilityScope("TEAM");
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getDashboardKPIsForTeam, fallback),
                "Team dashboard KPIs retrieved"
        ));
    }

    @GetMapping("/pipeline")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW','REPORT_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.PipelineReport>> getPipeline() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getPipelineReport, emptyPipelineReport()),
                "Pipeline report retrieved"
        ));
    }

    @GetMapping("/pipeline/user")
    @PreAuthorize("hasAuthority('DASHBOARD_SELF_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.PipelineReport>> getUserPipeline() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getPipelineReportForSelf, emptyPipelineReport()),
                "User pipeline report retrieved"
        ));
    }

    @GetMapping("/pipeline/team")
    @PreAuthorize("hasAuthority('DASHBOARD_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.PipelineReport>> getTeamPipeline() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getPipelineReportForTeam, emptyPipelineReport()),
                "Team pipeline report retrieved"
        ));
    }

    @GetMapping("/conversion")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW','REPORT_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ConversionReport>> getConversion() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getConversionReport, emptyConversionReport()),
                "Conversion report retrieved"
        ));
    }

    @GetMapping("/conversion/user")
    @PreAuthorize("hasAuthority('DASHBOARD_SELF_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ConversionReport>> getUserConversion() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getConversionReportForSelf, emptyConversionReport()),
                "User conversion report retrieved"
        ));
    }

    @GetMapping("/conversion/team")
    @PreAuthorize("hasAuthority('DASHBOARD_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ConversionReport>> getTeamConversion() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getConversionReportForTeam, emptyConversionReport()),
                "Team conversion report retrieved"
        ));
    }

    @GetMapping("/activities")
    @PreAuthorize("hasAnyAuthority('DASHBOARD_VIEW','REPORT_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ActivityReport>> getActivities() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getActivityReport, emptyActivityReport()),
                "Activity report retrieved"
        ));
    }

    @GetMapping("/activities/user")
    @PreAuthorize("hasAuthority('DASHBOARD_SELF_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ActivityReport>> getUserActivities() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getActivityReportForSelf, emptyActivityReport()),
                "User activity report retrieved"
        ));
    }

    @GetMapping("/activities/team")
    @PreAuthorize("hasAuthority('DASHBOARD_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse.ActivityReport>> getTeamActivities() {
        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getActivityReportForTeam, emptyActivityReport()),
                "Team activity report retrieved"
        ));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<ApiResponse<ReportResponse>> getFullReport() {
        ReportResponse fallback = ReportResponse.builder()
                .dashboard(emptyDashboardKPIs())
                .pipeline(emptyPipelineReport())
                .conversion(emptyConversionReport())
                .activities(emptyActivityReport())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(
                safeGet(reportService::getFullReport, fallback),
                "Full report retrieved"
        ));
    }

    private ReportResponse.DashboardKPIs emptyDashboardKPIs() {
        return ReportResponse.DashboardKPIs.builder()
                .totalLeads(0)
                .totalContacts(0)
                .totalAccounts(0)
                .totalDeals(0)
                .openDeals(0)
                .wonDeals(0)
                .lostDeals(0)
                .totalPipelineValue(BigDecimal.ZERO)
                .wonValue(BigDecimal.ZERO)
                .winRate(0.0)
                .visibilityScope("SELF")
                .teamMemberCount(0)
                .userPerformance(List.of())
                .build();
    }

    private ReportResponse.PipelineReport emptyPipelineReport() {
        return ReportResponse.PipelineReport.builder()
                .dealCountByStage(new LinkedHashMap<>())
                .dealValueByStage(new LinkedHashMap<>())
                .totalPipelineValue(BigDecimal.ZERO)
                .build();
    }

    private ReportResponse.ConversionReport emptyConversionReport() {
        return ReportResponse.ConversionReport.builder()
                .totalLeads(0)
                .convertedLeads(0)
                .conversionRate(0.0)
                .leadsByStatus(new LinkedHashMap<>())
                .leadsBySource(new LinkedHashMap<>())
                .build();
    }

    private ReportResponse.ActivityReport emptyActivityReport() {
        return ReportResponse.ActivityReport.builder()
                .totalActivities(0)
                .completedActivities(0)
                .pendingActivities(0)
                .overdueActivities(0)
                .activitiesByType(new LinkedHashMap<>())
                .build();
    }

    private <T> T safeGet(UnsafeSupplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (Exception ex) {
            log.error("CRM report generation failed, returning fallback payload", ex);
            return fallback;
        }
    }

    @FunctionalInterface
    private interface UnsafeSupplier<T> {
        T get() throws Exception;
    }
}
