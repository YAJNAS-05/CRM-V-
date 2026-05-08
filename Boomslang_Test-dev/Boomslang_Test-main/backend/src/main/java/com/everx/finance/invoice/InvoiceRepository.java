package com.everx.finance.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Page<Invoice> findByCustomerId(UUID customerId, Pageable pageable);
    Page<Invoice> findByStatus(String status, Pageable pageable);
    Page<Invoice> findByCompanyCode(String companyCode, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE i.entity = :entity")
    Page<Invoice> findByEntity(@Param("entity") String entity, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :now AND i.status NOT IN ('PAID', 'CANCELLED')")
    List<Invoice> findOverdueInvoices(@Param("now") LocalDateTime now);
}
