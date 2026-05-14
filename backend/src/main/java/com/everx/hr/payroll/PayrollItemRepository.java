package com.everx.hr.payroll;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PayrollItemRepository extends JpaRepository<PayrollItem, UUID> {
    List<PayrollItem> findByPayrollRunId(UUID payrollRunId);

    @Query("SELECT COALESCE(SUM(p.grossPay), 0) FROM PayrollItem p WHERE p.payrollRunId = :runId AND p.isDeleted = false")
    BigDecimal sumGrossPayByPayrollRunId(@Param("runId") UUID runId);
}
