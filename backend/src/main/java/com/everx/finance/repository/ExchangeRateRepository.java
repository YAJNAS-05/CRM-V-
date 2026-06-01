package com.everx.finance.repository;

import com.everx.finance.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByFromCurrencyAndToCurrencyAndRateDateOrderByRateDateDesc(
            String fromCurrency, String toCurrency, LocalDate rateDate);

    List<ExchangeRate> findByFromCurrencyAndToCurrencyOrderByRateDateDesc(
            String fromCurrency, String toCurrency);

    @Query("SELECT DISTINCT e.fromCurrency FROM ExchangeRate e WHERE e.isActive = true")
    List<String> findAllActiveCurrencies();

    List<ExchangeRate> findByRateDateBetweenOrderByRateDate(LocalDate startDate, LocalDate endDate);

    Optional<ExchangeRate> findTopByFromCurrencyAndToCurrencyAndIsActiveTrueOrderByRateDateDesc(
            String fromCurrency, String toCurrency);
}
