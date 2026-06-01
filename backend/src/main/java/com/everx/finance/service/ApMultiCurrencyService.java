package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.ap.entity.ApPayment;
import com.everx.finance.ap.entity.VendorInvoice;
import com.everx.finance.ap.repository.ApPaymentRepository;
import com.everx.finance.ap.repository.VendorInvoiceRepository;
import com.everx.finance.dto.ApAgingMultiCurrencyDto;
import com.everx.finance.journal.entity.JournalEntry;
import com.everx.finance.journal.entity.JournalEntryLine;
import com.everx.finance.journal.entity.PostingPeriod;
import com.everx.finance.journal.repository.JournalEntryLineRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import com.everx.finance.journal.repository.PostingPeriodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApMultiCurrencyService {
    private final VendorInvoiceRepository invoiceRepository;
    private final ApPaymentRepository paymentRepository;
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
        private final PostingPeriodRepository postingPeriodRepository;
    private final ExchangeRateService exchangeRateService;

    /**
     * Record AP payment in foreign currency
     */
        public ApPayment recordMultiCurrencyPayment(UUID invoiceId, BigDecimal paymentAmount, 
                                                                                                String paymentCurrency, LocalDate paymentDate) {
        log.info("Recording multi-currency AP payment: amount={}, currency={}", paymentAmount, paymentCurrency);
        
        VendorInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        // Convert payment to invoice currency
        BigDecimal convertedAmount = exchangeRateService.convertCurrency(
                paymentCurrency,
                invoice.getCurrency(),
                paymentAmount,
                paymentDate
        );
        
        // Calculate FX gain/loss
        BigDecimal fxGainLoss = convertedAmount.subtract(paymentAmount);
        
        ApPayment payment = ApPayment.builder()
                .vendorInvoice(invoice)
                .paymentAmount(convertedAmount)
                .paymentDate(paymentDate)
                .paymentMethod(ApPayment.PaymentMethod.BANK_TRANSFER)
                .currency(invoice.getCurrency())
                .exchangeRate(paymentAmount.compareTo(BigDecimal.ZERO) == 0
                        ? BigDecimal.ONE
                        : convertedAmount.divide(paymentAmount, 6, RoundingMode.HALF_UP))
                .amountInBaseCurrency(convertedAmount)
                .build();
        
        ApPayment savedPayment = paymentRepository.save(payment);
        
                invoice.getPayments().add(savedPayment);
                if (invoice.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        invoice.setStatus(VendorInvoice.Status.PAID);
                } else {
                        invoice.setStatus(VendorInvoice.Status.PARTIALLY_PAID);
                }
                invoiceRepository.save(invoice);
        
        // Post FX gain/loss to GL if material
        if (fxGainLoss.abs().compareTo(BigDecimal.ZERO) > 0) {
            postFxGainLossEntry(invoice, fxGainLoss, paymentDate);
        }
        
        log.info("Multi-currency payment recorded: FX gain/loss = {}", fxGainLoss);
        return savedPayment;
    }

    /**
     * Post FX gain/loss journal entry
     */
    private void postFxGainLossEntry(VendorInvoice invoice, BigDecimal fxGainLoss, LocalDate entryDate) {
        log.info("Posting FX gain/loss entry for invoice: {}", invoice.getId());

                GlAccount glAccount = invoice.getGlAccount();
                if (glAccount == null) {
                        log.warn("Skipping FX gain/loss posting: invoice {} has no GL account", invoice.getId());
                        return;
                }
                PostingPeriod postingPeriod = resolvePostingPeriod(glAccount.getCompanyId(), entryDate);
        
        JournalEntry entry = JournalEntry.builder()
                                .entryNumber("JE-" + UUID.randomUUID())
                                .entryDate(entryDate)
                                .postingDate(entryDate)
                                .postingPeriod(postingPeriod)
                                .companyId(glAccount.getCompanyId())
                .description("FX Gain/Loss for AP Invoice " + invoice.getInvoiceNumber())
                                .status(JournalEntry.Status.DRAFT)
                .build();

                JournalEntryLine line = JournalEntryLine.builder()
                                .journalEntry(entry)
                                .glAccount(glAccount)
                                .description("FX gain/loss")
                                .debitAmount(fxGainLoss.compareTo(BigDecimal.ZERO) < 0 ? fxGainLoss.abs() : null)
                                .creditAmount(fxGainLoss.compareTo(BigDecimal.ZERO) > 0 ? fxGainLoss : null)
                                .build();

                entry.getJournalEntryLines().add(line);
                journalRepository.save(entry);
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

    /**
     * Get AP aging report in reporting currency
     */
    public ApAgingMultiCurrencyDto getMultiCurrencyApAging(String reportingCurrency, LocalDate asOfDate) {
        log.info("Generating multi-currency AP aging report");
        
        // Get all outstanding invoices
        // TODO: Implement multi-currency aging aggregation
        
        return ApAgingMultiCurrencyDto.builder()
                .reportingCurrency(reportingCurrency)
                .asOfDate(asOfDate)
                .build();
    }
}
