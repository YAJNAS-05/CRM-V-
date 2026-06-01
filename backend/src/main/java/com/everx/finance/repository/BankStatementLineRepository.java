package com.everx.finance.repository;

import com.everx.finance.entity.BankStatementLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BankStatementLineRepository extends JpaRepository<BankStatementLine, Long> {
    List<BankStatementLine> findByStatementId(Long statementId);
    
    @Query("SELECT b FROM BankStatementLine b WHERE b.statement.id = :statementId AND b.matchStatus = :status")
    List<BankStatementLine> findByStatementAndMatchStatus(@Param("statementId") Long statementId, 
                                                          @Param("status") BankStatementLine.MatchStatus status);
    
    @Query("SELECT b FROM BankStatementLine b WHERE b.statement.bankAccount.id = :accountId AND b.transactionDate = :date AND b.amount = :amount")
    List<BankStatementLine> findByAccountDateAndAmount(@Param("accountId") Long accountId, 
                                                       @Param("date") LocalDate date, 
                                                       @Param("amount") java.math.BigDecimal amount);
}
