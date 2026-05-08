package com.everx.integration.entity;

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
@Table(name = "data_mappings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataMapping {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "source_entity_type", nullable = false)
    private String sourceEntityType;

    @Column(name = "target_entity_type", nullable = false)
    private String targetEntityType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_mappings")
    private List<FieldMapping> fieldMappings;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "transformation_logic")
    private Map<String, Object> transformationLogic;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_rules")
    private List<ValidationRule> validationRules;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "usage_count")
    private Long usageCount;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "success_count")
    private Long successCount;

    @Column(name = "failure_count")
    private Long failureCount;

    @Column(name = "version")
    private Integer version;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "is_default")
    private Boolean isDefault;

    @Column(name = "source_system")
    private String sourceSystem;

    @Column(name = "target_system")
    private String targetSystem;

    // Helper methods
    public boolean isActive() {
        return isActive != null && isActive;
    }

    public double getSuccessRate() {
        if (usageCount == null || usageCount == 0) {
            return 0.0;
        }
        return (double) (successCount == null ? 0L : successCount) / usageCount;
    }

    public void recordUsage(boolean success) {
        this.usageCount = (this.usageCount == null ? 0L : this.usageCount) + 1;
        this.lastUsedAt = LocalDateTime.now();
        
        if (success) {
            this.successCount = (this.successCount == null ? 0L : this.successCount) + 1;
        } else {
            this.failureCount = (this.failureCount == null ? 0L : this.failureCount) + 1;
        }
    }

    public boolean isDefaultMapping() {
        return isDefault != null && isDefault;
    }

    public boolean isHighPriority() {
        return priority != null && priority >= 8;
    }

    public void incrementVersion() {
        this.version = (this.version == null ? 1 : this.version + 1);
    }

    public boolean hasFieldMappings() {
        return fieldMappings != null && !fieldMappings.isEmpty();
    }

    public boolean hasValidationRules() {
        return validationRules != null && !validationRules.isEmpty();
    }

    public boolean hasTransformationLogic() {
        return transformationLogic != null && !transformationLogic.isEmpty();
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldMapping {
        private String sourceField;
        private String targetField;
        private String transformationType;
        private boolean required;
        private String defaultValue;
        private Map<String, Object> transformationParams;
        private String description;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationRule {
        private String ruleType;
        private String field;
        private String condition;
        private String errorMessage;
        private boolean isBlocking;
        private Map<String, Object> parameters;
    }
}
