package com.everx.crm.deal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID> {

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false AND d.id = :id")
    Optional<Deal> findByIdActive(@Param("id") UUID id);

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false ORDER BY d.createdAt DESC")
    Page<Deal> findAllActive(Pageable pageable);

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false AND d.accountId = :accountId ORDER BY d.createdAt DESC")
    Page<Deal> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT d FROM Deal d WHERE d.isDeleted = false AND d.stage = :stage ORDER BY d.createdAt DESC")
    Page<Deal> findByStage(@Param("stage") String stage, Pageable pageable);

        @Query("""
                        SELECT d FROM Deal d
                        WHERE d.isDeleted = false
                            AND (:stage IS NULL OR d.stage = :stage)
                            AND (
                                     lower(d.name) LIKE lower(concat('%', :query, '%'))
                                OR lower(d.description) LIKE lower(concat('%', :query, '%'))
                                OR lower(d.leadSource) LIKE lower(concat('%', :query, '%'))
                            )
                        ORDER BY d.createdAt DESC
                        """)
        Page<Deal> search(@Param("query") String query, @Param("stage") String stage, Pageable pageable);

    long countByOwnerIdAndIsDeletedFalse(UUID ownerId);
}
