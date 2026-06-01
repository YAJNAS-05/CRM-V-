package com.everx.finance.repository;

import com.everx.finance.entity.BankStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankStatementRepository extends JpaRepository<BankStatement, Long> {
    List<BankStatement> findByBankAccountId(Long accountId);
    
    Optional<BankStatement> findByBankAccountIdAndStatementDate(Long accountId, LocalDate statementDate);
    
    @Query("SELECT b FROM BankStatement b WHERE b.bankAccount.id = :accountId AND b.statementDate BETWEEN :start AND :end")
    List<BankStatement> findByAccountAndDateRange(@Param("accountId") Long accountId, 
                                                   @Param("start") LocalDate start, 
                                                   @Param("end") LocalDate end);
    
    List<BankStatement> findByStatus(BankStatement.StatementStatus status);
}
