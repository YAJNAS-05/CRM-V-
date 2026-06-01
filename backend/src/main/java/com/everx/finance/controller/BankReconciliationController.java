package com.everx.finance.controller;

import com.everx.finance.entity.BankReconciliation;
import com.everx.finance.service.BankReconciliationService;
import com.everx.finance.dto.BankReconciliationReportDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance/bank-reconciliation")
@RequiredArgsConstructor
@Slf4j
public class BankReconciliationController {
    private final BankReconciliationService reconciliationService;

    @PostMapping("/{statementId}/reconcile")
    public ResponseEntity<BankReconciliation> reconcileStatement(@PathVariable Long statementId) {
        log.info("Reconciling statement: {}", statementId);
        BankReconciliation reconciliation = reconciliationService.reconcileStatement(statementId, "system");
        return ResponseEntity.ok(reconciliation);
    }

    @PostMapping("/{statementLineId}/match")
    public ResponseEntity<String> matchLine(
            @PathVariable Long statementLineId,
            @RequestParam Long journalLineId) {
        log.info("Matching statement line {} to journal line {}", statementLineId, journalLineId);
        reconciliationService.manualMatchLine(statementLineId, journalLineId, "system");
        return ResponseEntity.ok("Line matched successfully");
    }

    @PostMapping("/{statementLineId}/unmatch")
    public ResponseEntity<String> unmatchLine(@PathVariable Long statementLineId) {
        log.info("Unmatching statement line: {}", statementLineId);
        reconciliationService.unmatchLine(statementLineId);
        return ResponseEntity.ok("Line unmatched successfully");
    }

    @GetMapping("/{reconciliationId}/report")
    public ResponseEntity<BankReconciliationReportDto> getReconciliationReport(
            @PathVariable Long reconciliationId) {
        log.info("Getting reconciliation report: {}", reconciliationId);
        BankReconciliationReportDto report = reconciliationService.getReconciliationReport(reconciliationId);
        return ResponseEntity.ok(report);
    }
}
