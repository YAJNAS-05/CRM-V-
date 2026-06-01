package com.everx.finance.service;

import com.everx.finance.entity.ExchangeRate;
import com.everx.finance.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExchangeRateService {
    private final ExchangeRateRepository exchangeRateRepository;

    /**
     * Create or update exchange rate
     */
    public ExchangeRate saveExchangeRate(String fromCurrency, String toCurrency, 
                                         BigDecimal rate, LocalDate rateDate, String source) {
        log.info("Saving exchange rate: {} to {} = {}", fromCurrency, toCurrency, rate);
        
        ExchangeRate exchangeRate = ExchangeRate.builder()
                .fromCurrency(fromCurrency)
                .toCurrency(toCurrency)
                .rate(rate)
                .rateDate(rateDate)
                .source(source)
                .isActive(true)
                .build();
        
        return exchangeRateRepository.save(exchangeRate);
    }

    /**
     * Get latest exchange rate for currency pair
     */
    public Optional<ExchangeRate> getLatestExchangeRate(String fromCurrency, String toCurrency) {
        return exchangeRateRepository.findTopByFromCurrencyAndToCurrencyAndIsActiveTrueOrderByRateDateDesc(
                fromCurrency, toCurrency);
    }

    /**
     * Get exchange rate as of specific date
     */
    public Optional<ExchangeRate> getExchangeRateAsOfDate(String fromCurrency, String toCurrency, LocalDate asOfDate) {
        return exchangeRateRepository.findByFromCurrencyAndToCurrencyAndRateDateOrderByRateDateDesc(
                fromCurrency, toCurrency, asOfDate);
    }

    /**
     * Get historical exchange rates
     */
    public List<ExchangeRate> getExchangeRateHistory(String fromCurrency, String toCurrency) {
        return exchangeRateRepository.findByFromCurrencyAndToCurrencyOrderByRateDateDesc(
                fromCurrency, toCurrency);
    }

    /**
     * Convert amount from one currency to another
     */
    public BigDecimal convertCurrency(String fromCurrency, String toCurrency, BigDecimal amount, LocalDate asOfDate) {
        log.info("Converting {} {} to {}", amount, fromCurrency, toCurrency);
        
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }
        
        Optional<ExchangeRate> exchangeRate = getExchangeRateAsOfDate(fromCurrency, toCurrency, asOfDate);
        
        if (exchangeRate.isEmpty()) {
            log.warn("No exchange rate found for {} to {} on {}", fromCurrency, toCurrency, asOfDate);
            throw new RuntimeException("Exchange rate not found for " + fromCurrency + " to " + toCurrency);
        }
        
        BigDecimal convertedAmount = amount.multiply(exchangeRate.get().getRate())
                .setScale(2, RoundingMode.HALF_UP);
        
        log.info("Converted {} {} to {} {}", amount, fromCurrency, convertedAmount, toCurrency);
        return convertedAmount;
    }

    /**
     * Deactivate exchange rate
     */
    public void deactivateExchangeRate(Long exchangeRateId) {
        ExchangeRate rate = exchangeRateRepository.findById(exchangeRateId)
                .orElseThrow(() -> new RuntimeException("Exchange rate not found"));
        rate.setIsActive(false);
        exchangeRateRepository.save(rate);
    }

    /**
     * Get all active currencies
     */
    public List<String> getActiveCurrencies() {
        return exchangeRateRepository.findAllActiveCurrencies();
    }
}
