package com.everx.finance.controller;

import com.everx.finance.service.FinanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/reports")
@RequiredArgsConstructor
public class FinanceReportController {
    private final FinanceReportService reportService;

    @GetMapping("/trial-balance")
    public ResponseEntity<Map<String, Object>> getTrialBalance(@RequestParam LocalDate asOfDate) {
        return ResponseEntity.ok(reportService.generateTrialBalance(asOfDate));
    }

    @GetMapping("/ap-aging")
    public ResponseEntity<Map<String, Object>> getApAging() {
        return ResponseEntity.ok(reportService.generateApAging());
    }

    @GetMapping("/ar-aging")
    public ResponseEntity<Map<String, Object>> getArAging() {
        return ResponseEntity.ok(reportService.generateArAging());
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<Map<String, Object>> getCashFlow(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(reportService.generateCashFlow(startDate, endDate));
    }
}
