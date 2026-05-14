package com.everx.reporting.repository;

import com.everx.reporting.entity.ScheduledReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReportEntity, Long> {
    List<ScheduledReportEntity> findByFrequencyAndIsActive(String frequency, Boolean isActive);
    List<ScheduledReportEntity> findByReportId(Long reportId);
}
