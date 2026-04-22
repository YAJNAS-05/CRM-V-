package com.everx.finance.fx;

import org.springframework.data.jpa.repository.JpaRepository;
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
    Optional<FxRateHistory> findTopByFromCurrencyAndToCurrencyAndRateDateLessThanEqualOrderByRateDateDesc(
      String fromCurrency, String toCurrency, LocalDate asOf);

    /**
     * Get the current (today's) exchange rate for a currency pair.
     */
    Optional<FxRateHistory> findTopByFromCurrencyAndToCurrencyOrderByRateDateDesc(
      String fromCurrency, String toCurrency);
}
