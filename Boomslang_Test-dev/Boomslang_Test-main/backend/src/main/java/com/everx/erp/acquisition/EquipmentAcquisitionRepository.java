package com.everx.erp.acquisition;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentAcquisitionRepository extends JpaRepository<EquipmentAcquisition, UUID> {

    @Query("SELECT a FROM EquipmentAcquisition a WHERE a.isDeleted = false AND a.id = :id")
    Optional<EquipmentAcquisition> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT a FROM EquipmentAcquisition a WHERE a.isDeleted = false")
    Page<EquipmentAcquisition> findAllNotDeleted(Pageable pageable);

    @Query("SELECT a FROM EquipmentAcquisition a WHERE a.isDeleted = false AND a.stage = :stage")
    Page<EquipmentAcquisition> findByStage(@Param("stage") String stage, Pageable pageable);

    @Query("SELECT a FROM EquipmentAcquisition a WHERE a.isDeleted = false AND a.acquisitionNumber = :acquisitionNumber")
    Optional<EquipmentAcquisition> findByAcquisitionNumber(@Param("acquisitionNumber") String acquisitionNumber);
}
