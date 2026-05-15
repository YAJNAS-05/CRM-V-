package com.everx.erp.spareparts;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, UUID> {

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false AND s.id = :id")
    Optional<SparePart> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false")
    Page<SparePart> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false AND s.partNumber = :partNumber")
    Optional<SparePart> findByPartNumber(@Param("partNumber") String partNumber);

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false AND s.stockQty <= s.reorderPoint")
    List<SparePart> findLowStockParts();

    @Query("SELECT s FROM SparePart s WHERE s.isDeleted = false AND s.category = :category")
    Page<SparePart> findByCategory(@Param("category") String category, Pageable pageable);
}
