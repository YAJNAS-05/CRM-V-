package com.everx.finance.controller;

import com.everx.finance.entity.BankAccount;
import com.everx.finance.entity.BankStatement;
import com.everx.finance.entity.BankStatementLine;
import com.everx.finance.service.BankAccountService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/bank-accounts")
@RequiredArgsConstructor
@Slf4j
public class BankAccountController {
    private final BankAccountService bankAccountService;

    @PostMapping
    public ResponseEntity<BankAccount> createBankAccount(@RequestBody BankAccount account) {
        log.info("Creating bank account: {}", account.getAccountNumber());
        BankAccount created = bankAccountService.createBankAccount(account, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<BankAccount>> getActiveAccounts() {
        log.info("Getting active bank accounts");
        List<BankAccount> accounts = bankAccountService.getActiveAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<BankAccount> getAccountByNumber(@PathVariable String accountNumber) {
        log.info("Getting bank account: {}", accountNumber);
        BankAccount account = bankAccountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(account);
    }

    @PostMapping("/{accountId}/import-statement")
    public ResponseEntity<BankStatement> importStatement(
            @PathVariable Long accountId,
            @RequestBody ImportStatementRequest request) {
        log.info("Importing bank statement for account: {}", accountId);
        BankStatement statement = bankAccountService.importBankStatement(
                request.getStatement(), request.getLines(), "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(statement);
    }

    @PutMapping("/{accountId}/balances")
    public ResponseEntity<String> updateBalances(
            @PathVariable Long accountId,
            @RequestParam java.math.BigDecimal glBalance,
            @RequestParam java.math.BigDecimal bankBalance) {
        log.info("Updating balances for account: {}", accountId);
        bankAccountService.updateAccountBalances(accountId, glBalance, bankBalance);
        return ResponseEntity.ok("Balances updated successfully");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportStatementRequest {
        private BankStatement statement;
        private List<BankStatementLine> lines;
    }
}
