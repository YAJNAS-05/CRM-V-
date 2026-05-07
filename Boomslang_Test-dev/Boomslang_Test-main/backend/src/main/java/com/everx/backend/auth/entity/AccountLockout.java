package com.everx.backend.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing account lockout information
 */
@Entity
@Table(name = "account_lockouts", schema = "everx_auth")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountLockout {
    
    @Id
    @Column(columnDefinition = "UUID")
    private UUID id;
    
    @Column(nullable = false, columnDefinition = "UUID")
    private UUID userId;
    
    @Column(nullable = false)
    private Integer failedAttempts = 0;
    
    @Column
    private LocalDateTime lockedUntil;
    
    @Column
    private String lockoutReason;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(columnDefinition = "UUID")
    private UUID createdBy;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @Version
    private Long version;
    
    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
