package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FieldJobReportRepository extends JpaRepository<FieldJobReport, Long> {
    Optional<FieldJobReport> findByFieldJob_Id(UUID fieldJobId);
    boolean existsByReportNumber(String reportNumber);
}