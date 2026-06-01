package com.everx.finance.account.repository;

import com.everx.finance.account.entity.GlAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Chart of Accounts
 */
@Repository
public interface GlAccountRepository extends JpaRepository<GlAccount, UUID> {

    /**
     * Find GL account by code within a company
     */
    Optional<GlAccount> findByAccountCodeAndCompanyIdAndIsDeletedFalse(String accountCode, UUID companyId);

       /**
        * Find GL account by code without company filter
        */
       Optional<GlAccount> findFirstByAccountCodeAndIsDeletedFalse(String accountCode);

    /**
     * Find all GL accounts for a company
     */
    Page<GlAccount> findByCompanyIdAndIsDeletedFalse(UUID companyId, Pageable pageable);

    /**
     * Find all active GL accounts for a company
     */
    Page<GlAccount> findByCompanyIdAndIsActiveTrueAndIsDeletedFalse(UUID companyId, Pageable pageable);

    /**
     * Find all GL accounts by type
     */
    List<GlAccount> findByCompanyIdAndAccountTypeAndIsDeletedFalse(UUID companyId, GlAccount.AccountType accountType);

    /**
     * Find child accounts of a parent
     */
    List<GlAccount> findByParentAccountIdAndIsDeletedFalse(UUID parentAccountId);

    /**
     * Find all detail accounts (leaf nodes) for a company
     */
    @Query("SELECT ga FROM GlAccount ga WHERE ga.companyId = :companyId " +
           "AND ga.isDeleted = false AND ga.id NOT IN " +
           "(SELECT DISTINCT pa.id FROM GlAccount pa WHERE pa.parentAccount IS NULL AND pa.companyId = :companyId " +
           "OR pa.id IN (SELECT DISTINCT paa.parentAccount.id FROM GlAccount paa WHERE paa.companyId = :companyId))")
    List<GlAccount> findDetailAccounts(UUID companyId);

    /**
     * Search GL accounts by name or code
     */
    @Query("SELECT ga FROM GlAccount ga WHERE ga.companyId = :companyId " +
           "AND ga.isDeleted = false " +
           "AND (ga.accountCode LIKE %:search% OR ga.accountName LIKE %:search%)")
    Page<GlAccount> searchByCodeOrName(UUID companyId, String search, Pageable pageable);

    /**
     * Check if account code exists
     */
    boolean existsByAccountCodeAndCompanyIdAndIsDeletedFalse(String accountCode, UUID companyId);

    /**
     * Check if account code exists excluding current ID
     */
    @Query("SELECT CASE WHEN COUNT(ga) > 0 THEN true ELSE false END " +
           "FROM GlAccount ga WHERE ga.accountCode = :accountCode AND ga.companyId = :companyId " +
           "AND ga.id != :excludeId AND ga.isDeleted = false")
    boolean existsByAccountCodeExcludingId(String accountCode, UUID companyId, UUID excludeId);

    /**
     * Find GL account by account code without company filter
     */
    @Query("SELECT ga FROM GlAccount ga WHERE ga.accountCode = :accountCode AND ga.isDeleted = false")
    Optional<GlAccount> findByCode(@Param("accountCode") String accountCode);
}

