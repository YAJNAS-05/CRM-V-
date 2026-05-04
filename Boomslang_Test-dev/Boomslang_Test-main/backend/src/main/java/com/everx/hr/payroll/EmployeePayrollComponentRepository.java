package com.everx.hr.payroll;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeePayrollComponentRepository extends JpaRepository<EmployeePayrollComponent, UUID> {
    List<EmployeePayrollComponent> findByEmployeeIdAndIsDeletedFalse(UUID employeeId);

    Optional<EmployeePayrollComponent> findByEmployeeIdAndComponentIdAndIsDeletedFalse(UUID employeeId, UUID componentId);
}
