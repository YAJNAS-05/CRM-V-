package com.everx.finance.ar.repository;

import com.everx.finance.ar.entity.ArPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for AR Payments
 */
@Repository
public interface ArPaymentRepository extends JpaRepository<ArPayment, UUID> {

    List<ArPayment> findByCustomerInvoiceIdAndIsDeletedFalse(UUID customerInvoiceId);

    Page<ArPayment> findByStatusAndIsDeletedFalse(ArPayment.Status status, Pageable pageable);

    @Query("SELECT ap FROM ArPayment ap WHERE ap.status != 'CLEARED' AND ap.reconciledAt IS NULL " +
           "AND ap.isDeleted = false")
    List<ArPayment> findUnclearedPayments();
}
