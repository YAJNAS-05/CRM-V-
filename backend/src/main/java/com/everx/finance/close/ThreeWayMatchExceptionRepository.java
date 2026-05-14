package com.everx.finance.close;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ThreeWayMatchExceptionRepository extends JpaRepository<ThreeWayMatchException, UUID> {

    List<ThreeWayMatchException> findByPeriodEndAndIsDeletedFalse(LocalDate periodEnd);

    List<ThreeWayMatchException> findByPeriodEndAndStatusAndIsDeletedFalse(LocalDate periodEnd, String status);

    Optional<ThreeWayMatchException> findByInvoiceIdAndStatusAndIsDeletedFalse(UUID invoiceId, String status);

    @Query("SELECT COUNT(e) FROM ThreeWayMatchException e "
         + "JOIN Invoice i ON i.id = e.invoiceId "
         + "WHERE e.periodEnd = :periodEnd "
         + "AND e.status = :status "
         + "AND e.isDeleted = false "
         + "AND i.isDeleted = false "
         + "AND UPPER(i.entity) = UPPER(:companyCode)")
    long countOpenByPeriodAndCompanyCode(
            @Param("periodEnd") LocalDate periodEnd,
            @Param("status") String status,
            @Param("companyCode") String companyCode);
}
