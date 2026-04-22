package com.everx.erp.suppliers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    @Query("SELECT s FROM Supplier s WHERE s.isDeleted = false AND s.id = :id")
    Optional<Supplier> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM Supplier s WHERE s.isDeleted = false")
    Page<Supplier> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.isDeleted = false AND s.country = :country")
    Page<Supplier> findByCountry(@Param("country") String country, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.isDeleted = false AND s.supplierType = :type")
    Page<Supplier> findByType(@Param("type") String type, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.isDeleted = false AND lower(s.companyName) = lower(:companyName)")
    Optional<Supplier> findByCompanyNameIgnoreCase(@Param("companyName") String companyName);
}
