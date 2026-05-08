package com.everx.subscription.entity;

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

@Entity
@Table(name = "subscription_features", schema = "everx_subscription", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"feature_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class SubscriptionFeature extends BaseEntity {

    @Column(name = "feature_key", nullable = false, unique = true, length = 100)
    private String featureKey;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_premium", nullable = false)
    @Builder.Default
    private Boolean isPremium = false;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "feature_type", length = 50)
    @Builder.Default
    private String featureType = "BOOLEAN"; // BOOLEAN, NUMERIC, TEXT

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules; // JSON validation rules

    // Helper methods
    public boolean isBooleanFeature() {
        return "BOOLEAN".equals(featureType);
    }

    public boolean isNumericFeature() {
        return "NUMERIC".equals(featureType);
    }

    public boolean isTextFeature() {
        return "TEXT".equals(featureType);
    }

    public Object getDefaultValueParsed() {
        if (defaultValue == null) return null;
        
        return switch (featureType) {
            case "BOOLEAN" -> Boolean.parseBoolean(defaultValue);
            case "NUMERIC" -> Integer.parseInt(defaultValue);
            default -> defaultValue;
        };
    }
}
