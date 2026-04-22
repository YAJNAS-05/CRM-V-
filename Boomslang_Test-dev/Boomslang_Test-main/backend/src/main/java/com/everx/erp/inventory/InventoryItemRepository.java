package com.everx.erp.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false ORDER BY i.createdAt DESC")
    Page<InventoryItem> findAllActive(Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false AND lower(i.status) = lower(:status) ORDER BY i.createdAt DESC")
    Page<InventoryItem> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false AND lower(i.category) = lower(:category) ORDER BY i.createdAt DESC")
    Page<InventoryItem> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false AND i.currentStock <= COALESCE(i.reorderPoint, i.minimumStock, 0) ORDER BY i.createdAt DESC")
    List<InventoryItem> findLowStockItems();

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false AND i.itemCode = :itemCode")
    InventoryItem findByItemCode(@Param("itemCode") String itemCode);

    @Query("SELECT i FROM InventoryItem i WHERE i.isDeleted = false AND lower(i.itemCode) = lower(:itemCode)")
    InventoryItem findActiveByItemCode(@Param("itemCode") String itemCode);

    boolean existsByItemCodeIgnoreCaseAndIsDeletedFalse(String itemCode);
}
