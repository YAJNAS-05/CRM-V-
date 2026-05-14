package com.everx.reporting.repository;

import com.everx.reporting.entity.FilterPresetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilterPresetRepository extends JpaRepository<FilterPresetEntity, Long> {
    List<FilterPresetEntity> findByReportIdAndUserEmail(Long reportId, String userEmail);
    FilterPresetEntity findByReportIdAndUserEmailAndIsDefaultTrue(Long reportId, String userEmail);
}
