package com.everx.collaboration.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_operations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentOperation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private CollaborationSession session;
    
    @Column(name = "session_id", insertable = false, updatable = false)
    private UUID sessionId;
    
    private String userId;
    
    private String operationType;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private int position;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
