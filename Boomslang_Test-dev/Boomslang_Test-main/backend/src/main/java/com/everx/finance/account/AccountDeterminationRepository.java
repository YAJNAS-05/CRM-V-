package com.everx.finance.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountDeterminationRepository extends JpaRepository<AccountDetermination, UUID> {
    
    @Query(value = """
        SELECT a FROM AccountDetermination a 
        WHERE a.companyCode = :companyCode 
          AND a.transactionKey = :transactionKey 
          AND a.valuationClass = :valuationClass
          AND a.isActive = true
          AND a.effectiveFrom <= :date
          AND (a.effectiveTo IS NULL OR a.effectiveTo >= :date)
        ORDER BY a.effectiveFrom DESC
        LIMIT 1
    """)
    Optional<AccountDetermination> findActiveAccount(String companyCode, String transactionKey, String valuationClass, LocalDate date);

    /**
     * Find all account determinations for a specific company.
     */
    List<AccountDetermination> findByCompanyCode(String companyCode);
}
