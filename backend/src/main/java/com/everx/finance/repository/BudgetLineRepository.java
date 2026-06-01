package com.everx.finance.repository;

import com.everx.finance.entity.BudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {
    List<BudgetLine> findByBudgetId(Long budgetId);

    List<BudgetLine> findByBudgetIdAndBudgetMonth(Long budgetId, String budgetMonth);

    @Query("SELECT COALESCE(SUM(bl.budgetedAmount), 0) FROM BudgetLine bl WHERE bl.budget.id = ?1")
    BigDecimal getTotalBudgeted(Long budgetId);

    List<BudgetLine> findByAccountId(UUID accountId);
}
