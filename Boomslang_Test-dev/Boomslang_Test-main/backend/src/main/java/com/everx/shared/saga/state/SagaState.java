package com.everx.shared.saga.state;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Saga State persistence entity
 * Tracks multi-step workflow execution with automatic rollback capability
 */
@Entity
@Table(name = "saga_states", schema = "everx_shared")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SagaState {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String sagaId;
    
    @Column(name = "reference_id", nullable = false)
    private UUID referenceId;

    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SagaStatus status;
    
    @Column(nullable = false)
    private String currentStep;
    
    @Column(columnDefinition = "TEXT")
    private String contextJson;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(nullable = false)
    private OffsetDateTime createdAt;
    
    @Column(nullable = false)
    private OffsetDateTime updatedAt;
    
    private Integer retryCount;
    
    @Transient
    private Map<String, Object> context;
    
    @PostLoad
    public void deserializeContext() {
        if (contextJson != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                this.context = mapper.readValue(contextJson, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                // Handle error
            }
        }
    }
    
    @PrePersist
    @PreUpdate
    public void serializeContext() {
        if (context != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                this.contextJson = mapper.writeValueAsString(context);
            } catch (Exception e) {
                // Handle error
            }
        }
    }
    
    public enum SagaStatus {
        STARTED,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        COMPENSATING,
        COMPENSATED
    }
}
