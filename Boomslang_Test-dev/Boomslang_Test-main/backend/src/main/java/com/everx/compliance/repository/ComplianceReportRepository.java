package com.everx.compliance.repository;

import com.everx.compliance.entity.ComplianceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplianceReportRepository extends JpaRepository<ComplianceReport, UUID> {
    
    List<ComplianceReport> findByFrameworkIdOrderByReportDateDesc(UUID frameworkId);
    
    List<ComplianceReport> findByStatus(String status);
    
    Optional<ComplianceReport> findByFrameworkIdAndLatestTrue(UUID frameworkId);
    
    @Query("SELECT cr FROM ComplianceReport cr WHERE cr.reportDate >= :since ORDER BY cr.reportDate DESC")
    List<ComplianceReport> findRecentReports(@Param("since") LocalDateTime since);
    
    @Query("SELECT cr FROM ComplianceReport cr WHERE cr.overallScore < :threshold ORDER BY cr.overallScore ASC")
    List<ComplianceReport> findLowScoringReports(@Param("threshold") double threshold);
    
    List<ComplianceReport> findByReportDateBetweenOrderByReportDateDesc(LocalDateTime start, LocalDateTime end);
}
