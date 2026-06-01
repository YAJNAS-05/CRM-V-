package com.everx.finance.ap.repository;

import com.everx.finance.ap.entity.VendorInvoice;
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

/**
 * Repository for Vendor Invoices
 */
@Repository
public interface VendorInvoiceRepository extends JpaRepository<VendorInvoice, UUID> {

    Page<VendorInvoice> findByVendorIdAndIsDeletedFalse(UUID vendorId, Pageable pageable);

    List<VendorInvoice> findByVendorIdAndIsDeletedFalse(UUID vendorId);

    Page<VendorInvoice> findByStatusAndIsDeletedFalse(VendorInvoice.Status status, Pageable pageable);

    Optional<VendorInvoice> findByVendorIdAndInvoiceNumberAndIsDeletedFalse(UUID vendorId, String invoiceNumber);

    @Query("SELECT vi FROM VendorInvoice vi WHERE vi.status IN ('APPROVED', 'PARTIALLY_PAID', 'OVERDUE') " +
           "AND vi.dueDate < :today AND vi.isDeleted = false")
    List<VendorInvoice> findOverdueInvoices(@Param("today") LocalDate today);

    Page<VendorInvoice> findByMatchingStatusAndIsDeletedFalse(
            VendorInvoice.MatchingStatus matchingStatus, Pageable pageable);

    @Query("SELECT vi FROM VendorInvoice vi WHERE vi.matchingStatus = 'EXCEPTION' AND vi.isDeleted = false")
    List<VendorInvoice> findMatchingExceptions();

    long countByVendorIdAndStatusInAndIsDeletedFalse(UUID vendorId, List<VendorInvoice.Status> statuses);

    @Query("SELECT vi.vendorId, vi.invoiceNumber, vi.dueDate, vi.netAmount " +
           "FROM VendorInvoice vi WHERE vi.isDeleted = false")
    List<Object[]> getApAging();

    @Query("SELECT vi.vendorId, vi.invoiceNumber, vi.dueDate, vi.netAmount " +
           "FROM VendorInvoice vi WHERE vi.dueDate BETWEEN :startDate AND :endDate " +
           "AND vi.isDeleted = false")
    List<Object[]> getPaymentSchedule(@Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
}
