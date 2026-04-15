package com.everx.crm.tradeshow;

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

@Repository
public interface TradeShowRepository extends JpaRepository<TradeShow, UUID> {

    @Query("SELECT t FROM TradeShow t WHERE t.isDeleted = false AND t.id = :id")
    Optional<TradeShow> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT t FROM TradeShow t WHERE t.isDeleted = false")
    Page<TradeShow> findAllNotDeleted(Pageable pageable);

    @Query("SELECT t FROM TradeShow t WHERE t.isDeleted = false AND t.startDate >= :startDate ORDER BY t.startDate ASC")
    List<TradeShow> findUpcomingTradeShows(@Param("startDate") LocalDate startDate);

    @Query("SELECT t FROM TradeShow t WHERE t.isDeleted = false AND t.country = :country ORDER BY t.startDate DESC")
    List<TradeShow> findByCountry(@Param("country") String country);

    @Query("SELECT t FROM TradeShow t WHERE t.isDeleted = false AND t.startDate BETWEEN :startDate AND :endDate ORDER BY t.startDate ASC")
    List<TradeShow> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
