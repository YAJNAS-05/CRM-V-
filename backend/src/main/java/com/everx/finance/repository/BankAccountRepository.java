package com.everx.finance.repository;

import com.everx.finance.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    
    List<BankAccount> findByStatus(BankAccount.AccountStatus status);
    
    List<BankAccount> findByCurrency(String currency);
}
