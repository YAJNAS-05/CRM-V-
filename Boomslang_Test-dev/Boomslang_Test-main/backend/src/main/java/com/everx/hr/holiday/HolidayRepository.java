package com.everx.hr.holiday;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.UUID;

public interface HolidayRepository extends JpaRepository<Holiday, UUID> {

    @Query("""
        SELECT h FROM Holiday h
        WHERE h.isDeleted = false
          AND (:region IS NULL OR :region = '' OR LOWER(h.region) = LOWER(:region))
          AND (:startDate IS NULL OR h.holidayDate >= :startDate)
          AND (:endDate IS NULL OR h.holidayDate <= :endDate)
        """)
    Page<Holiday> findAllFiltered(
            @Param("region") String region,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
