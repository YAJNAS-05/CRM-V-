package com.everx.finance.fx;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for FX rate history tracking.
 */
@Repository
public interface FxRateHistoryRepository extends JpaRepository<FxRateHistory, UUID> {
    
    /**
     * Get the most recent exchange rate for a currency pair on or before a given date.
     */
    @Query(value = """
        SELECT f FROM FxRateHistory f
        WHERE f.fromCurrency = :fromCurrency
          AND f.toCurrency = :toCurrency
          AND f.rateDate <= :asOf
        ORDER BY f.rateDate DESC
        LIMIT 1
    """)
    Optional<FxRateHistory> getLatestRateAsOf(String fromCurrency, String toCurrency, LocalDate asOf);

    /**
     * Get the current (today's) exchange rate for a currency pair.
     */
    @Query(value = """
        SELECT f FROM FxRateHistory f
        WHERE f.fromCurrency = :fromCurrency
          AND f.toCurrency = :toCurrency
        ORDER BY f.rateDate DESC
        LIMIT 1
    """)
    Optional<FxRateHistory> getCurrentRate(String fromCurrency, String toCurrency);
}
