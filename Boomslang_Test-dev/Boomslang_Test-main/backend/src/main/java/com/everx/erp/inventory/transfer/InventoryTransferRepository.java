package com.everx.erp.inventory.transfer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface InventoryTransferRepository extends JpaRepository<InventoryTransfer, UUID> {

    @Query("SELECT t FROM InventoryTransfer t WHERE t.id = :id")
    Optional<InventoryTransfer> findById(@Param("id") UUID id);

    @Query("SELECT t FROM InventoryTransfer t ORDER BY t.createdAt DESC")
    Page<InventoryTransfer> findAllTransfers(Pageable pageable);

    boolean existsByTransferNumber(String transferNumber);
}
