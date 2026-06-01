package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.service.GlAccountService;
import com.everx.finance.journal.entity.JournalEntry;
import com.everx.finance.journal.entity.JournalEntryLine;
import com.everx.finance.journal.entity.PostingPeriod;
import com.everx.finance.journal.repository.JournalEntryLineRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import com.everx.finance.journal.repository.PostingPeriodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GlJournalService {
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
    private final PostingPeriodRepository periodRepository;
    private final GlAccountService accountService;

    /**
     * Post a journal entry to GL accounts
     */
    public void postJournal(UUID journalId) {
        JournalEntry journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new RuntimeException("Journal not found"));
        
        if (!journal.getStatus().equals(JournalEntry.Status.DRAFT)) {
            throw new RuntimeException("Only draft journals can be posted");
        }

        PostingPeriod period = journal.getPostingPeriod();
        if (period == null) {
            period = periodRepository.findByDateInPeriod(journal.getCompanyId(), journal.getPostingDate())
                    .orElseThrow(() -> new RuntimeException("No open posting period for date: " + journal.getPostingDate()));
            journal.setPostingPeriod(period);
        }

        if (!period.isPostingAllowed()) {
            throw new RuntimeException("Posting period is closed");
        }

        journal.setStatus(JournalEntry.Status.POSTED);
        journalRepository.save(journal);
    }

    /**
     * Get trial balance for a period
     */
    public List<Object[]> getTrialBalance(LocalDate asOfDate) {
        return journalRepository.getTrialBalance(asOfDate);
    }

    /**
     * Approve a journal entry
     */
    public void approveJournal(UUID journalId) {
        JournalEntry journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new RuntimeException("Journal not found"));
        journal.setStatus(JournalEntry.Status.DRAFT);
        journalRepository.save(journal);
    }

    /**
     * Reject a journal entry
     */
    public void rejectJournal(UUID journalId, String reason) {
        JournalEntry journal = journalRepository.findById(journalId)
                .orElseThrow(() -> new RuntimeException("Journal not found"));
        journal.setStatus(JournalEntry.Status.VOID);
        journal.setNotes(reason);
        journalRepository.save(journal);
    }

    /**
     * Get account balances
     */
    public List<Object[]> getAccountBalances(LocalDate asOfDate) {
        return journalRepository.getAccountBalances(asOfDate);
    }
}
