package com.everx.compliance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "compliance_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "framework_id", nullable = false)
    private ComplianceFramework framework;
    
    @Column(name = "framework_id", insertable = false, updatable = false)
    private UUID frameworkId;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    private double overallScore;
    
    private String status;
    
    private boolean latest;
    
    @Column(name = "report_date")
    private LocalDateTime reportDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (reportDate == null) {
            reportDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
