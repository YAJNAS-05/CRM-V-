package com.everx.finance.currency;

import com.everx.finance.currency.dto.CreateCurrencyRateRequest;
import com.everx.finance.currency.dto.CurrencyRateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance/currency-rates")
@RequiredArgsConstructor
public class CurrencyRateController {

    private final CurrencyRateService currencyRateService;

    @GetMapping
    public ResponseEntity<List<CurrencyRateResponse>> getAllRates() {
        return ResponseEntity.ok(currencyRateService.getAllRates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurrencyRateResponse> getRateById(@PathVariable UUID id) {
        return ResponseEntity.ok(currencyRateService.getRateById(id));
    }

    @GetMapping("/latest")
    public ResponseEntity<CurrencyRateResponse> getLatestRate(
            @RequestParam String baseCurrency,
            @RequestParam String targetCurrency) {
        return ResponseEntity.ok(currencyRateService.getLatestRate(baseCurrency, targetCurrency));
    }

    @GetMapping("/base/{baseCurrency}")
    public ResponseEntity<List<CurrencyRateResponse>> getRatesByBaseCurrency(@PathVariable String baseCurrency) {
        return ResponseEntity.ok(currencyRateService.getRatesByBaseCurrency(baseCurrency));
    }

    @GetMapping("/convert")
    public ResponseEntity<BigDecimal> convertAmount(
            @RequestParam BigDecimal amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        return ResponseEntity.ok(currencyRateService.convertAmount(amount, fromCurrency, toCurrency));
    }

    @PostMapping
    public ResponseEntity<CurrencyRateResponse> createRate(@RequestBody CreateCurrencyRateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(currencyRateService.createRate(request));
    }

    @PutMapping
    public ResponseEntity<CurrencyRateResponse> updateRate(
            @RequestParam String baseCurrency,
            @RequestParam String targetCurrency,
            @RequestParam BigDecimal rate) {
        return ResponseEntity.ok(currencyRateService.updateRate(baseCurrency, targetCurrency, rate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRate(@PathVariable UUID id) {
        currencyRateService.deleteRate(id);
        return ResponseEntity.noContent().build();
    }
}
