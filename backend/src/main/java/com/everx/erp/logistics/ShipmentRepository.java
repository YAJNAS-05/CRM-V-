package com.everx.erp.logistics;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false AND s.id = :id")
    Optional<Shipment> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false")
    Page<Shipment> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false AND s.trackingNumber = :trackingNumber")
    Optional<Shipment> findByTrackingNumber(@Param("trackingNumber") String trackingNumber);

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false AND s.status = :status")
    Page<Shipment> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false AND s.soId = :soId")
    Page<Shipment> findBySoId(@Param("soId") UUID soId, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.isDeleted = false AND s.poId = :poId")
    Page<Shipment> findByPoId(@Param("poId") UUID poId, Pageable pageable);
}
