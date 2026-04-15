package com.everx.erp.equipment;

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
public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.id = :id")
    Optional<Equipment> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false")
    Page<Equipment> findAllNotDeleted(Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.internalCode = :code")
    Optional<Equipment> findByInternalCode(@Param("code") String code);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.status = :status")
    Page<Equipment> findByStatus(@Param("status") EquipmentStatus status, Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.category = :category")
    Page<Equipment> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND e.warehouseLocation = :location")
    Page<Equipment> findByWarehouseLocation(@Param("location") String location, Pageable pageable);

    @Query("SELECT e FROM Equipment e WHERE e.isDeleted = false AND (LOWER(e.make) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.internalCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Equipment> searchEquipment(@Param("search") String search, Pageable pageable);
}
