package com.everx.finance.journal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface GlJournalEntryRepository extends JpaRepository<GlJournalEntry, UUID> {

    /**
     * Sum all debit amounts for a given account code within a posting date range.
     * Used to calculate P&amp;L cost (account 5000) and AP outflow.
     */
    @Query("SELECT COALESCE(SUM(g.debitAmount), 0) FROM GlJournalEntry g "
         + "WHERE g.debitAccountCode = :accountCode "
         + "AND g.postingDate BETWEEN :startDate AND :endDate "
         + "AND g.status = 'POSTED' "
         + "AND g.isDeleted = false")
    BigDecimal sumDebitsByAccountAndPeriod(
            @Param("accountCode") String accountCode,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Sum debit amounts for a given account code, entity, and posting date range.
     */
    @Query("SELECT COALESCE(SUM(g.debitAmount), 0) FROM GlJournalEntry g "
         + "WHERE g.debitAccountCode = :accountCode "
         + "AND g.entity = :entity "
         + "AND g.postingDate BETWEEN :startDate AND :endDate "
         + "AND g.status = 'POSTED' "
         + "AND g.isDeleted = false")
    BigDecimal sumDebitsByAccountEntityAndPeriod(
            @Param("accountCode") String accountCode,
            @Param("entity") String entity,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Sum all credit amounts for a given account code within a posting date range.
     * Used to calculate cash outflows (credit to account 1000 = cash leaving the business).
     */
    @Query("SELECT COALESCE(SUM(g.creditAmount), 0) FROM GlJournalEntry g "
         + "WHERE g.creditAccountCode = :accountCode "
         + "AND g.postingDate BETWEEN :startDate AND :endDate "
         + "AND g.status = 'POSTED' "
         + "AND g.isDeleted = false")
    BigDecimal sumCreditsByAccountAndPeriod(
            @Param("accountCode") String accountCode,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(g) FROM GlJournalEntry g "
      + "WHERE g.postingDate BETWEEN :startDate AND :endDate "
      + "AND g.isDeleted = false "
      + "AND UPPER(g.entity) = UPPER(:companyCode) "
      + "AND g.status <> 'POSTED'")
    long countNonPostedByCompanyAndPeriod(
         @Param("companyCode") String companyCode,
         @Param("startDate") LocalDate startDate,
         @Param("endDate") LocalDate endDate);

    boolean existsByJournalSourceAndRefDocumentIdAndPostingDateAndIsDeletedFalse(
         String journalSource,
         String refDocumentId,
         LocalDate postingDate);
}
