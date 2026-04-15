package com.everx.crm.lead;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    @Query("SELECT l FROM Lead l WHERE l.isDeleted = false ORDER BY l.createdAt DESC")
    Page<Lead> findAllActive(Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.isDeleted = false AND l.accountId = :accountId ORDER BY l.createdAt DESC")
    Page<Lead> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.isDeleted = false AND lower(l.status) = lower(:status) ORDER BY l.createdAt DESC")
    Page<Lead> findByStatus(@Param("status") String status, Pageable pageable);
}
