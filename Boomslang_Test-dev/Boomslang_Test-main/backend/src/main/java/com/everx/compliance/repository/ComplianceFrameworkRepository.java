package com.everx.compliance.repository;

import com.everx.compliance.entity.ComplianceFramework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplianceFrameworkRepository extends JpaRepository<ComplianceFramework, UUID> {
    
    Optional<ComplianceFramework> findByCode(String code);
    
    List<ComplianceFramework> findByStatus(String status);
    
    List<ComplianceFramework> findByCategory(String category);
    
    @Query("SELECT cf FROM ComplianceFramework cf WHERE cf.status = 'ACTIVE' ORDER BY cf.name")
    List<ComplianceFramework> findActiveFrameworks();
    
    @Query("SELECT cf FROM ComplianceFramework cf WHERE cf.mandatory = true")
    List<ComplianceFramework> findMandatoryFrameworks();
}
