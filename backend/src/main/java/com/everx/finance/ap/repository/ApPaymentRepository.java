package com.everx.finance.ap.repository;

import com.everx.finance.ap.entity.ApPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for AP Payments
 */
@Repository
public interface ApPaymentRepository extends JpaRepository<ApPayment, UUID> {

    List<ApPayment> findByVendorInvoiceIdAndIsDeletedFalse(UUID vendorInvoiceId);

    Page<ApPayment> findByStatusAndIsDeletedFalse(ApPayment.Status status, Pageable pageable);

    @Query("SELECT ap FROM ApPayment ap WHERE ap.status != 'CLEARED' AND ap.reconciledAt IS NULL " +
           "AND ap.isDeleted = false")
    List<ApPayment> findUnclearedPayments();
}
