package com.everx.hr.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OfferLetterRepository extends JpaRepository<OfferLetter, UUID> {

    @Query("SELECT o FROM OfferLetter o WHERE o.isDeleted = false AND o.id = :id")
    Optional<OfferLetter> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("""
            SELECT o FROM OfferLetter o WHERE o.isDeleted = false
            AND (:search IS NULL OR :search = '' OR
                 LOWER(o.candidateName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(o.candidateEmail) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:status IS NULL OR o.status = :status)
            """)
    Page<OfferLetter> findAllFiltered(@Param("search") String search,
                                      @Param("status") OfferLetterStatus status,
                                      Pageable pageable);
}
