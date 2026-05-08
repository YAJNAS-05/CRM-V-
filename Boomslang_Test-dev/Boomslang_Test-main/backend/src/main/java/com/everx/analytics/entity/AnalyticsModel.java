package com.everx.analytics.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "analytics_model", schema = "everx_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AnalyticsModel extends BaseEntity {
    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;
    @Column(name = "model_type", length = 50)
    private String modelType;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "configuration", columnDefinition = "TEXT")
    private String configuration;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
