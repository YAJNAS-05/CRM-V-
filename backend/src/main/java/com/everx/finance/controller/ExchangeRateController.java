package com.everx.finance.controller;

import com.everx.finance.entity.ExchangeRate;
import com.everx.finance.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance/exchange-rates")
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateController {
    private final ExchangeRateService exchangeRateService;

    @PostMapping
    public ResponseEntity<ExchangeRate> createExchangeRate(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam BigDecimal rate,
            @RequestParam LocalDate rateDate,
            @RequestParam(defaultValue = "MANUAL") String source) {
        log.info("Creating exchange rate: {} to {}", fromCurrency, toCurrency);
        ExchangeRate exchangeRate = exchangeRateService.saveExchangeRate(fromCurrency, toCurrency, rate, rateDate, source);
        return ResponseEntity.status(HttpStatus.CREATED).body(exchangeRate);
    }

    @GetMapping("/latest")
    public ResponseEntity<ExchangeRate> getLatestExchangeRate(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        log.info("Getting latest exchange rate: {} to {}", fromCurrency, toCurrency);
        Optional<ExchangeRate> rate = exchangeRateService.getLatestExchangeRate(fromCurrency, toCurrency);
        return rate.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExchangeRate>> getExchangeRateHistory(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        log.info("Getting exchange rate history: {} to {}", fromCurrency, toCurrency);
        List<ExchangeRate> rates = exchangeRateService.getExchangeRateHistory(fromCurrency, toCurrency);
        return ResponseEntity.ok(rates);
    }

    @PostMapping("/convert")
    public ResponseEntity<ConversionResponse> convertCurrency(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam BigDecimal amount,
            @RequestParam LocalDate asOfDate) {
        log.info("Converting {} {} to {} as of {}", amount, fromCurrency, toCurrency, asOfDate);
        BigDecimal convertedAmount = exchangeRateService.convertCurrency(fromCurrency, toCurrency, amount, asOfDate);
        ConversionResponse response = ConversionResponse.builder()
                .fromCurrency(fromCurrency)
                .toCurrency(toCurrency)
                .originalAmount(amount)
                .convertedAmount(convertedAmount)
                .conversionDate(asOfDate)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/currencies")
    public ResponseEntity<List<String>> getActiveCurrencies() {
        log.info("Getting active currencies");
        List<String> currencies = exchangeRateService.getActiveCurrencies();
        return ResponseEntity.ok(currencies);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateExchangeRate(@PathVariable Long id) {
        log.info("Deactivating exchange rate: {}", id);
        exchangeRateService.deactivateExchangeRate(id);
        return ResponseEntity.noContent().build();
    }
}
