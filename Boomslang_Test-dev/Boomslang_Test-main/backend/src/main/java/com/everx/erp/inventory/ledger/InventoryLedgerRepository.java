package com.everx.erp.inventory.ledger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface InventoryLedgerRepository extends JpaRepository<InventoryLedgerEntry, UUID> {

    @Query("SELECT l FROM InventoryLedgerEntry l WHERE l.itemId = :itemId ORDER BY l.transactionAt DESC")
    Page<InventoryLedgerEntry> findByItemId(@Param("itemId") UUID itemId, Pageable pageable);

    @Query("SELECT l FROM InventoryLedgerEntry l WHERE (:location IS NULL OR l.location = :location) ORDER BY l.transactionAt DESC")
    Page<InventoryLedgerEntry> findByLocation(@Param("location") String location, Pageable pageable);
}
