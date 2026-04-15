package com.everx.finance.payment;

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
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByIdAndIsDeletedFalse(UUID id);

    Page<Payment> findByIsDeletedFalse(Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.isDeleted = false AND p.invoiceId = :invoiceId ORDER BY p.paymentDate DESC")
    List<Payment> findByInvoiceId(@Param("invoiceId") UUID invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.isDeleted = false AND p.paymentDate BETWEEN :startDate AND :endDate")
    Page<Payment> findByPaymentDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.isDeleted = false AND p.method = :method")
    Page<Payment> findByMethod(@Param("method") Payment.PaymentMethod method, Pageable pageable);
}
