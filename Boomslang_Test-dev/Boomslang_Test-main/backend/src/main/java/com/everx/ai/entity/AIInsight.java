package com.everx.ai.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "ai_insight", schema = "everx_ai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AIInsight extends BaseEntity {
    @Column(name = "insight_type", length = 50)
    private String insightType;
    
    @Column(name = "title", length = 200)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "model_id")
    private UUID modelId;
    
    @Column(name = "tenant_id")
    private UUID tenantId;
    
    @Column(name = "is_actionable", nullable = false)
    @Builder.Default
    private Boolean isActionable = false;
    
    @Column(name = "status", length = 20)
    private String status;
    
    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
