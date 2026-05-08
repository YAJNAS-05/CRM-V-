package com.everx.hr.okr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OkrCycleRepository extends JpaRepository<OkrCycle, UUID> {

    @Query("SELECT c FROM OkrCycle c WHERE c.isDeleted = false AND c.id = :id")
    Optional<OkrCycle> findByIdActive(@Param("id") UUID id);

    @Query("SELECT c FROM OkrCycle c WHERE c.isDeleted = false ORDER BY c.startDate DESC")
    List<OkrCycle> findAllActive();

    @Query("SELECT c FROM OkrCycle c WHERE c.isDeleted = false AND c.status = :status ORDER BY c.startDate DESC")
    List<OkrCycle> findByStatus(@Param("status") String status);

    @Query("SELECT c FROM OkrCycle c WHERE c.isDeleted = false AND c.isDefault = true")
    Optional<OkrCycle> findDefault();

    @Query("SELECT c FROM OkrCycle c WHERE c.isDeleted = false AND c.status = 'ACTIVE' ORDER BY c.startDate DESC")
    List<OkrCycle> findActiveCycles();
}
