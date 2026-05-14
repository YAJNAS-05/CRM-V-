package com.everx.hr.training;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface TrainingRepository extends JpaRepository<Training, UUID> {

    @Query("SELECT t FROM Training t WHERE t.isDeleted = false AND t.id = :id")
    Optional<Training> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("""
            SELECT t FROM Training t WHERE t.isDeleted = false
            AND (:search IS NULL OR :search = '' OR
                 LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(t.trainerName) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:status IS NULL OR t.status = :status)
            AND (:departmentId IS NULL OR t.departmentId = :departmentId)
            """)
    Page<Training> findAllFiltered(@Param("search") String search,
                                   @Param("status") TrainingStatus status,
                                   @Param("departmentId") UUID departmentId,
                                   Pageable pageable);
}
