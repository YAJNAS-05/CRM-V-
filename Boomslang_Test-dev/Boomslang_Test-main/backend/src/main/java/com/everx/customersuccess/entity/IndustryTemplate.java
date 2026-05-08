package com.everx.customersuccess.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "industry_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndustryTemplate {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "industry", nullable = false)
    private Industry industry;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size_category")
    private CompanySizeCategory companySizeCategory;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "usage_count")
    private Long usageCount;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "number_of_ratings")
    private Integer numberOfRatings;

    @Column(name = "estimated_setup_time_hours")
    private Integer estimatedSetupTimeHours;

    @Column(name = "complexity_level")
    private String complexityLevel;

    @Column(name = "prerequisites")
    private String prerequisites;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuration")
    private Map<String, Object> configuration;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features")
    private List<TemplateFeature> features;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "workflows")
    private List<TemplateWorkflow> workflows;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dashboards")
    private List<TemplateDashboard> dashboards;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "reports")
    private List<TemplateReport> reports;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "integrations")
    private List<TemplateIntegration> integrations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings")
    private List<TemplateSetting> settings;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "user_roles")
    private List<TemplateUserRole> userRoles;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions")
    private List<TemplatePermission> permissions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "best_practices")
    private List<BestPractice> bestPractices;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "compliance_requirements")
    private List<ComplianceRequirement> complianceRequirements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "training_materials")
    private List<TrainingMaterial> trainingMaterials;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checklist")
    private List<ChecklistItem> checklist;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private String publishedBy;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "language")
    private String language;

    @Column(name = "region")
    private String region;

    // Helper methods
    public boolean isPublished() {
        return publishedAt != null;
    }

    public boolean canBeUsed() {
        return isActive != null && isActive && isPublished();
    }

    public boolean isPopular() {
        return usageCount != null && usageCount > 100;
    }

    public boolean isHighlyRated() {
        return rating != null && rating >= 4.5 && numberOfRatings != null && numberOfRatings >= 10;
    }

    public boolean isComplex() {
        return "HIGH".equals(complexityLevel) || 
               (estimatedSetupTimeHours != null && estimatedSetupTimeHours > 40);
    }

    public boolean isSimple() {
        return "LOW".equals(complexityLevel) || 
               (estimatedSetupTimeHours != null && estimatedSetupTimeHours <= 8);
    }

    public void incrementUsage() {
        this.usageCount = (this.usageCount == null ? 0L : this.usageCount) + 1;
        this.lastUsedAt = LocalDateTime.now();
    }

    public void updateRating(Integer newRating) {
        if (this.rating == null || this.numberOfRatings == null) {
            this.rating = newRating.doubleValue();
            this.numberOfRatings = 1;
        } else {
            double totalRating = this.rating * this.numberOfRatings + newRating;
            this.numberOfRatings++;
            this.rating = totalRating / this.numberOfRatings;
        }
    }

    public void publish(String publishedBy) {
        this.publishedAt = LocalDateTime.now();
        this.publishedBy = publishedBy;
        this.isActive = true;
    }

    public void unpublish() {
        this.publishedAt = null;
        this.publishedBy = null;
        this.isActive = false;
    }

    public void addFeature(TemplateFeature feature) {
        if (this.features == null) {
            this.features = new java.util.ArrayList<>();
        }
        this.features.add(feature);
    }

    public void addWorkflow(TemplateWorkflow workflow) {
        if (this.workflows == null) {
            this.workflows = new java.util.ArrayList<>();
        }
        this.workflows.add(workflow);
    }

    public void addDashboard(TemplateDashboard dashboard) {
        if (this.dashboards == null) {
            this.dashboards = new java.util.ArrayList<>();
        }
        this.dashboards.add(dashboard);
    }

    public void addIntegration(TemplateIntegration integration) {
        if (this.integrations == null) {
            this.integrations = new java.util.ArrayList<>();
        }
        this.integrations.add(integration);
    }

    public void addBestPractice(BestPractice bestPractice) {
        if (this.bestPractices == null) {
            this.bestPractices = new java.util.ArrayList<>();
        }
        this.bestPractices.add(bestPractice);
    }

    public void addComplianceRequirement(ComplianceRequirement requirement) {
        if (this.complianceRequirements == null) {
            this.complianceRequirements = new java.util.ArrayList<>();
        }
        this.complianceRequirements.add(requirement);
    }

    public void addTrainingMaterial(TrainingMaterial material) {
        if (this.trainingMaterials == null) {
            this.trainingMaterials = new java.util.ArrayList<>();
        }
        this.trainingMaterials.add(material);
    }

    public long getEnabledFeaturesCount() {
        if (features == null) return 0;
        return features.stream()
                .filter(TemplateFeature::isEnabled)
                .count();
    }

    public long getTotalFeaturesCount() {
        return features == null ? 0 : features.size();
    }

    public long getRequiredIntegrationsCount() {
        if (integrations == null) return 0;
        return integrations.stream()
                .filter(integration -> IntegrationRequirement.REQUIRED.equals(integration.getRequirement()))
                .count();
    }

    public boolean hasComplianceRequirements() {
        return complianceRequirements != null && !complianceRequirements.isEmpty();
    }

    public boolean hasTrainingMaterials() {
        return trainingMaterials != null && !trainingMaterials.isEmpty();
    }

    public enum Industry {
        TECHNOLOGY,
        HEALTHCARE,
        FINANCIAL_SERVICES,
        RETAIL,
        MANUFACTURING,
        EDUCATION,
        GOVERNMENT,
        NON_PROFIT,
        PROFESSIONAL_SERVICES,
        CONSTRUCTION,
        HOSPITALITY,
        TRANSPORTATION,
        REAL_ESTATE,
        ENERGY,
        AGRICULTURE,
        MEDIA,
        TELECOMMUNICATIONS,
        INSURANCE,
        LEGAL,
        CONSULTING,
        OTHER
    }

    public enum TemplateType {
        ONBOARDING,
        OPERATIONAL,
        COMPLIANCE,
        ANALYTICS,
        AUTOMATION,
        INTEGRATION,
        SECURITY,
        CUSTOMER_SUCCESS,
        SALES,
        MARKETING,
        HR,
        FINANCE,
        CUSTOM
    }

    public enum CompanySizeCategory {
        STARTUP,           // 1-10 employees
        SMALL,             // 11-50 employees
        MEDIUM_SMALL,      // 51-200 employees
        MEDIUM,            // 201-500 employees
        MEDIUM_LARGE,      // 501-1000 employees
        LARGE,             // 1001-5000 employees
        ENTERPRISE         // 5000+ employees
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateFeature {
        private String name;
        private String description;
        private Boolean isEnabled;
        private Boolean isRequired;
        private String category;
        private String module;
        private Map<String, Object> configuration;
        private List<String> dependencies;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateWorkflow {
        private String name;
        private String description;
        private String workflowType;
        private Boolean isEnabled;
        private Map<String, Object> configuration;
        private List<String> triggers;
        private List<String> actions;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateDashboard {
        private String name;
        private String description;
        private String dashboardType;
        private Boolean isEnabled;
        private List<String> widgets;
        private Map<String, Object> layout;
        private String refreshInterval;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateReport {
        private String name;
        private String description;
        private String reportType;
        private Boolean isEnabled;
        private List<String> metrics;
        private Map<String, Object> filters;
        private String schedule;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateIntegration {
        private String name;
        private String provider;
        private IntegrationRequirement requirement;
        private Boolean isEnabled;
        private Map<String, Object> configuration;
        private String documentation;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateSetting {
        private String key;
        private String value;
        private String description;
        private String dataType;
        private Boolean isRequired;
        private String category;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateUserRole {
        private String roleName;
        private String description;
        private List<String> permissions;
        private Boolean isDefault;
        private String category;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplatePermission {
        private String name;
        private String description;
        private String resource;
        private List<String> actions;
        private String category;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BestPractice {
        private String title;
        private String description;
        private String category;
        private String importance;
        private List<String> steps;
        private List<String> resources;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplianceRequirement {
        private String name;
        private String description;
        private String standard;
        private String category;
        private Boolean isMandatory;
        private List<String> controls;
        private String documentation;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingMaterial {
        private String title;
        private String description;
        private String type;
        private String url;
        private String duration;
        private String category;
        private Boolean isRequired;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChecklistItem {
        private String title;
        private String description;
        private Boolean isCompleted;
        private String category;
        private Integer order;
        private List<String> resources;
    }

    public enum IntegrationRequirement {
        OPTIONAL,
        RECOMMENDED,
        REQUIRED
    }
}
