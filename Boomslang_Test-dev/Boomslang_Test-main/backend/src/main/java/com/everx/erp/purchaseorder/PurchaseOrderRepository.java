package com.everx.erp.purchaseorder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    @Query("SELECT p FROM PurchaseOrder p WHERE p.isDeleted = false AND p.id = :id")
    Optional<PurchaseOrder> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT p FROM PurchaseOrder p WHERE p.isDeleted = false")
    Page<PurchaseOrder> findAllNotDeleted(Pageable pageable);

    @Query("SELECT p FROM PurchaseOrder p WHERE p.isDeleted = false AND p.poNumber = :poNumber")
    Optional<PurchaseOrder> findByPoNumber(@Param("poNumber") String poNumber);

    @Query("SELECT p FROM PurchaseOrder p WHERE p.isDeleted = false AND p.status = :status")
    Page<PurchaseOrder> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT p FROM PurchaseOrder p WHERE p.isDeleted = false AND p.supplierId = :supplierId")
    Page<PurchaseOrder> findBySupplierId(@Param("supplierId") UUID supplierId, Pageable pageable);
}
