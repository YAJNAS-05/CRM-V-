package com.everx.reporting.repository;

import com.everx.reporting.entity.ReportDefinitionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportDefinitionRepository extends JpaRepository<ReportDefinitionEntity, Long> {
    
    Optional<ReportDefinitionEntity> findByReportKey(String reportKey);
    
    Page<ReportDefinitionEntity> findByModuleAndIsActive(String module, Boolean isActive, Pageable pageable);
    
    Page<ReportDefinitionEntity> findByReportTypeAndIsActive(String reportType, Boolean isActive, Pageable pageable);
    
    Page<ReportDefinitionEntity> findByOwnedBy(String ownedBy, Pageable pageable);
    
    List<ReportDefinitionEntity> findByModuleAndIsSystemTrue(String module);
    
    @Query("SELECT r FROM ReportDefinitionEntity r WHERE r.module = :module AND r.isActive = true ORDER BY r.reportName ASC")
    List<ReportDefinitionEntity> findActiveByModule(@Param("module") String module);

    boolean existsByReportName(String reportName);
}
