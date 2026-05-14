package com.everx.erp.warranty;

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

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, UUID> {

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.id = :id")
    Optional<Warranty> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false")
    Page<Warranty> findAllNotDeleted(Pageable pageable);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.equipmentId = :equipmentId")
    List<Warranty> findByEquipmentId(@Param("equipmentId") UUID equipmentId);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.accountId = :accountId")
    Page<Warranty> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.status = 'ACTIVE' AND w.endDate < :date")
    List<Warranty> findExpiringWarranties(@Param("date") LocalDate date);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.endDate = :endDate")
    List<Warranty> findByEndDate(@Param("endDate") LocalDate endDate);

    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM Warranty w WHERE w.isDeleted = false AND w.soId = :soId AND w.equipmentId = :equipmentId")
    boolean existsBySoIdAndEquipmentId(@Param("soId") UUID soId, @Param("equipmentId") UUID equipmentId);

    @Query("SELECT w FROM Warranty w WHERE w.isDeleted = false AND w.soId = :soId")
    List<Warranty> findBySoId(@Param("soId") UUID soId);
}
