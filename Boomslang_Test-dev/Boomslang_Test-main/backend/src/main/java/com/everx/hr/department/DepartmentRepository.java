package com.everx.hr.department;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCodeAndIsDeletedFalse(String code);

    Optional<Department> findByIdAndIsDeletedFalse(UUID id);

    Page<Department> findAllByIsDeletedFalse(Pageable pageable);

        @Query("""
                        SELECT d FROM Department d
                        WHERE d.isDeleted = false
                            AND (:search IS NULL OR :search = '' OR
                                     LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                     LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))
                        """)
        Page<Department> findAllFiltered(@Param("search") String search, Pageable pageable);
}
