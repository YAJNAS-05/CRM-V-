package com.everx.finance.fx;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Service for FX rate management and gain/loss calculation.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class FxRateHistoryService {

    private final FxRateHistoryRepository fxRateRepository;

    /**
     * Record a new FX exchange rate.
     */
    public FxRateHistory recordRate(String fromCurrency, String toCurrency, 
                                    BigDecimal rate, LocalDate rateDate, 
                                    String source, String notes) {
        FxRateHistory fxRate = FxRateHistory.builder()
                .fromCurrency(fromCurrency)
                .toCurrency(toCurrency)
                .exchangeRate(rate)
                .rateDate(rateDate)
                .source(source)
                .notes(notes)
                .build();
        
        FxRateHistory saved = fxRateRepository.save(fxRate);
        log.info("FX rate recorded: {} {} = {} {} on {}", 
                 fromCurrency, rate, toCurrency, rateDate, source);
        return saved;
    }

    /**
     * Get the exchange rate for a currency pair as of a specific date.
     * 
     * @param fromCurrency Source currency (USD, AUD, JPY)
     * @param toCurrency Target currency (USD, AUD, JPY)
     * @param asOf Date to get rate for
     * @return Exchange rate (1 unit of fromCurrency = X units of toCurrency)
     * @throws FxRateException if no rate found
     */
    @Transactional(readOnly = true)
    public BigDecimal getRateAsOf(String fromCurrency, String toCurrency, LocalDate asOf) {
        return fxRateRepository.findTopByFromCurrencyAndToCurrencyAndRateDateLessThanEqualOrderByRateDateDesc(
                fromCurrency, toCurrency, asOf)
                .map(FxRateHistory::getExchangeRate)
                .orElseThrow(() -> new FxRateException(
                    "No FX rate found for " + fromCurrency + "/" + toCurrency + " as of " + asOf
                ));
    }

    /**
     * Get the current (latest) exchange rate for a currency pair.
     */
    @Transactional(readOnly = true)
    public BigDecimal getCurrentRate(String fromCurrency, String toCurrency) {
        return fxRateRepository.findTopByFromCurrencyAndToCurrencyOrderByRateDateDesc(
                fromCurrency, toCurrency)
                .map(FxRateHistory::getExchangeRate)
                .orElseThrow(() -> new FxRateException(
                    "No FX rate found for " + fromCurrency + "/" + toCurrency
                ));
    }

    /**
     * Calculate FX gain or loss between two dates.
     * Gain/Loss = Amount * (CurrentRate - HistoricalRate)
     * 
     * @param amount Transaction amount in fromCurrency
     * @param fromCurrency Original currency
     * @param toCurrency Target currency
     * @param asOf Historical date
     * @return FX gain (positive) or loss (negative)
     */
    public BigDecimal calculateFxGainLoss(BigDecimal amount, String fromCurrency, 
                                          String toCurrency, LocalDate asOf) {
        BigDecimal historicalRate = getRateAsOf(fromCurrency, toCurrency, asOf);
        BigDecimal currentRate = getCurrentRate(fromCurrency, toCurrency);
        
        BigDecimal fxGainLoss = amount.multiply(currentRate.subtract(historicalRate));
        
        log.debug("FX gain/loss calculated for {} {}: {} (histRate: {}, currRate: {})",
                  amount, fromCurrency, fxGainLoss, historicalRate, currentRate);
        
        return fxGainLoss;
    }
}
