package com.everx.compliance.repository;

import com.everx.compliance.entity.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrail, UUID> {
    
    List<AuditTrail> findByUserIdOrderByTimestampDesc(String userId);
    
    List<AuditTrail> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);
    
    @Query("SELECT a FROM AuditTrail a WHERE a.timestamp >= :since ORDER BY a.timestamp DESC")
    List<AuditTrail> findRecentAuditEntries(@Param("since") LocalDateTime since);
    
    @Query("SELECT a FROM AuditTrail a WHERE a.action = :action AND a.timestamp >= :since")
    List<AuditTrail> findByActionAndSince(@Param("action") String action, @Param("since") LocalDateTime since);
    
    List<AuditTrail> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
}
