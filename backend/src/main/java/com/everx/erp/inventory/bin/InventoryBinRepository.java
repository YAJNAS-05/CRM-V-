package com.everx.erp.inventory.bin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryBinRepository extends JpaRepository<InventoryBin, UUID> {

    @Query("SELECT b FROM InventoryBin b WHERE b.itemId = :itemId ORDER BY b.location ASC")
    List<InventoryBin> findByItemId(@Param("itemId") UUID itemId);

    @Query("SELECT b FROM InventoryBin b WHERE b.itemId = :itemId AND lower(b.location) = lower(:location)")
    Optional<InventoryBin> findByItemIdAndLocation(@Param("itemId") UUID itemId, @Param("location") String location);
}
