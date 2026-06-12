package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.entity.GlRevaluation;
import com.everx.finance.journal.entity.JournalEntry;
import com.everx.finance.journal.entity.JournalEntryLine;
import com.everx.finance.journal.entity.PostingPeriod;
import com.everx.finance.journal.repository.JournalEntryLineRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import com.everx.finance.journal.repository.PostingPeriodRepository;
import com.everx.finance.account.repository.GlAccountRepository;
import com.everx.finance.repository.GlRevaluationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GlRevaluationService {
    private final GlRevaluationRepository revaluationRepository;
    private final GlAccountRepository glAccountRepository;
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
        private final PostingPeriodRepository postingPeriodRepository;
    private final ExchangeRateService exchangeRateService;

    /**
     * Perform period-end revaluation for multi-currency accounts
     */
    public void performPeriodEndRevaluation(LocalDate revaluationDate, String reportingCurrency) {
                log.info("Performing period-end revaluation as of {}", revaluationDate);

                // Account currency/balance tracking is not available in the current GL model.
                // This method is a no-op until multi-currency balances are persisted on GL accounts.
                log.info("Skipping revaluation: GL account currency is not configured");
    }

    /**
     * Revalue a single account
     */
    public GlRevaluation revaluateAccount(GlAccount account, LocalDate revaluationDate, String reportingCurrency) {
        log.info("Revaluing account: {} to {}", account.getAccountCode(), reportingCurrency);

        BigDecimal originalBalance = BigDecimal.ZERO;
        BigDecimal exchangeRate = BigDecimal.ONE;
        BigDecimal revaluedBalance = BigDecimal.ZERO;
        BigDecimal revaluationGainLoss = BigDecimal.ZERO;
        
        // Create revaluation record
        GlRevaluation revaluation = GlRevaluation.builder()
                .account(account)
                .revaluationDate(revaluationDate)
                .originalCurrency(reportingCurrency)
                .reportingCurrency(reportingCurrency)
                .originalBalance(originalBalance)
                .revaluedBalance(revaluedBalance)
                .revaluationGainLoss(revaluationGainLoss)
                .exchangeRate(exchangeRate)
                .build();
        
        revaluation = revaluationRepository.save(revaluation);
        
        // Post revaluation gain/loss to GL if material
                if (revaluationGainLoss.abs().compareTo(BigDecimal.ZERO) > 0) {
                        JournalEntry entry = postRevaluationEntry(account, revaluation, reportingCurrency);
                        revaluation.setJournalEntryId(entry.getId());
                        revaluation = revaluationRepository.save(revaluation);
                }
        
        log.info("Account revalued: gain/loss = {}", revaluationGainLoss);
        return revaluation;
    }

    /**
     * Post revaluation gain/loss to GL
     */
    private JournalEntry postRevaluationEntry(GlAccount account, GlRevaluation revaluation, String reportingCurrency) {
        log.info("Posting revaluation entry for account: {}", account.getAccountCode());
        
        // Get revaluation gain/loss account (typically 9xxx range)
        GlAccount gainLossAccount = glAccountRepository.findByCode("9100")
                .orElseThrow(() -> new RuntimeException("Revaluation gain/loss account not found"));
        
        PostingPeriod postingPeriod = resolvePostingPeriod(account.getCompanyId(), revaluation.getRevaluationDate());

        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(revaluation.getRevaluationDate())
                .postingDate(revaluation.getRevaluationDate())
                .postingPeriod(postingPeriod)
                .companyId(account.getCompanyId())
                .description("FX Revaluation for " + account.getAccountCode())
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        // Debit or credit based on gain/loss
        if (revaluation.getRevaluationGainLoss().compareTo(BigDecimal.ZERO) > 0) {
            // Gain: Debit account, credit gain/loss
            JournalEntryLine debitLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(account)
                    .debitAmount(revaluation.getRevaluationGainLoss())
                    .build();
            
            JournalEntryLine creditLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(gainLossAccount)
                    .creditAmount(revaluation.getRevaluationGainLoss())
                    .build();
            
            entry.getJournalEntryLines().add(debitLine);
            entry.getJournalEntryLines().add(creditLine);
        } else {
            // Loss: Credit account, debit gain/loss
            JournalEntryLine creditLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(account)
                    .creditAmount(revaluation.getRevaluationGainLoss().abs())
                    .build();
            
            JournalEntryLine debitLine = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .glAccount(gainLossAccount)
                    .debitAmount(revaluation.getRevaluationGainLoss().abs())
                    .build();
            
            entry.getJournalEntryLines().add(debitLine);
            entry.getJournalEntryLines().add(creditLine);
        }
        
        return journalRepository.save(entry);
    }

    /**
     * Get revaluation history for an account
     */
    public List<GlRevaluation> getRevaluationHistory(UUID accountId) {
        return revaluationRepository.findByAccount_IdOrderByRevaluationDateDesc(accountId);
    }

    /**
     * Get total revaluation gain/loss for period
     */
    public BigDecimal getTotalRevaluationGainLoss(LocalDate startDate, LocalDate endDate) {
        List<GlRevaluation> revaluations = revaluationRepository
                .findByRevaluationDateBetween(startDate, endDate);
        
        return revaluations.stream()
                .map(GlRevaluation::getRevaluationGainLoss)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

        private PostingPeriod resolvePostingPeriod(UUID companyId, LocalDate entryDate) {
                Optional<PostingPeriod> period = postingPeriodRepository.findByDateInPeriod(companyId, entryDate);
                if (period.isPresent()) {
                        return period.get();
                }

                PostingPeriod fallback = PostingPeriod.builder()
                                .companyId(companyId)
                                .periodName(YearMonth.from(entryDate).toString())
                                .startDate(entryDate.withDayOfMonth(1))
                                .endDate(entryDate.withDayOfMonth(entryDate.lengthOfMonth()))
                                .status(PostingPeriod.Status.OPEN)
                                .allowManualAdjustments(true)
                                .build();

                return postingPeriodRepository.save(fallback);
        }
}
