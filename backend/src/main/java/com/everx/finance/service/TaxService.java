package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.service.GlAccountService;
import com.everx.finance.dto.TaxSummaryDto;
import com.everx.finance.entity.TaxCalculation;
import com.everx.finance.entity.TaxConfiguration;
import com.everx.finance.journal.entity.JournalEntry;
import com.everx.finance.journal.entity.JournalEntryLine;
import com.everx.finance.journal.entity.PostingPeriod;
import com.everx.finance.journal.repository.JournalEntryLineRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import com.everx.finance.journal.repository.PostingPeriodRepository;
import com.everx.finance.repository.TaxCalculationRepository;
import com.everx.finance.repository.TaxConfigurationRepository;
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
public class TaxService {
    private final TaxConfigurationRepository configRepository;
    private final TaxCalculationRepository calculationRepository;
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
        private final PostingPeriodRepository postingPeriodRepository;
    private final GlAccountService glAccountService;

    /**
     * Create or update tax configuration
     */
    public TaxConfiguration createTaxConfiguration(TaxConfiguration config, String createdBy) {
        log.info("Creating tax configuration: {}", config.getTaxCode());
        
        if (configRepository.findByTaxCode(config.getTaxCode()).isPresent()) {
            throw new RuntimeException("Tax code already exists: " + config.getTaxCode());
        }
        
        config.setCreatedDate(LocalDate.now());
        config.setCreatedBy(createdBy);
        config.setStatus(TaxConfiguration.TaxStatus.ACTIVE);
        
        return configRepository.save(config);
    }

    /**
     * Calculate tax for a period
     */
    public TaxCalculation calculateTax(Long taxConfigId, LocalDate periodStart, LocalDate periodEnd,
                                      BigDecimal taxableBase, String createdBy) {
        log.info("Calculating tax for period: {} to {}", periodStart, periodEnd);
        
        TaxConfiguration config = configRepository.findById(taxConfigId)
                .orElseThrow(() -> new RuntimeException("Tax configuration not found"));
        
        // Calculate tax amount
        BigDecimal taxAmount = taxableBase.multiply(config.getTaxRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        TaxCalculation calculation = TaxCalculation.builder()
                .taxConfig(config)
                .taxPeriodStart(periodStart)
                .taxPeriodEnd(periodEnd)
                .taxableBase(taxableBase)
                .taxAmount(taxAmount)
                .adjustments(BigDecimal.ZERO)
                .payableAmount(taxAmount)
                .status(TaxCalculation.TaxCalculationStatus.CALCULATED)
                .createdDate(LocalDate.now())
                .createdBy(createdBy)
                .build();
        
        return calculationRepository.save(calculation);
    }

    /**
     * Apply tax credits/deductions
     */
    public void applyTaxAdjustments(Long calculationId, BigDecimal adjustmentAmount) {
        log.info("Applying tax adjustment: {}", adjustmentAmount);
        
        TaxCalculation calculation = calculationRepository.findById(calculationId)
                .orElseThrow(() -> new RuntimeException("Tax calculation not found"));
        
        calculation.setAdjustments(adjustmentAmount);
        calculation.setPayableAmount(calculation.getTaxAmount().subtract(adjustmentAmount));
        
        calculationRepository.save(calculation);
    }

    /**
     * Post tax liability to GL
     */
    public void postTaxToGl(Long calculationId, String postedBy) {
        log.info("Posting tax calculation to GL: {}", calculationId);
        
        TaxCalculation calculation = calculationRepository.findById(calculationId)
                .orElseThrow(() -> new RuntimeException("Tax calculation not found"));
        
        TaxConfiguration config = calculation.getTaxConfig();
        
        // Create journal entry for tax liability
        GlAccount expenseAccount = glAccountService.getAccountByCode("6300");
        PostingPeriod postingPeriod = resolvePostingPeriod(expenseAccount.getCompanyId(), LocalDate.now());

        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(LocalDate.now())
                .postingDate(LocalDate.now())
                .postingPeriod(postingPeriod)
                .companyId(expenseAccount.getCompanyId())
                .description("Tax accrual: " + config.getTaxName() + " for period " + 
                           calculation.getTaxPeriodStart() + " to " + calculation.getTaxPeriodEnd())
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        journalRepository.save(entry);
        
        // Debit tax expense
        JournalEntryLine expenseLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(expenseAccount) // Tax expense
                .debitAmount(calculation.getTaxAmount())
                .description("Tax expense")
                .build();
        
        // Credit tax payable
        JournalEntryLine payableLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(glAccountService.getAccountByCode(config.getApplicableToAccountCode()))
                .creditAmount(calculation.getPayableAmount())
                .description("Tax payable")
                .build();
        
        lineRepository.save(expenseLine);
        lineRepository.save(payableLine);
        
        // Update calculation status
        calculation.setStatus(TaxCalculation.TaxCalculationStatus.FILED);
        calculation.setJournalEntryId(entry.getId());
        calculationRepository.save(calculation);
    }

    /**
     * Record tax payment
     */
    public void recordTaxPayment(Long calculationId, BigDecimal paymentAmount) {
        log.info("Recording tax payment: {}", paymentAmount);
        
        TaxCalculation calculation = calculationRepository.findById(calculationId)
                .orElseThrow(() -> new RuntimeException("Tax calculation not found"));
        
        TaxConfiguration config = calculation.getTaxConfig();
        
        // Create payment journal entry
        GlAccount payableAccount = glAccountService.getAccountByCode(config.getApplicableToAccountCode());
        PostingPeriod postingPeriod = resolvePostingPeriod(payableAccount.getCompanyId(), LocalDate.now());

        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(LocalDate.now())
                .postingDate(LocalDate.now())
                .postingPeriod(postingPeriod)
                .companyId(payableAccount.getCompanyId())
                .description("Tax payment: " + config.getTaxName())
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        journalRepository.save(entry);
        
        // Debit tax payable
        JournalEntryLine payableLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(payableAccount)
                .debitAmount(paymentAmount)
                .description("Tax payment")
                .build();
        
        // Credit bank account
        JournalEntryLine bankLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(glAccountService.getAccountByCode("1010")) // Bank
                .creditAmount(paymentAmount)
                .description("Tax payment")
                .build();
        
        lineRepository.save(payableLine);
        lineRepository.save(bankLine);
        
        // Update calculation status
        calculation.setStatus(TaxCalculation.TaxCalculationStatus.PAID);
        calculationRepository.save(calculation);
    }

    /**
     * Get tax summary for period
     */
    public TaxSummaryDto getTaxSummary(LocalDate periodStart, LocalDate periodEnd) {
        log.info("Getting tax summary for period: {} to {}", periodStart, periodEnd);
        
        List<TaxCalculation> calculations = calculationRepository.findByTaxPeriod(periodStart, periodEnd);
        
        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalPayable = BigDecimal.ZERO;
        
        for (TaxCalculation calc : calculations) {
            totalTaxable = totalTaxable.add(calc.getTaxableBase());
            totalTax = totalTax.add(calc.getTaxAmount());
            totalPayable = totalPayable.add(calc.getPayableAmount());
        }
        
        return TaxSummaryDto.builder()
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .totalTaxableBase(totalTaxable)
                .totalTaxAmount(totalTax)
                .totalPayable(totalPayable)
                .calculations(calculations)
                .build();
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
