package com.everx.finance.service;

import com.everx.finance.entity.BankAccount;
import com.everx.finance.entity.BankStatement;
import com.everx.finance.entity.BankStatementLine;
import com.everx.finance.repository.BankAccountRepository;
import com.everx.finance.repository.BankStatementRepository;
import com.everx.finance.repository.BankStatementLineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BankAccountService {
    private final BankAccountRepository accountRepository;
    private final BankStatementRepository statementRepository;
    private final BankStatementLineRepository lineRepository;

    /**
     * Create bank account
     */
    public BankAccount createBankAccount(BankAccount account, String createdBy) {
        log.info("Creating bank account: {}", account.getAccountNumber());
        
        if (accountRepository.findByAccountNumber(account.getAccountNumber()).isPresent()) {
            throw new RuntimeException("Account number already exists");
        }
        
        account.setCreatedDate(LocalDate.now());
        account.setCreatedBy(createdBy);
        account.setStatus(BankAccount.AccountStatus.ACTIVE);
        account.setReconciliationDifference(BigDecimal.ZERO);
        
        return accountRepository.save(account);
    }

    /**
     * Import bank statement and lines
     */
    public BankStatement importBankStatement(BankStatement statement, List<BankStatementLine> lines, String importedBy) {
        log.info("Importing bank statement for account: {} dated: {}", 
                statement.getBankAccount().getId(), statement.getStatementDate());
        
        statement.setCreatedDate(LocalDate.now());
        statement.setCreatedBy(importedBy);
        statement.setStatus(BankStatement.StatementStatus.PENDING);
        statement.setTransactionCount(lines.size());
        
        BankStatement savedStatement = statementRepository.save(statement);
        
        // Save statement lines
        for (BankStatementLine line : lines) {
            line.setStatement(savedStatement);
            lineRepository.save(line);
        }
        
        log.info("Bank statement imported with {} transactions", lines.size());
        return savedStatement;
    }

    /**
     * Get all active accounts
     */
    public List<BankAccount> getActiveAccounts() {
        return accountRepository.findByStatus(BankAccount.AccountStatus.ACTIVE);
    }

    /**
     * Get account by number
     */
    public BankAccount getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
    }

    /**
     * Update account balances
     */
    public void updateAccountBalances(Long accountId, BigDecimal glBalance, BigDecimal bankBalance) {
        log.info("Updating account balances: GL={}, Bank={}", glBalance, bankBalance);
        
        BankAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setGlAccountBalance(glBalance);
        account.setBankStatementBalance(bankBalance);
        account.setReconciliationDifference(bankBalance.subtract(glBalance));
        
        accountRepository.save(account);
    }
}
