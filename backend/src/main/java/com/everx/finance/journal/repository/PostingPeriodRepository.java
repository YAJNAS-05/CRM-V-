package com.everx.finance.journal.repository;

import com.everx.finance.journal.entity.PostingPeriod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Posting Periods
 */
@Repository
public interface PostingPeriodRepository extends JpaRepository<PostingPeriod, UUID> {

    Page<PostingPeriod> findByCompanyIdAndIsDeletedFalse(UUID companyId, Pageable pageable);

    List<PostingPeriod> findByCompanyIdAndStatusAndIsDeletedFalse(UUID companyId, PostingPeriod.Status status);

    Optional<PostingPeriod> findByCompanyIdAndPeriodNameAndIsDeletedFalse(UUID companyId, String periodName);

    @Query("SELECT pp FROM PostingPeriod pp WHERE pp.companyId = :companyId " +
           "AND pp.startDate <= :date AND pp.endDate >= :date " +
           "AND pp.isDeleted = false")
    Optional<PostingPeriod> findByDateInPeriod(@Param("companyId") UUID companyId, @Param("date") LocalDate date);

    @Query("SELECT CASE WHEN COUNT(pp) > 0 THEN true ELSE false END " +
           "FROM PostingPeriod pp WHERE pp.companyId = :companyId " +
           "AND pp.isDeleted = false " +
           "AND ((pp.startDate <= :endDate AND pp.endDate >= :startDate))")
    boolean existsOverlappingPeriod(@Param("companyId") UUID companyId, 
                                    @Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate);
}
