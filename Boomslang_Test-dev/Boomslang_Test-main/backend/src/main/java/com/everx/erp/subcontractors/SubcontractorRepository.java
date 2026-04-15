package com.everx.erp.subcontractors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubcontractorRepository extends JpaRepository<Subcontractor, UUID> {

    @Query("SELECT s FROM Subcontractor s WHERE s.isDeleted = false AND s.id = :id")
    Optional<Subcontractor> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM Subcontractor s WHERE s.isDeleted = false")
    Page<Subcontractor> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM Subcontractor s WHERE s.isDeleted = false AND s.country = :country")
    Page<Subcontractor> findByCountry(@Param("country") String country, Pageable pageable);
}
