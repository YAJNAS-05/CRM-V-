package com.everx.hr.payroll;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PayrollItemRepository extends JpaRepository<PayrollItem, UUID> {
    List<PayrollItem> findByPayrollRunId(UUID payrollRunId);
}
