package com.everx.finance.fx;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for FX rate management.
 * 
 * Manages exchange rates for FX gain/loss calculation and historical reversal.
 * Access is controlled via FINANCE_* permissions.
 */
@RestController
@RequestMapping("/api/v1/finance/fx-rates")
@RequiredArgsConstructor
public class FxRateHistoryController {

    private final FxRateHistoryService fxRateService;
    private final FxRateHistoryRepository fxRateRepository;

    /**
     * Get all recorded FX rates.
     * 
     * @return List of all FX rates
     */
    @GetMapping
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<List<FxRateResponse>> getAll() {
        return ResponseEntity.ok(
            fxRateRepository.findAll().stream()
                .map(this::toResponse)
                .toList()
        );
    }

    /**
     * Get the current (latest) exchange rate for a currency pair.
     * 
     * Example:
     * GET /api/v1/finance/fx-rates/current?from=USD&to=AUD
     * 
     * @param fromCurrency Source currency
     * @param toCurrency Target currency
     * @return Current exchange rate
     */
    @GetMapping("/current")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<BigDecimal> getCurrentRate(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        BigDecimal rate = fxRateService.getCurrentRate(fromCurrency, toCurrency);
        return ResponseEntity.ok(rate);
    }

    /**
     * Get historical exchange rate as of a specific date.
     * 
     * Example:
     * GET /api/v1/finance/fx-rates/historical?from=USD&to=AUD&asOf=2026-01-15
     * 
     * @param fromCurrency Source currency
     * @param toCurrency Target currency
     * @param asOf Date to get rate for
     * @return Historical exchange rate
     */
    @GetMapping("/historical")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<BigDecimal> getHistoricalRate(
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency,
            @RequestParam LocalDate asOf) {
        BigDecimal rate = fxRateService.getRateAsOf(fromCurrency, toCurrency, asOf);
        return ResponseEntity.ok(rate);
    }

    /**
     * Record a new FX exchange rate.
     * 
     * Request body example:
     * {
     *   "fromCurrency": "USD",
     *   "toCurrency": "AUD",
     *   "exchangeRate": 1.52,
     *   "rateDate": "2026-04-14",
     *   "source": "ECB",
     *   "notes": "Daily fix rate"
     * }
     * 
     * @param request The FX rate to record
     * @return Created rate with HTTP 201 Created
     */
    @PostMapping
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<FxRateResponse> recordRate(@RequestBody RecordFxRateRequest request) {
        FxRateHistory rate = fxRateService.recordRate(
            request.getFromCurrency(),
            request.getToCurrency(),
            request.getExchangeRate(),
            request.getRateDate(),
            request.getSource(),
            request.getNotes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(rate));
    }

    /**
     * Calculate FX gain/loss between two dates.
     * 
     * Request body example:
     * {
     *   "amount": 100000,
     *   "fromCurrency": "USD",
     *   "toCurrency": "AUD",
     *   "asOf": "2026-01-15"
     * }
     * 
     * @param request Calculation parameters
     * @return FX gain (positive) or loss (negative)
     */
    @PostMapping("/calculate-gain-loss")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<BigDecimal> calculateFxGainLoss(@RequestBody CalculateFxGainLossRequest request) {
        BigDecimal gainLoss = fxRateService.calculateFxGainLoss(
            request.getAmount(),
            request.getFromCurrency(),
            request.getToCurrency(),
            request.getAsOf()
        );
        return ResponseEntity.ok(gainLoss);
    }

    private FxRateResponse toResponse(FxRateHistory rate) {
        return FxRateResponse.builder()
                .id(rate.getId())
                .fromCurrency(rate.getFromCurrency())
                .toCurrency(rate.getToCurrency())
                .exchangeRate(rate.getExchangeRate())
                .rateDate(rate.getRateDate())
                .source(rate.getSource())
                .notes(rate.getNotes())
                .build();
    }
}
