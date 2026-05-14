package com.everx.hr.payroll;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PayrollProfileRepository extends JpaRepository<PayrollProfile, UUID> {
    Optional<PayrollProfile> findByEmployeeId(UUID employeeId);
}
