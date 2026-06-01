package com.everx.finance.controller;

import com.everx.finance.dto.FinancialRatiosDto;
import com.everx.finance.service.FinancialRatiosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/finance/ratios")
@RequiredArgsConstructor
@Slf4j
public class FinancialRatiosController {
    private final FinancialRatiosService financialRatiosService;

    @GetMapping
    public ResponseEntity<FinancialRatiosDto> getFinancialRatios(
            @RequestParam(required = false) LocalDate asOfDate) {
        log.info("Getting financial ratios as of {}", asOfDate);
        if (asOfDate == null) {
            asOfDate = LocalDate.now();
        }
        FinancialRatiosDto ratios = financialRatiosService.calculateFinancialRatios(asOfDate);
        return ResponseEntity.ok(ratios);
    }
}
