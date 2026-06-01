package com.everx.finance.ar.repository;

import com.everx.finance.ar.entity.CustomerInvoice;
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
 * Repository for Customer Invoices
 */
@Repository
public interface CustomerInvoiceRepository extends JpaRepository<CustomerInvoice, UUID> {

    Page<CustomerInvoice> findByCustomerIdAndIsDeletedFalse(UUID customerId, Pageable pageable);

    List<CustomerInvoice> findByCustomerIdAndIsDeletedFalse(UUID customerId);

    Page<CustomerInvoice> findByStatusAndIsDeletedFalse(CustomerInvoice.Status status, Pageable pageable);

    Optional<CustomerInvoice> findByCustomerIdAndInvoiceNumberAndIsDeletedFalse(UUID customerId, String invoiceNumber);

    @Query("SELECT ci FROM CustomerInvoice ci WHERE ci.status IN ('SENT', 'OVERDUE', 'PARTIALLY_PAID') " +
           "AND ci.dueDate < :today AND ci.isDeleted = false")
    List<CustomerInvoice> findOverdueInvoices(@Param("today") LocalDate today);

    @Query("SELECT ci FROM CustomerInvoice ci WHERE ci.writeoffEligible = true " +
           "AND ci.status != 'WRITTEN_OFF' AND ci.isDeleted = false")
    List<CustomerInvoice> findWriteoffEligible();

    @Query("SELECT ci FROM CustomerInvoice ci WHERE ci.status = 'OVERDUE' " +
           "AND ci.reminderCount < 3 AND (ci.lastReminderSentDate IS NULL " +
           "OR ci.lastReminderSentDate < :reminderDueDate) AND ci.isDeleted = false")
    List<CustomerInvoice> findNeedingReminder(@Param("reminderDueDate") LocalDate reminderDueDate);

    @Query("SELECT ci FROM CustomerInvoice ci WHERE ci.lateFeeApplicable = true " +
           "AND ci.daysOverdue > :threshold AND ci.isDeleted = false")
    List<CustomerInvoice> findWithLateFeeApplicable(@Param("threshold") int threshold);

    long countByCustomerIdAndStatusInAndIsDeletedFalse(UUID customerId, List<CustomerInvoice.Status> statuses);

    @Query("SELECT ci.customerId, ci.invoiceNumber, ci.dueDate, ci.netAmount " +
           "FROM CustomerInvoice ci WHERE ci.isDeleted = false")
    List<Object[]> getArAging();

    @Query("SELECT ci.customerId, ci.invoiceNumber, ci.dueDate, ci.netAmount " +
           "FROM CustomerInvoice ci WHERE ci.dueDate BETWEEN :startDate AND :endDate " +
           "AND ci.isDeleted = false")
    List<Object[]> getPaymentSchedule(@Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
}
