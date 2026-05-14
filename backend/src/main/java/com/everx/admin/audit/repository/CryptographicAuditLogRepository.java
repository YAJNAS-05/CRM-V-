package com.everx.admin.audit.repository;

import com.everx.admin.audit.entity.CryptographicAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CryptographicAuditLogRepository extends JpaRepository<CryptographicAuditLog, UUID> {
    
    Page<CryptographicAuditLog> findByEntityTypeAndEntityId(String entityType, UUID entityId, Pageable pageable);
    
    Page<CryptographicAuditLog> findByUserId(UUID userId, Pageable pageable);
    
    List<CryptographicAuditLog> findByEntityTypeAndEntityIdOrderByTimestampAsc(String entityType, UUID entityId);
    
    Optional<CryptographicAuditLog> findTopByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);
}
