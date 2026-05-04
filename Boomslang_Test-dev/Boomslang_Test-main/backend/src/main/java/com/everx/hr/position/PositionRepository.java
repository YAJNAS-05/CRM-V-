package com.everx.hr.position;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {
	long countByIsDeletedFalse();

	Optional<Position> findByIdAndIsDeletedFalse(UUID id);

	Page<Position> findAllByIsDeletedFalse(Pageable pageable);

		@Query("""
						SELECT p FROM Position p
						WHERE p.isDeleted = false
							AND (:search IS NULL OR :search = '' OR
									 LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
									 LOWER(COALESCE(p.grade, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
									 LOWER(COALESCE(p.currency, '')) LIKE LOWER(CONCAT('%', :search, '%')))
						""")
		Page<Position> findAllFiltered(@Param("search") String search, Pageable pageable);
}
