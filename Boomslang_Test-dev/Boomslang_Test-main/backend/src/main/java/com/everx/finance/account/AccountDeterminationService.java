package com.everx.finance.account;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

/**
 * Service for determining GL accounts based on transaction type and company.
 * Results are cached for performance.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class AccountDeterminationService {

    private final AccountDeterminationRepository repository;

    /**
     * Get GL account for transaction type.
     * Cached by company + transaction key + valuation class combination.
     * 
     * @param companyCode Company code (AU01, US01, JP01)
     * @param transactionKey Transaction key (BSX, GBB, REV, etc.)
     * @param valuationClass Valuation class (EQUIP, PARTS, SERVICE, etc.)
     * @return GL account number as String
     * @throws AccountDeterminationException if no account configured
     */
    @Cacheable(
        value = "accountDetermination",
        key = "#companyCode + '_' + #transactionKey + '_' + #valuationClass"
    )
    public String getGlAccount(String companyCode, String transactionKey, String valuationClass) {
        return repository
            .findActiveAccount(companyCode, transactionKey, valuationClass, LocalDate.now())
            .map(AccountDetermination::getGlAccount)
            .orElseThrow(() -> new AccountDeterminationException(
                "No GL account configured for: " + companyCode + 
                " / " + transactionKey + " / " + valuationClass +
                ". Please configure in Finance → Account Determination."
            ));
    }

    /**
     * Clear all cached account determinations.
     * Called after creating, updating, or deleting account determination rules.
     */
    @CacheEvict(value = "accountDetermination", allEntries = true)
    public void invalidateCache() {
        log.debug("Account determination cache invalidated");
    }
}
