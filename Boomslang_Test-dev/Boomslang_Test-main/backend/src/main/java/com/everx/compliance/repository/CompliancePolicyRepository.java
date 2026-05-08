package com.everx.compliance.repository;

import com.everx.compliance.entity.CompliancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompliancePolicyRepository extends JpaRepository<CompliancePolicy, UUID> {
    
    Optional<CompliancePolicy> findByCode(String code);
    
    List<CompliancePolicy> findByFrameworkId(UUID frameworkId);
    
    List<CompliancePolicy> findByStatus(String status);
    
    @Query("SELECT cp FROM CompliancePolicy cp WHERE cp.status = 'ACTIVE' ORDER BY cp.name")
    List<CompliancePolicy> findActivePolicies();
    
    @Query("SELECT cp FROM CompliancePolicy cp WHERE cp.mandatory = true")
    List<CompliancePolicy> findMandatoryPolicies();
    
    List<CompliancePolicy> findByFrameworkIdAndStatus(UUID frameworkId, String status);
}
