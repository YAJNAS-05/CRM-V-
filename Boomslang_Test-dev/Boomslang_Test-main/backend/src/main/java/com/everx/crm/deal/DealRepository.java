package com.everx.crm.deal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID> {

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false ORDER BY d.createdAt DESC")
    Page<Deal> findAllActive(Pageable pageable);

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false AND d.accountId = :accountId ORDER BY d.createdAt DESC")
    Page<Deal> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false AND d.stage = :stage ORDER BY d.createdAt DESC")
    Page<Deal> findByStage(@Param("stage") DealStage stage, Pageable pageable);
}
