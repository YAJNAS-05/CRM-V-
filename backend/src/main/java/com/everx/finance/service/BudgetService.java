package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.repository.GlAccountRepository;
import com.everx.finance.dto.BudgetVarianceDto;
import com.everx.finance.entity.Budget;
import com.everx.finance.entity.BudgetLine;
import com.everx.finance.repository.BudgetLineRepository;
import com.everx.finance.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final BudgetLineRepository budgetLineRepository;
    private final GlAccountRepository glAccountRepository;

    /**
     * Create new budget
     */
    public Budget createBudget(Budget budget) {
        log.info("Creating budget: {}", budget.getBudgetCode());
        
        if (budgetRepository.findByBudgetCode(budget.getBudgetCode()).isPresent()) {
            throw new RuntimeException("Budget code already exists");
        }
        
        budget.setStatus(Budget.BudgetStatus.DRAFT);
        return budgetRepository.save(budget);
    }

    /**
     * Get budget by ID
     */
    public Budget getBudget(Long budgetId) {
        return budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    /**
     * Get budget by code
     */
    public Optional<Budget> getBudgetByCode(String budgetCode) {
        return budgetRepository.findByBudgetCode(budgetCode);
    }

    /**
     * Get budgets by period
     */
    public List<Budget> getBudgetsByPeriod(String budgetPeriod) {
        return budgetRepository.findByBudgetPeriod(budgetPeriod);
    }

    /**
     * Add budget line
     */
    public BudgetLine addBudgetLine(Long budgetId, UUID accountId, BigDecimal amount, String budgetMonth) {
        log.info("Adding budget line: budget={}, account={}, amount={}", budgetId, accountId, amount);
        
        Budget budget = getBudget(budgetId);
        GlAccount account = glAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        BudgetLine line = BudgetLine.builder()
                .budget(budget)
                .account(account)
                .budgetedAmount(amount)
                .budgetMonth(budgetMonth)
                .build();
        
        return budgetLineRepository.save(line);
    }

    /**
     * Get budget lines for a budget
     */
    public List<BudgetLine> getBudgetLines(Long budgetId) {
        return budgetLineRepository.findByBudgetId(budgetId);
    }

    /**
     * Get total budgeted amount
     */
    public BigDecimal getTotalBudgeted(Long budgetId) {
        return budgetLineRepository.getTotalBudgeted(budgetId);
    }

    /**
     * Approve budget
     */
    public Budget approveBudget(Long budgetId) {
        log.info("Approving budget: {}", budgetId);
        
        Budget budget = getBudget(budgetId);
        
        if (budget.getStatus() != Budget.BudgetStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT budgets can be approved");
        }
        
        budget.setStatus(Budget.BudgetStatus.APPROVED);
        return budgetRepository.save(budget);
    }

    /**
     * Reject budget
     */
    public Budget rejectBudget(Long budgetId) {
        log.info("Rejecting budget: {}", budgetId);
        
        Budget budget = getBudget(budgetId);
        budget.setStatus(Budget.BudgetStatus.REJECTED);
        return budgetRepository.save(budget);
    }

    /**
     * Get variance report (Budget vs Actual)
     */
    public BudgetVarianceDto getBudgetVariance(Long budgetId, String budgetMonth) {
        log.info("Calculating budget variance for budget={}, month={}", budgetId, budgetMonth);
        
        Budget budget = getBudget(budgetId);
        List<BudgetLine> budgetLines = budgetLineRepository.findByBudgetIdAndBudgetMonth(budgetId, budgetMonth);
        
        BigDecimal totalBudgeted = BigDecimal.ZERO;
        BigDecimal totalActual = BigDecimal.ZERO;
        
        for (BudgetLine line : budgetLines) {
            totalBudgeted = totalBudgeted.add(line.getBudgetedAmount());
            // TODO: Get actual from GL account balance for the period
        }
        
        BigDecimal variance = totalActual.subtract(totalBudgeted);
        BigDecimal variancePercent = totalBudgeted.compareTo(BigDecimal.ZERO) > 0 
                ? variance.multiply(BigDecimal.valueOf(100)).divide(totalBudgeted, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        
        return BudgetVarianceDto.builder()
                .budgetId(budgetId)
                .budgetMonth(budgetMonth)
                .totalBudgeted(totalBudgeted)
                .totalActual(totalActual)
                .variance(variance)
                .variancePercent(variancePercent)
                .build();
    }

    /**
     * List all approved budgets
     */
    public List<Budget> getApprovedBudgets() {
        return budgetRepository.findApprovedBudgets();
    }

    /**
     * Update budget
     */
    public Budget updateBudget(Long budgetId, Budget updatedBudget) {
        log.info("Updating budget: {}", budgetId);
        
        Budget budget = getBudget(budgetId);
        budget.setBudgetName(updatedBudget.getBudgetName());
        budget.setDescription(updatedBudget.getDescription());
        
        return budgetRepository.save(budget);
    }

    /**
     * Delete budget line
     */
    public void deleteBudgetLine(Long budgetLineId) {
        log.info("Deleting budget line: {}", budgetLineId);
        budgetLineRepository.deleteById(budgetLineId);
    }
}
