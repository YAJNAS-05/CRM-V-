package com.everx.finance.repository;

import com.everx.finance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByBudgetCode(String budgetCode);

    List<Budget> findByBudgetPeriod(String budgetPeriod);

    @Query("SELECT b FROM Budget b WHERE b.status = 'APPROVED' ORDER BY b.budgetPeriod DESC")
    List<Budget> findApprovedBudgets();

    List<Budget> findByStatusOrderByCreatedDateDesc(String status);
}
