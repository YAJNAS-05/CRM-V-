package com.everx.finance.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByIdAndIsDeletedFalse(UUID id);

    Page<Invoice> findByIsDeletedFalse(Pageable pageable);

    Optional<Invoice> findByInvoiceNumberAndIsDeletedFalse(String invoiceNumber);

    List<Invoice> findBySoIdAndIsDeletedFalse(UUID soId);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.accountId = :accountId")
    Page<Invoice> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    Optional<Invoice> findTopByPoIdAndIsDeletedFalseOrderByIssueDateDesc(UUID poId);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.status = :status")
    Page<Invoice> findByStatus(@Param("status") Invoice.InvoiceStatus status, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.entity = :entity")
    Page<Invoice> findByEntity(@Param("entity") Invoice.InvoiceEntity entity, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.dueDate < :date AND i.status NOT IN ('PAID', 'CANCELLED')")
    List<Invoice> findOverdueInvoices(@Param("date") LocalDate date);

    @Query("SELECT i FROM Invoice i WHERE i.isDeleted = false AND i.dueDate BETWEEN :startDate AND :endDate")
    Page<Invoice> findByDueDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.entity = :entity AND i.issueDate >= :yearStart")
    long countByEntityAndIssueDateAfter(@Param("entity") Invoice.InvoiceEntity entity, @Param("yearStart") LocalDate yearStart);

    long countByCreatedByAndIsDeletedFalse(UUID createdBy);
}
