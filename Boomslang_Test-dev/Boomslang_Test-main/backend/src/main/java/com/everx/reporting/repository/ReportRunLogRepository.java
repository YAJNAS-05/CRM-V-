package com.everx.reporting.repository;

import com.everx.reporting.entity.ReportRunLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRunLogRepository extends JpaRepository<ReportRunLogEntity, Long> {
    List<ReportRunLogEntity> findByReportId(Long reportId);
    List<ReportRunLogEntity> findByRunBy(String runBy);
}
