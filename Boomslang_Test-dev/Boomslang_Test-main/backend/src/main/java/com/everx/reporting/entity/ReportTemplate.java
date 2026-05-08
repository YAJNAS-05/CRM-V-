package com.everx.reporting.entity;

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
@Table(name = "report_templates", schema = "everx_reporting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ReportTemplate extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "template_type", nullable = false, length = 100)
    private String templateType;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "layout", columnDefinition = "JSON")
    private Map<String, Object> layout;

    @Column(name = "sections", columnDefinition = "JSON")
    private List<Map<String, Object>> sections;

    @Column(name = "styles", columnDefinition = "JSON")
    private Map<String, Object> styles;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Long usageCount = 0L;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "rating_count", nullable = false)
    @Builder.Default
    private Long ratingCount = 0L;

    @Column(name = "tags", columnDefinition = "JSON")
    private List<String> tags;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "thumbnail", length = 500)
    private String thumbnail;

    @Column(name = "preview_data", columnDefinition = "JSON")
    private Map<String, Object> previewData;

    @Column(name = "version", nullable = false, length = 20)
    @Builder.Default
    private String version = "1.0";

    @Column(name = "parent_template_id")
    private java.util.UUID parentTemplateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_template_id", insertable = false, updatable = false)
    private ReportTemplate parentTemplate;

    @Column(name = "is_system_template", nullable = false)
    @Builder.Default
    private Boolean isSystemTemplate = false;

    @Column(name = "complexity", nullable = false)
    @Builder.Default
    private Integer complexity = 1; // 1-5 scale

    @Column(name = "estimated_generation_time")
    private Integer estimatedGenerationTime; // in seconds

    @Column(name = "required_data_sources", columnDefinition = "JSON")
    private List<String> requiredDataSources;

    @Column(name = "supported_formats", columnDefinition = "JSON")
    private List<String> supportedFormats;

    @Column(name = "customization_options", columnDefinition = "JSON")
    private Map<String, Object> customizationOptions;

    @Column(name = "validation_rules", columnDefinition = "JSON")
    private Map<String, Object> validationRules;

    // Template types
    public static final String TYPE_EXECUTIVE_DASHBOARD = "EXECUTIVE_DASHBOARD";
    public static final String TYPE_FINANCIAL_REPORT = "FINANCIAL_REPORT";
    public static final String TYPE_CUSTOMER_ANALYTICS = "CUSTOMER_ANALYTICS";
    public static final String TYPE_OPERATIONAL_REPORT = "OPERATIONAL_REPORT";
    public static final String TYPE_SALES_REPORT = "SALES_REPORT";
    public static final String TYPE_MARKETING_REPORT = "MARKETING_REPORT";
    public static final String TYPE_HR_REPORT = "HR_REPORT";
    public static final String TYPE_CUSTOM = "CUSTOM";

    // Content types
    public static final String CONTENT_PDF = "PDF";
    public static final String CONTENT_EXCEL = "EXCEL";
    public static final String CONTENT_POWERPOINT = "POWERPOINT";
    public static final String CONTENT_HTML = "HTML";
    public static final String CONTENT_DASHBOARD = "DASHBOARD";

    // Helper methods
    public boolean isActive() {
        return isActive;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public boolean isSystemTemplate() {
        return isSystemTemplate;
    }

    public boolean isCustomTemplate() {
        return !isSystemTemplate;
    }

    public void markAsUsed() {
        this.usageCount++;
    }

    public void addRating(Double score) {
        if (rating == null) {
            rating = score;
            ratingCount = 1L;
        } else {
            double totalRating = rating * ratingCount + score;
            ratingCount++;
            rating = totalRating / ratingCount;
        }
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void makePublic() {
        this.isPublic = true;
    }

    public void makePrivate() {
        this.isPublic = false;
    }

    public void setAsDefault() {
        this.isDefault = true;
    }

    public void unsetAsDefault() {
        this.isDefault = false;
    }

    public String getTemplateInfo() {
        return String.format("%s (%s) - %s - Usage: %d", 
                name, templateType, contentType, usageCount);
    }

    public boolean isExecutiveTemplate() {
        return TYPE_EXECUTIVE_DASHBOARD.equals(templateType);
    }

    public boolean isFinancialTemplate() {
        return TYPE_FINANCIAL_REPORT.equals(templateType);
    }

    public boolean isCustomerTemplate() {
        return TYPE_CUSTOMER_ANALYTICS.equals(templateType);
    }

    public boolean isOperationalTemplate() {
        return TYPE_OPERATIONAL_REPORT.equals(templateType);
    }

    public boolean isPDFSupported() {
        return supportedFormats == null || supportedFormats.contains(CONTENT_PDF);
    }

    public boolean isExcelSupported() {
        return supportedFormats == null || supportedFormats.contains(CONTENT_EXCEL);
    }

    public boolean isPowerPointSupported() {
        return supportedFormats == null || supportedFormats.contains(CONTENT_POWERPOINT);
    }

    public boolean isHTMLSupported() {
        return supportedFormats == null || supportedFormats.contains(CONTENT_HTML);
    }

    public boolean isDashboardSupported() {
        return supportedFormats == null || supportedFormats.contains(CONTENT_DASHBOARD);
    }

    public boolean isComplex() {
        return complexity >= 4;
    }

    public boolean isSimple() {
        return complexity <= 2;
    }

    public String getComplexityLabel() {
        return switch (complexity) {
            case 1 -> "Very Simple";
            case 2 -> "Simple";
            case 3 -> "Moderate";
            case 4 -> "Complex";
            case 5 -> "Very Complex";
            default -> "Unknown";
        };
    }

    public boolean hasSections() {
        return sections != null && !sections.isEmpty();
    }

    public boolean hasLayout() {
        return layout != null && !layout.isEmpty();
    }

    public boolean hasStyles() {
        return styles != null && !styles.isEmpty();
    }

    public boolean hasTags() {
        return tags != null && !tags.isEmpty();
    }

    public boolean hasThumbnail() {
        return thumbnail != null && !thumbnail.isEmpty();
    }

    public boolean hasPreview() {
        return previewData != null && !previewData.isEmpty();
    }

    public boolean hasDataSources() {
        return requiredDataSources != null && !requiredDataSources.isEmpty();
    }

    public boolean hasCustomizationOptions() {
        return customizationOptions != null && !customizationOptions.isEmpty();
    }

    public boolean hasValidationRules() {
        return validationRules != null && !validationRules.isEmpty();
    }

    public boolean isPopular() {
        return usageCount > 50;
    }

    public boolean hasGoodRating() {
        return rating != null && rating >= 4.0;
    }

    public String getEstimatedTime() {
        if (estimatedGenerationTime == null) return "Unknown";
        if (estimatedGenerationTime < 60) return estimatedGenerationTime + "s";
        if (estimatedGenerationTime < 3600) return (estimatedGenerationTime / 60) + "m";
        return (estimatedGenerationTime / 3600) + "h";
    }

    public String getUsageMetrics() {
        return String.format("Usage: %d, Rating: %.1f/5 (%d)", 
                usageCount, rating != null ? rating : 0.0, ratingCount);
    }

    public boolean isNewTemplate() {
        return createdAt != null && createdAt.isAfter(LocalDateTime.now().minusDays(30));
    }

    public boolean isRecentlyUsed() {
        return usageCount > 0 && usageCount < 10;
    }

    public boolean isFrequentlyUsed() {
        return usageCount >= 25;
    }

    public String getBusinessValue() {
        if (isExecutiveTemplate()) return "Strategic";
        if (isFinancialTemplate()) return "Financial";
        if (isCustomerTemplate()) return "Customer";
        if (isOperationalTemplate()) return "Operational";
        return "General";
    }

    public boolean isVersioned() {
        return parentTemplateId != null;
    }

    public boolean supportsFormat(String format) {
        return supportedFormats == null || supportedFormats.contains(format);
    }

    public boolean requiresDataSource(String dataSource) {
        return requiredDataSources != null && requiredDataSources.contains(dataSource);
    }

    public boolean hasCustomization() {
        return hasCustomizationOptions();
    }

    public boolean isValidForGeneration() {
        return isActive && hasLayout() && hasSections();
    }

    public String getTemplateSummary() {
        return String.format("[%s] %s - %s - Usage: %d - Rating: %.1f", 
                isActive ? "Active" : "Inactive", name, templateType, 
                usageCount, rating != null ? rating : 0.0);
    }

    public boolean shouldHighlight() {
        return isDefault() || isPopular() || hasGoodRating() || isNewTemplate();
    }

    public String getComplexityColor() {
        return switch (complexity) {
            case 1, 2 -> "#00AA00"; // Green
            case 3 -> "#FFAA00"; // Yellow
            case 4, 5 -> "#FF6600"; // Orange
            default -> "#666666"; // Gray
        };
    }

    public boolean isRecommended() {
        return hasGoodRating() && isPopular() && isValidForGeneration();
    }

    public String getRecommendationReason() {
        List<String> reasons = new ArrayList<>();
        if (hasGoodRating()) reasons.add("Highly rated");
        if (isPopular()) reasons.add("Popular choice");
        if (isValidForGeneration()) reasons.add("Reliable");
        if (isNewTemplate()) reasons.add("Recently updated");
        
        return String.join(", ", reasons);
    }

    public boolean canBeCustomized() {
        return hasCustomizationOptions();
    }

    public boolean hasValidation() {
        return hasValidationRules();
    }

    public String getSupportedFormatsString() {
        if (supportedFormats == null || supportedFormats.isEmpty()) {
            return "All formats";
        }
        return String.join(", ", supportedFormats);
    }

    public String getRequiredDataSourcesString() {
        if (requiredDataSources == null || requiredDataSources.isEmpty()) {
            return "No specific requirements";
        }
        return String.join(", ", requiredDataSources);
    }
}
