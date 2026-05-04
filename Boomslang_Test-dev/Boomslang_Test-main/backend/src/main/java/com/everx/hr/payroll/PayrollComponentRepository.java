package com.everx.hr.payroll;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PayrollComponentRepository extends JpaRepository<PayrollComponent, UUID> {
    Page<PayrollComponent> findAllByIsDeletedFalse(Pageable pageable);

    Optional<PayrollComponent> findByCodeAndIsDeletedFalse(String code);

    boolean existsByCodeAndIsDeletedFalse(String code);
}
