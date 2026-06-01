package com.everx.finance.journal.repository;

import com.everx.finance.journal.entity.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Journal Entries
 */
@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {

    Page<JournalEntry> findByPostingPeriodIdAndIsDeletedFalse(UUID postingPeriodId, Pageable pageable);

    Page<JournalEntry> findByStatusAndCompanyIdAndIsDeletedFalse(JournalEntry.Status status, UUID companyId, Pageable pageable);

    Page<JournalEntry> findByCompanyIdAndPostingDateBetweenAndIsDeletedFalse(
        UUID companyId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Optional<JournalEntry> findByReferenceAndCompanyIdAndIsDeletedFalse(String reference, UUID companyId);

    Optional<JournalEntry> findByEntryNumberAndIsDeletedFalse(String entryNumber);

    @Query("SELECT je FROM JournalEntry je WHERE je.postingPeriod.id = :periodId " +
           "AND je.status = 'DRAFT' AND je.isDeleted = false")
    List<JournalEntry> findUnpostedEntriesInPeriod(@Param("periodId") UUID periodId);

    long countByPostingPeriodIdAndStatusAndIsDeletedFalse(UUID periodId, JournalEntry.Status status);

    @Query("SELECT jel.glAccount.accountCode, jel.glAccount.accountName, " +
           "SUM(COALESCE(jel.debitAmount, 0)), SUM(COALESCE(jel.creditAmount, 0)) " +
           "FROM JournalEntryLine jel WHERE jel.journalEntry.postingDate <= :asOfDate " +
           "AND jel.journalEntry.isDeleted = false " +
           "GROUP BY jel.glAccount.accountCode, jel.glAccount.accountName")
    List<Object[]> getTrialBalance(@Param("asOfDate") LocalDate asOfDate);

    @Query("SELECT jel.glAccount.accountCode, " +
           "SUM(COALESCE(jel.debitAmount, 0)) - SUM(COALESCE(jel.creditAmount, 0)) " +
           "FROM JournalEntryLine jel WHERE jel.journalEntry.postingDate <= :asOfDate " +
           "AND jel.journalEntry.isDeleted = false " +
           "GROUP BY jel.glAccount.accountCode")
    List<Object[]> getAccountBalances(@Param("asOfDate") LocalDate asOfDate);
}
