package com.everx.finance.close;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ThreeWayMatchExceptionRepository extends JpaRepository<ThreeWayMatchException, UUID> {

    List<ThreeWayMatchException> findByPeriodEndAndIsDeletedFalse(LocalDate periodEnd);

    List<ThreeWayMatchException> findByPeriodEndAndStatusAndIsDeletedFalse(LocalDate periodEnd, String status);

    Optional<ThreeWayMatchException> findByInvoiceIdAndStatusAndIsDeletedFalse(UUID invoiceId, String status);
}
