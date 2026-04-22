package com.everx.hr.payroll;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    @Query("SELECT r FROM PayrollRun r WHERE r.isDeleted = false")
    Page<PayrollRun> findAllNotDeleted(Pageable pageable);
}
