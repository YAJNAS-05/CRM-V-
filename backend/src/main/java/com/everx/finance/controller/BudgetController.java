package com.everx.finance.controller;

import com.everx.finance.dto.BudgetVarianceDto;
import com.everx.finance.entity.Budget;
import com.everx.finance.entity.BudgetLine;
import com.everx.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        log.info("Creating budget: {}", budget.getBudgetCode());
        Budget created = budgetService.createBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudget(@PathVariable Long id) {
        log.info("Getting budget: {}", id);
        Budget budget = budgetService.getBudget(id);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Budget> getBudgetByCode(@PathVariable String code) {
        log.info("Getting budget by code: {}", code);
        Optional<Budget> budget = budgetService.getBudgetByCode(code);
        return budget.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/period/{period}")
    public ResponseEntity<List<Budget>> getBudgetsByPeriod(@PathVariable String period) {
        log.info("Getting budgets for period: {}", period);
        List<Budget> budgets = budgetService.getBudgetsByPeriod(period);
        return ResponseEntity.ok(budgets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        log.info("Updating budget: {}", id);
        Budget updated = budgetService.updateBudget(id, budget);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Budget> approveBudget(@PathVariable Long id) {
        log.info("Approving budget: {}", id);
        Budget approved = budgetService.approveBudget(id);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Budget> rejectBudget(@PathVariable Long id) {
        log.info("Rejecting budget: {}", id);
        Budget rejected = budgetService.rejectBudget(id);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/{id}/lines")
    public ResponseEntity<BudgetLine> addBudgetLine(
            @PathVariable Long id,
            @RequestParam UUID accountId,
            @RequestParam BigDecimal amount,
            @RequestParam String budgetMonth) {
        log.info("Adding budget line to budget: {}", id);
        BudgetLine line = budgetService.addBudgetLine(id, accountId, amount, budgetMonth);
        return ResponseEntity.status(HttpStatus.CREATED).body(line);
    }

    @GetMapping("/{id}/lines")
    public ResponseEntity<List<BudgetLine>> getBudgetLines(@PathVariable Long id) {
        log.info("Getting budget lines for budget: {}", id);
        List<BudgetLine> lines = budgetService.getBudgetLines(id);
        return ResponseEntity.ok(lines);
    }

    @GetMapping("/{id}/total")
    public ResponseEntity<BigDecimal> getTotalBudgeted(@PathVariable Long id) {
        log.info("Getting total budgeted for budget: {}", id);
        BigDecimal total = budgetService.getTotalBudgeted(id);
        return ResponseEntity.ok(total);
    }

    @DeleteMapping("/lines/{lineId}")
    public ResponseEntity<Void> deleteBudgetLine(@PathVariable Long lineId) {
        log.info("Deleting budget line: {}", lineId);
        budgetService.deleteBudgetLine(lineId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/variance")
    public ResponseEntity<BudgetVarianceDto> getBudgetVariance(
            @PathVariable Long id,
            @RequestParam String budgetMonth) {
        log.info("Getting budget variance for budget: {}, month: {}", id, budgetMonth);
        BudgetVarianceDto variance = budgetService.getBudgetVariance(id, budgetMonth);
        return ResponseEntity.ok(variance);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Budget>> getApprovedBudgets() {
        log.info("Getting approved budgets");
        List<Budget> budgets = budgetService.getApprovedBudgets();
        return ResponseEntity.ok(budgets);
    }
}
