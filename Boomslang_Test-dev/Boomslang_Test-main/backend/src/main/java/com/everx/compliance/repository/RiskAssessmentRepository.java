package com.everx.compliance.repository;

import com.everx.compliance.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, UUID> {
    
    List<RiskAssessment> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
    
    List<RiskAssessment> findByRiskLevelOrderByCreatedAtDesc(String riskLevel);
    
    List<RiskAssessment> findByStatus(String status);
    
    @Query("SELECT ra FROM RiskAssessment ra WHERE ra.riskLevel = :level AND ra.status != 'RESOLVED'")
    List<RiskAssessment> findActiveRisksByLevel(@Param("level") String level);
    
    @Query("SELECT ra FROM RiskAssessment ra WHERE ra.createdAt >= :since ORDER BY ra.createdAt DESC")
    List<RiskAssessment> findRecentAssessments(@Param("since") LocalDateTime since);
    
    List<RiskAssessment> findByEntityTypeOrderByCreatedAtDesc(String entityType);
}
