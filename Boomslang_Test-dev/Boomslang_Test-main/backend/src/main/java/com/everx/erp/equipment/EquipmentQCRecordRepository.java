package com.everx.erp.equipment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EquipmentQCRecordRepository extends JpaRepository<EquipmentQCRecord, UUID> {

    @Query("SELECT q FROM EquipmentQCRecord q WHERE q.isDeleted = false AND q.id = :id")
    Optional<EquipmentQCRecord> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT q FROM EquipmentQCRecord q WHERE q.isDeleted = false")
    Page<EquipmentQCRecord> findAllNotDeleted(Pageable pageable);

    @Query("SELECT q FROM EquipmentQCRecord q WHERE q.isDeleted = false AND q.equipmentId = :equipmentId")
    Page<EquipmentQCRecord> findByEquipmentId(@Param("equipmentId") UUID equipmentId, Pageable pageable);

    @Query("SELECT q FROM EquipmentQCRecord q WHERE q.isDeleted = false AND q.qcNumber = :qcNumber")
    Optional<EquipmentQCRecord> findByQcNumber(@Param("qcNumber") String qcNumber);
}
