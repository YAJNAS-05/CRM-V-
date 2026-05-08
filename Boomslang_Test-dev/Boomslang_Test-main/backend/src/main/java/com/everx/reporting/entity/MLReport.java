package com.everx.reporting.entity;

import com.everx.ai.dto.AIInsightDto;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "ml_reports", schema = "everx_reporting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class MLReport extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "report_type", nullable = false, length = 100)
    private String reportType;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "report_content", columnDefinition = "JSON")
    private Map<String, Object> reportContent;

    @Column(name = "visualizations", columnDefinition = "JSON")
    private Map<String, Object> visualizations;

    @ElementCollection
    @CollectionTable(name = "ml_report_insights", schema = "everx_reporting", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "insight_data", columnDefinition = "JSON")
    private List<AIInsightDto> insights;

    @Column(name = "analysis", columnDefinition = "JSON")
    private Map<String, Object> analysis;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "schedule", length = 100)
    private String schedule;

    @ElementCollection
    @CollectionTable(name = "ml_report_recipients", schema = "everx_reporting", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "recipient_email")
    private List<String> recipients;

    @Column(name = "auto_generate", nullable = false)
    @Builder.Default
    private Boolean autoGenerate = false;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "file_format", length = 10)
    private String fileFormat;

    @Column(name = "generation_time_ms")
    private Long generationTimeMs;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    @Column(name = "download_count", nullable = false)
    @Builder.Default
    private Long downloadCount = 0L;

    @Column(name = "share_count", nullable = false)
    @Builder.Default
    private Long shareCount = 0L;

    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    @Column(name = "last_downloaded_at")
    private LocalDateTime lastDownloadedAt;

    @Column(name = "feedback_score")
    private Double feedbackScore;

    @Column(name = "feedback_count", nullable = false)
    @Builder.Default
    private Long feedbackCount = 0L;

    @Column(name = "tags", columnDefinition = "JSON")
    private List<String> tags;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "template_id")
    private java.util.UUID templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", insertable = false, updatable = false)
    private ReportTemplate template;

    @Column(name = "version", nullable = false, length = 20)
    @Builder.Default
    private String version = "1.0";

    @Column(name = "parent_report_id")
    private java.util.UUID parentReportId;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Report types
    public static final String TYPE_EXECUTIVE_DASHBOARD = "EXECUTIVE_DASHBOARD";
    public static final String TYPE_FINANCIAL_ANALYSIS = "FINANCIAL_ANALYSIS";
    public static final String TYPE_CUSTOMER_ANALYTICS = "CUSTOMER_ANALYTICS";
    public static final String TYPE_OPERATIONAL_EFFICIENCY = "OPERATIONAL_EFFICIENCY";
    public static final String TYPE_SALES_PERFORMANCE = "SALES_PERFORMANCE";
    public static final String TYPE_MARKETING_ANALYSIS = "MARKETING_ANALYSIS";
    public static final String TYPE_HR_ANALYTICS = "HR_ANALYTICS";
    public static final String TYPE_RISK_ASSESSMENT = "RISK_ASSESSMENT";
    public static final String TYPE_CUSTOM = "CUSTOM";

    // Content types
    public static final String CONTENT_PDF = "PDF";
    public static final String CONTENT_EXCEL = "EXCEL";
    public static final String CONTENT_POWERPOINT = "POWERPOINT";
    public static final String CONTENT_HTML = "HTML";
    public static final String CONTENT_JSON = "JSON";
    public static final String CONTENT_CSV = "CSV";

    // Status enum
    public enum Status {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        SCHEDULED,
        EXPIRED,
        ARCHIVED
    }

    // Helper methods
    public boolean isCompleted() {
        return status == Status.COMPLETED;
    }

    public boolean isProcessing() {
        return status == Status.PROCESSING;
    }

    public boolean hasFailed() {
        return status == Status.FAILED;
    }

    public boolean isScheduled() {
        return status == Status.SCHEDULED;
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return validUntil == null || LocalDateTime.now().isBefore(validUntil);
    }

    public boolean isReadyForGeneration() {
        return status == Status.PENDING || (status == Status.SCHEDULED && scheduledAt != null && LocalDateTime.now().isAfter(scheduledAt));
    }

    public void markAsViewed() {
        this.viewCount++;
        this.lastViewedAt = LocalDateTime.now();
    }

    public void markAsDownloaded() {
        this.downloadCount++;
        this.lastDownloadedAt = LocalDateTime.now();
    }

    public void markAsShared() {
        this.shareCount++;
    }

    public void addFeedback(Double score) {
        if (feedbackScore == null) {
            feedbackScore = score;
            feedbackCount = 1L;
        } else {
            double totalScore = feedbackScore * feedbackCount + score;
            feedbackCount++;
            feedbackScore = totalScore / feedbackCount;
        }
    }

    public void startProcessing() {
        this.status = Status.PROCESSING;
    }

    public void completeGeneration(Long generationTimeMs, Long fileSizeBytes, String filePath) {
        this.status = Status.COMPLETED;
        this.generatedAt = LocalDateTime.now();
        this.generationTimeMs = generationTimeMs;
        this.fileSizeBytes = fileSizeBytes;
        this.filePath = filePath;
    }

    public void failGeneration() {
        this.status = Status.FAILED;
    }

    public void schedule(LocalDateTime scheduledAt) {
        this.status = Status.SCHEDULED;
        this.scheduledAt = scheduledAt;
    }

    public void expire() {
        this.status = Status.EXPIRED;
        this.expiresAt = LocalDateTime.now();
    }

    public void archive() {
        this.status = Status.ARCHIVED;
    }

    public String getReportInfo() {
        return String.format("%s (%s) - %s - Status: %s", 
                title, reportType, contentType, status);
    }

    public boolean isExecutiveReport() {
        return TYPE_EXECUTIVE_DASHBOARD.equals(reportType);
    }

    public boolean isFinancialReport() {
        return TYPE_FINANCIAL_ANALYSIS.equals(reportType);
    }

    public boolean isCustomerReport() {
        return TYPE_CUSTOMER_ANALYTICS.equals(reportType);
    }

    public boolean isOperationalReport() {
        return TYPE_OPERATIONAL_EFFICIENCY.equals(reportType);
    }

    public boolean isPDFReport() {
        return CONTENT_PDF.equals(contentType);
    }

    public boolean isExcelReport() {
        return CONTENT_EXCEL.equals(contentType);
    }

    public boolean isPowerPointReport() {
        return CONTENT_POWERPOINT.equals(contentType);
    }

    public boolean isHighPriority() {
        return priority >= 8;
    }

    public boolean hasInsights() {
        return insights != null && !insights.isEmpty();
    }

    public boolean hasVisualizations() {
        return visualizations != null && !visualizations.isEmpty();
    }

    public boolean hasRecipients() {
        return recipients != null && !recipients.isEmpty();
    }

    public boolean isAutoGenerated() {
        return autoGenerate;
    }

    public boolean isPublicReport() {
        return isPublic;
    }

    public String getDuration() {
        if (generationTimeMs == null) return "Unknown";
        if (generationTimeMs < 1000) return generationTimeMs + "ms";
        if (generationTimeMs < 60000) return (generationTimeMs / 1000) + "s";
        return (generationTimeMs / 60000) + "m";
    }

    public String getFileSize() {
        if (fileSizeBytes == null) return "Unknown";
        if (fileSizeBytes < 1024) return fileSizeBytes + "B";
        if (fileSizeBytes < 1024 * 1024) return (fileSizeBytes / 1024) + "KB";
        if (fileSizeBytes < 1024 * 1024 * 1024) return (fileSizeBytes / (1024 * 1024)) + "MB";
        return (fileSizeBytes / (1024 * 1024 * 1024)) + "GB";
    }

    public boolean hasPositiveFeedback() {
        return feedbackScore != null && feedbackScore >= 4.0;
    }

    public boolean isPopular() {
        return viewCount > 100 || downloadCount > 50 || shareCount > 10;
    }

    public String getEngagementMetrics() {
        return String.format("Views: %d, Downloads: %d, Shares: %d, Feedback: %.1f/5 (%d)", 
                viewCount, downloadCount, shareCount,
                feedbackScore != null ? feedbackScore : 0.0, feedbackCount);
    }

    public boolean shouldHighlight() {
        return isHighPriority() || isPopular() || hasPositiveFeedback();
    }

    public String getBusinessValue() {
        if (isExecutiveReport()) return "Strategic";
        if (isFinancialReport()) return "Financial";
        if (isCustomerReport()) return "Customer";
        if (isOperationalReport()) return "Operational";
        return "General";
    }

    public boolean isVersioned() {
        return parentReportId != null;
    }

    public boolean isTemplateBased() {
        return templateId != null;
    }

    public String getScheduleDescription() {
        if (schedule == null) return "Manual";
        if (schedule.contains("daily")) return "Daily";
        if (schedule.contains("weekly")) return "Weekly";
        if (schedule.contains("monthly")) return "Monthly";
        return schedule;
    }

    public boolean needsRegeneration() {
        if (generatedAt == null) return true;
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return generatedAt.isBefore(sevenDaysAgo) || isExpired();
    }

    public boolean canBeShared() {
        return isCompleted() && isValid() && !isExpired();
    }

    public String getReportSummary() {
        return String.format("[%s] %s - %s - Generated: %s - Views: %d", 
                status, title, reportType, 
                generatedAt != null ? generatedAt.toLocalDate() : "Not generated",
                viewCount);
    }
}
