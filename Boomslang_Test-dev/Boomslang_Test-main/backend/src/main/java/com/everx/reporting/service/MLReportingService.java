package com.everx.reporting.service;

import com.everx.ai.dto.AIInsightDto;
import com.everx.ai.service.AIAnalyticsService;
import com.everx.reporting.dto.*;
import com.everx.reporting.entity.MLReport;
import com.everx.reporting.entity.ReportTemplate;
import com.everx.reporting.repository.MLReportRepository;
import com.everx.reporting.repository.ReportTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class MLReportingService {

    private final MLReportRepository mlReportRepository;
    private final ReportTemplateRepository reportTemplateRepository;
    private final AIAnalyticsService aiAnalyticsService;
    private final ReportGenerationService reportGenerationService;
    private final DataVisualizationService dataVisualizationService;

    // ML-Powered Report Generation
    @Async
    @Transactional
    public CompletableFuture<MLReportDto> generateMLReport(UUID tenantId, MLReportRequest request) {
        log.info("Generating ML report for tenant: {} with type: {}", tenantId, request.getReportType());

        try {
            // Get AI insights for the report
            List<AIInsightDto> insights = getRelevantInsights(tenantId, request);

            // Generate ML-powered analysis
            MLAnalysisResult analysis = performMLAnalysis(tenantId, request, insights);

            // Create report content
            Map<String, Object> reportContent = generateReportContent(request, insights, analysis);

            // Generate visualizations
            Map<String, Object> visualizations = generateVisualizations(request, analysis);

            // Create ML report
            MLReport report = MLReport.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .title(generateReportTitle(request))
                    .description(generateReportDescription(request))
                    .reportType(request.getReportType())
                    .contentType(request.getContentType())
                    .reportContent(reportContent)
                    .visualizations(visualizations)
                    .insights(insights)
                    .analysis(analysis)
                    .status(MLReport.Status.COMPLETED)
                    .generatedAt(LocalDateTime.now())
                    .generatedBy(request.getGeneratedBy())
                    .validUntil(LocalDateTime.now().plusDays(request.getValidityDays()))
                    .build();

            report = mlReportRepository.save(report);

            log.info("ML report generated: {} for tenant: {}", report.getId(), tenantId);
            return CompletableFuture.completedFuture(convertToDto(report));

        } catch (Exception e) {
            log.error("Error generating ML report for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to generate ML report", e);
        }
    }

    // Intelligent Report Recommendations
    @Async
    @Transactional
    public CompletableFuture<List<ReportRecommendationDto>> getReportRecommendations(UUID tenantId, RecommendationRequest request) {
        log.info("Getting report recommendations for tenant: {}", tenantId);

        try {
            List<ReportRecommendationDto> recommendations = new ArrayList<>();

            // Analyze tenant data patterns
            Map<String, Object> dataPatterns = analyzeDataPatterns(tenantId);

            // Generate recommendations based on patterns
            recommendations.addAll(generatePatternBasedRecommendations(tenantId, dataPatterns));

            // Get AI insights for recommendations
            List<AIInsightDto> insights = aiAnalyticsService.getInsights(tenantId, "ALL");
            recommendations.addAll(generateInsightBasedRecommendations(tenantId, insights));

            // Generate role-based recommendations
            recommendations.addAll(generateRoleBasedRecommendations(tenantId, request.getUserRole()));

            // Sort by priority and relevance
            recommendations.sort((r1, r2) -> Double.compare(r2.getPriority(), r1.getPriority()));

            return CompletableFuture.completedFuture(recommendations);

        } catch (Exception e) {
            log.error("Error getting report recommendations for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to get report recommendations", e);
        }
    }

    // Automated Report Scheduling
    @Async
    @Transactional
    public CompletableFuture<MLReportDto> scheduleMLReport(UUID tenantId, ScheduleReportRequest request) {
        log.info("Scheduling ML report for tenant: {} with schedule: {}", tenantId, request.getSchedule());

        try {
            // Create scheduled report configuration
            MLReport scheduledReport = MLReport.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .reportType(request.getReportType())
                    .contentType(request.getContentType())
                    .status(MLReport.Status.SCHEDULED)
                    .scheduledAt(calculateNextExecution(request.getSchedule()))
                    .schedule(request.getSchedule())
                    .recipients(request.getRecipients())
                    .autoGenerate(true)
                    .createdBy(request.getCreatedBy())
                    .createdAt(LocalDateTime.now())
                    .build();

            scheduledReport = mlReportRepository.save(scheduledReport);

            log.info("ML report scheduled: {} for tenant: {}", scheduledReport.getId(), tenantId);
            return CompletableFuture.completedFuture(convertToDto(scheduledReport));

        } catch (Exception e) {
            log.error("Error scheduling ML report for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to schedule ML report", e);
        }
    }

    // Report Template Management
    @Transactional
    public ReportTemplateDto createReportTemplate(UUID tenantId, CreateTemplateRequest request) {
        log.info("Creating report template: {} for tenant: {}", request.getName(), tenantId);

        ReportTemplate template = ReportTemplate.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .templateType(request.getTemplateType())
                .contentType(request.getContentType())
                .layout(request.getLayout())
                .sections(request.getSections())
                .styles(request.getStyles())
                .isPublic(request.getIsPublic())
                .isActive(true)
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();

        template = reportTemplateRepository.save(template);
        return convertToDto(template);
    }

    @Transactional(readOnly = true)
    public List<ReportTemplateDto> getReportTemplates(UUID tenantId) {
        return reportTemplateRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    // Report Analytics
    @Transactional(readOnly = true)
    public ReportAnalyticsDto getReportAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting report analytics for tenant: {}", tenantId);

        try {
            // Get report statistics
            Map<String, Object> statistics = getReportStatistics(tenantId, request);

            // Get usage patterns
            Map<String, Object> usagePatterns = getUsagePatterns(tenantId, request);

            // Get performance metrics
            Map<String, Object> performanceMetrics = getPerformanceMetrics(tenantId, request);

            // Get user engagement
            Map<String, Object> userEngagement = getUserEngagement(tenantId, request);

            return ReportAnalyticsDto.builder()
                    .tenantId(tenantId)
                    .statistics(statistics)
                    .usagePatterns(usagePatterns)
                    .performanceMetrics(performanceMetrics)
                    .userEngagement(userEngagement)
                    .generatedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error getting report analytics for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to get report analytics", e);
        }
    }

    // Scheduled Tasks
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void processScheduledReports() {
        log.info("Processing scheduled ML reports");

        List<MLReport> scheduledReports = mlReportRepository.findByStatusAndScheduledAtBefore(
                MLReport.Status.SCHEDULED, LocalDateTime.now());

        for (MLReport report : scheduledReports) {
            try {
                processScheduledReport(report);
            } catch (Exception e) {
                log.error("Error processing scheduled report: {}", report.getId(), e);
                report.setStatus(MLReport.Status.FAILED);
                mlReportRepository.save(report);
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *") // Every day at 1 AM
    @Transactional
    public void generateDailyReports() {
        log.info("Generating daily ML reports");

        List<UUID> activeTenants = getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                generateDailyReportsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error generating daily reports for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private List<AIInsightDto> getRelevantInsights(UUID tenantId, MLReportRequest request) {
        List<String> relevantTypes = getRelevantInsightTypes(request.getReportType());
        List<AIInsightDto> insights = new ArrayList<>();

        for (String type : relevantTypes) {
            insights.addAll(aiAnalyticsService.getInsights(tenantId, type));
        }

        // Filter by time range if specified
        if (request.getTimeRange() != null) {
            insights = filterInsightsByTimeRange(insights, request.getTimeRange());
        }

        // Limit to most relevant insights
        return insights.stream()
                .sorted((i1, i2) -> Double.compare(i2.getConfity(), i1.getConfity()))
                .limit(20)
                .toList();
    }

    private MLAnalysisResult performMLAnalysis(UUID tenantId, MLReportRequest request, List<AIInsightDto> insights) {
        return MLAnalysisResult.builder()
                .summary(generateAnalysisSummary(insights))
                .keyFindings(extractKeyFindings(insights))
                .trends(analyzeTrends(insights))
                .recommendations(generateRecommendations(insights))
                .riskFactors(identifyRiskFactors(insights))
                .opportunities(identifyOpportunities(insights))
                .confidence(calculateAnalysisConfity(insights))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private Map<String, Object> generateReportContent(MLReportRequest request, List<AIInsightDto> insights, MLAnalysisResult analysis) {
        Map<String, Object> content = new HashMap<>();

        content.put("executiveSummary", analysis.getSummary());
        content.put("keyFindings", analysis.getKeyFindings());
        content.put("insights", insights);
        content.put("trends", analysis.getTrends());
        content.put("recommendations", analysis.getRecommendations());
        content.put("riskFactors", analysis.getRiskFactors());
        content.put("opportunities", analysis.getOpportunities());
        content.put("confidence", analysis.getConfity());
        content.put("generatedAt", LocalDateTime.now());

        return content;
    }

    private Map<String, Object> generateVisualizations(MLReportRequest request, MLAnalysisResult analysis) {
        Map<String, Object> visualizations = new HashMap<>();

        // Generate charts based on report type
        switch (request.getReportType()) {
            case "EXECUTIVE_DASHBOARD" -> {
                visualizations.put("kpiChart", generateKPIChart(analysis));
                visualizations.put("trendChart", generateTrendChart(analysis));
                visualizations.put("riskMatrix", generateRiskMatrix(analysis));
            }
            case "FINANCIAL_ANALYSIS" -> {
                visualizations.put("revenueChart", generateRevenueChart(analysis));
                visualizations.put("costChart", generateCostChart(analysis));
                visualizations.put("profitabilityChart", generateProfitabilityChart(analysis));
            }
            case "CUSTOMER_ANALYTICS" -> {
                visualizations.put("customerSegmentChart", generateCustomerSegmentChart(analysis));
                visualizations.put("lifetimeValueChart", generateLifetimeValueChart(analysis));
                visualizations.put("churnAnalysisChart", generateChurnAnalysisChart(analysis));
            }
            default -> {
                visualizations.put("summaryChart", generateSummaryChart(analysis));
            }
        }

        return visualizations;
    }

    private String generateReportTitle(MLReportRequest request) {
        return switch (request.getReportType()) {
            case "EXECUTIVE_DASHBOARD" -> "Executive Dashboard - AI Analysis";
            case "FINANCIAL_ANALYSIS" -> "Financial Analysis - ML Insights";
            case "CUSTOMER_ANALYTICS" -> "Customer Analytics - AI-Powered Report";
            case "OPERATIONAL_EFFICIENCY" -> "Operational Efficiency - ML Analysis";
            default -> "ML-Generated Report";
        };
    }

    private String generateReportDescription(MLReportRequest request) {
        return String.format("AI-powered %s report generated on %s with machine learning insights and recommendations",
                request.getReportType().toLowerCase().replace("_", " "),
                LocalDateTime.now().toLocalDate());
    }

    private List<String> getRelevantInsightTypes(String reportType) {
        return switch (reportType) {
            case "EXECUTIVE_DASHBOARD" -> List.of("REVENUE_TREND", "CUSTOMER_BEHAVIOR", "OPERATIONAL_EFFICIENCY", "RISK_ASSESSMENT");
            case "FINANCIAL_ANALYSIS" -> List.of("REVENUE_TREND", "RISK_ASSESSMENT", "OPPORTUNITY_DETECTION");
            case "CUSTOMER_ANALYTICS" -> List.of("CUSTOMER_BEHAVIOR", "OPPORTUNITY_DETECTION", "PERFORMANCE_ANOMALY");
            case "OPERATIONAL_EFFICIENCY" -> List.of("OPERATIONAL_EFFICIENCY", "PERFORMANCE_ANOMALY", "OPTIMIZATION_RECOMMENDATION");
            default -> List.of("REVENUE_TREND", "CUSTOMER_BEHAVIOR", "OPERATIONAL_EFFICIENCY");
        };
    }

    private List<AIInsightDto> filterInsightsByTimeRange(List<AIInsightDto> insights, String timeRange) {
        // Filter insights based on time range
        // This is a simplified implementation
        return insights.stream()
                .limit(50)
                .toList();
    }

    private String generateAnalysisSummary(List<AIInsightDto> insights) {
        return String.format("Analysis of %d AI-generated insights reveals %d actionable items with average confidence of %.1f%%",
                insights.size(),
                (int) insights.stream().filter(AIInsightDto::getActionable).count(),
                insights.stream().mapToDouble(i -> i.getConfity() * 100).average().orElse(0));
    }

    private List<String> extractKeyFindings(List<AIInsightDto> insights) {
        return insights.stream()
                .filter(i -> i.getPriority() >= 7)
                .map(AIInsightDto::getTitle)
                .limit(10)
                .toList();
    }

    private Map<String, Object> analyzeTrends(List<AIInsightDto> insights) {
        return Map.of(
                "positiveTrends", insights.stream().filter(i -> i.getTitle().toLowerCase().contains("increase")).count(),
                "negativeTrends", insights.stream().filter(i -> i.getTitle().toLowerCase().contains("decrease")).count(),
                "neutralTrends", insights.stream().filter(i -> !i.getTitle().toLowerCase().contains("increase") && !i.getTitle().toLowerCase().contains("decrease")).count()
        );
    }

    private List<String> generateRecommendations(List<AIInsightDto> insights) {
        return insights.stream()
                .filter(AIInsightDto::getActionable)
                .flatMap(i -> i.getRecommendations().stream())
                .distinct()
                .limit(15)
                .toList();
    }

    private List<String> identifyRiskFactors(List<AIInsightDto> insights) {
        return insights.stream()
                .filter(i -> i.getSeverity().equals("HIGH") || i.getSeverity().equals("CRITICAL"))
                .map(AIInsightDto::getTitle)
                .limit(10)
                .toList();
    }

    private List<String> identifyOpportunities(List<AIInsightDto> insights) {
        return insights.stream()
                .filter(i -> i.getTitle().toLowerCase().contains("opportunity") || i.getTitle().toLowerCase().contains("growth"))
                .map(AIInsightDto::getTitle)
                .limit(10)
                .toList();
    }

    private Double calculateAnalysisConfity(List<AIInsightDto> insights) {
        return insights.stream()
                .mapToDouble(AIInsightDto::getConfity)
                .average()
                .orElse(0.0);
    }

    // DTO conversion methods
    private MLReportDto convertToDto(MLReport report) {
        return MLReportDto.builder()
                .id(report.getId())
                .tenantId(report.getTenantId())
                .title(report.getTitle())
                .description(report.getDescription())
                .reportType(report.getReportType())
                .contentType(report.getContentType())
                .reportContent(report.getReportContent())
                .visualizations(report.getVisualizations())
                .insights(report.getInsights())
                .status(report.getStatus())
                .generatedAt(report.getGeneratedAt())
                .generatedBy(report.getGeneratedBy())
                .validUntil(report.getValidUntil())
                .build();
    }

    private ReportTemplateDto convertToDto(ReportTemplate template) {
        return ReportTemplateDto.builder()
                .id(template.getId())
                .tenantId(template.getTenantId())
                .name(template.getName())
                .description(template.getDescription())
                .templateType(template.getTemplateType())
                .contentType(template.getContentType())
                .layout(template.getLayout())
                .sections(template.getSections())
                .styles(template.getStyles())
                .isPublic(template.getIsPublic())
                .isActive(template.getIsActive())
                .createdBy(template.getCreatedBy())
                .createdAt(template.getCreatedAt())
                .build();
    }

    // Placeholder methods for visualization generation
    private Map<String, Object> generateKPIChart(MLAnalysisResult analysis) {
        return Map.of("type", "kpi", "data", analysis.getKeyFindings());
    }

    private Map<String, Object> generateTrendChart(MLAnalysisResult analysis) {
        return Map.of("type", "trend", "data", analysis.getTrends());
    }

    private Map<String, Object> generateRiskMatrix(MLAnalysisResult analysis) {
        return Map.of("type", "risk", "data", analysis.getRiskFactors());
    }

    private Map<String, Object> generateRevenueChart(MLAnalysisResult analysis) {
        return Map.of("type", "revenue", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateCostChart(MLAnalysisResult analysis) {
        return Map.of("type", "cost", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateProfitabilityChart(MLAnalysisResult analysis) {
        return Map.of("type", "profitability", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateCustomerSegmentChart(MLAnalysisResult analysis) {
        return Map.of("type", "segment", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateLifetimeValueChart(MLAnalysisResult analysis) {
        return Map.of("type", "ltv", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateChurnAnalysisChart(MLAnalysisResult analysis) {
        return Map.of("type", "churn", "data", analysis.getRecommendations());
    }

    private Map<String, Object> generateSummaryChart(MLAnalysisResult analysis) {
        return Map.of("type", "summary", "data", analysis.getKeyFindings());
    }

    // Placeholder methods for data analysis
    private Map<String, Object> analyzeDataPatterns(UUID tenantId) {
        return Map.of("pattern", "growth", "seasonality", "quarterly");
    }

    private List<ReportRecommendationDto> generatePatternBasedRecommendations(UUID tenantId, Map<String, Object> patterns) {
        return List.of(
                ReportRecommendationDto.builder()
                        .title("Growth Trend Analysis")
                        .description("Analyze growth patterns and trends")
                        .priority(0.8)
                        .reportType("FINANCIAL_ANALYSIS")
                        .build()
        );
    }

    private List<ReportRecommendationDto> generateInsightBasedRecommendations(UUID tenantId, List<AIInsightDto> insights) {
        return List.of(
                ReportRecommendationDto.builder()
                        .title("AI Insights Summary")
                        .description("Summary of AI-generated insights")
                        .priority(0.9)
                        .reportType("EXECUTIVE_DASHBOARD")
                        .build()
        );
    }

    private List<ReportRecommendationDto> generateRoleBasedRecommendations(UUID tenantId, String userRole) {
        return List.of(
                ReportRecommendationDto.builder()
                        .title("Role-Specific Report")
                        .description("Report tailored for " + userRole)
                        .priority(0.7)
                        .reportType("CUSTOMER_ANALYTICS")
                        .build()
        );
    }

    private LocalDateTime calculateNextExecution(String schedule) {
        return LocalDateTime.now().plusDays(1); // Simplified
    }

    private void processScheduledReport(MLReport report) {
        // Process scheduled report logic
        report.setStatus(MLReport.Status.PROCESSING);
        mlReportRepository.save(report);
    }

    private List<UUID> getActiveTenants() {
        return List.of(UUID.randomUUID()); // Placeholder
    }

    private void generateDailyReportsForTenant(UUID tenantId) {
        // Generate daily reports logic
    }

    private Map<String, Object> getReportStatistics(UUID tenantId, AnalyticsRequest request) {
        return Map.of("totalReports", 50, "generatedToday", 5);
    }

    private Map<String, Object> getUsagePatterns(UUID tenantId, AnalyticsRequest request) {
        return Map.of("peakUsage", "morning", "averageDuration", 5.2);
    }

    private Map<String, Object> getPerformanceMetrics(UUID tenantId, AnalyticsRequest request) {
        return Map.of("averageGenerationTime", 3.5, "successRate", 0.95);
    }

    private Map<String, Object> getUserEngagement(UUID tenantId, AnalyticsRequest request) {
        return Map.of("activeUsers", 25, "averageRating", 4.3);
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class MLAnalysisResult {
        private String summary;
        private List<String> keyFindings;
        private Map<String, Object> trends;
        private List<String> recommendations;
        private List<String> riskFactors;
        private List<String> opportunities;
        private Double confidence;
        private LocalDateTime generatedAt;
    }
}
