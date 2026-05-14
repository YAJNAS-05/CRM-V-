package com.everx.admin.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Write-once cryptographic audit log entity
 * Used for compliance and tamper detection
 */
@Entity
@Table(name = "cryptographic_audit_logs", schema = "everx_auth", 
       indexes = {
           @Index(name = "idx_crypt_audit_entity", columnList = "entity_type, entity_id"),
           @Index(name = "idx_crypt_audit_user", columnList = "user_id"),
           @Index(name = "idx_crypt_audit_timestamp", columnList = "timestamp")
       })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CryptographicAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = false)
    private String action;
    
    @Column(nullable = false)
    private String entityType;
    
    @Column(nullable = false)
    private UUID entityId;
    
    @Column(columnDefinition = "TEXT")
    private String oldValue;
    
    @Column(columnDefinition = "TEXT")
    private String newValue;
    
    @Column(nullable = false)
    private String ipAddress;
    
    /**
     * SHA-256 hash of this entry
     * Created from: userId + action + entityType + entityId + oldValue + newValue + previousHash
     */
    @Column(nullable = false, length = 500)
    private String hash;
    
    /**
     * SHA-256 hash of previous entry (creates chain)
     * "ROOT" if this is first entry for this entity
     */
    @Column(nullable = false, length = 500)
    private String previousHash;
    
    @Column(nullable = false)
    private OffsetDateTime timestamp;
    
    /**
     * Write-once flag: set to true after insert to prevent updates
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isLocked = true;
}
