package com.everx.erp.salesorder;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID> {

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false AND s.id = :id")
    Optional<SalesOrder> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false")
    Page<SalesOrder> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false AND s.soNumber = :soNumber")
    Optional<SalesOrder> findBySoNumber(@Param("soNumber") String soNumber);

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false AND s.status = :status")
    Page<SalesOrder> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false AND s.accountId = :accountId")
    Page<SalesOrder> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT s FROM SalesOrder s WHERE s.isDeleted = false AND s.dealId = :dealId")
    Page<SalesOrder> findByDealId(@Param("dealId") UUID dealId, Pageable pageable);

    long countByCreatedByAndIsDeletedFalse(UUID createdBy);
}
