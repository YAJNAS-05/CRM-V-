package com.everx.finance.controller;

import com.everx.finance.entity.TaxConfiguration;
import com.everx.finance.entity.TaxCalculation;
import com.everx.finance.service.TaxService;
import com.everx.finance.dto.TaxSummaryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/finance/tax")
@RequiredArgsConstructor
@Slf4j
public class TaxController {
    private final TaxService taxService;

    @PostMapping("/configuration")
    public ResponseEntity<TaxConfiguration> createTaxConfig(@RequestBody TaxConfiguration config) {
        log.info("Creating tax configuration: {}", config.getTaxCode());
        TaxConfiguration created = taxService.createTaxConfiguration(config, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/calculate")
    public ResponseEntity<TaxCalculation> calculateTax(
            @RequestParam Long taxConfigId,
            @RequestParam LocalDate periodStart,
            @RequestParam LocalDate periodEnd,
            @RequestParam BigDecimal taxableBase) {
        log.info("Calculating tax for config: {}", taxConfigId);
        TaxCalculation calculation = taxService.calculateTax(taxConfigId, periodStart, periodEnd, taxableBase, "system");
        return ResponseEntity.ok(calculation);
    }

    @PostMapping("/{calculationId}/post-to-gl")
    public ResponseEntity<String> postToGl(@PathVariable Long calculationId) {
        log.info("Posting tax to GL: {}", calculationId);
        taxService.postTaxToGl(calculationId, "system");
        return ResponseEntity.ok("Tax posted to GL successfully");
    }

    @PostMapping("/{calculationId}/record-payment")
    public ResponseEntity<String> recordPayment(
            @PathVariable Long calculationId,
            @RequestParam BigDecimal paymentAmount) {
        log.info("Recording tax payment: {}", paymentAmount);
        taxService.recordTaxPayment(calculationId, paymentAmount);
        return ResponseEntity.ok("Tax payment recorded successfully");
    }

    @GetMapping("/summary")
    public ResponseEntity<TaxSummaryDto> getTaxSummary(
            @RequestParam LocalDate periodStart,
            @RequestParam LocalDate periodEnd) {
        log.info("Getting tax summary for period: {} to {}", periodStart, periodEnd);
        TaxSummaryDto summary = taxService.getTaxSummary(periodStart, periodEnd);
        return ResponseEntity.ok(summary);
    }
}
