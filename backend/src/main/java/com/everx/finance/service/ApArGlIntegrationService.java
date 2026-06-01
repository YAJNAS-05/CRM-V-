package com.everx.finance.service;

import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.service.GlAccountService;
import com.everx.finance.ap.entity.ApPayment;
import com.everx.finance.ap.entity.VendorInvoice;
import com.everx.finance.ap.repository.ApPaymentRepository;
import com.everx.finance.ap.repository.VendorInvoiceRepository;
import com.everx.finance.ar.entity.ArPayment;
import com.everx.finance.ar.entity.CustomerInvoice;
import com.everx.finance.ar.repository.ArPaymentRepository;
import com.everx.finance.ar.repository.CustomerInvoiceRepository;
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
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApArGlIntegrationService {
    private final JournalEntryRepository journalRepository;
    private final JournalEntryLineRepository lineRepository;
        private final PostingPeriodRepository postingPeriodRepository;
    private final GlAccountService accountService;
    private final ApPaymentRepository apPaymentRepository;
        private final VendorInvoiceRepository vendorInvoiceRepository;
    private final ArPaymentRepository arPaymentRepository;
        private final CustomerInvoiceRepository customerInvoiceRepository;

    /**
     * Post AP invoice to GL (Debit Expense, Credit Payable)
     */
    public void postApInvoiceToGl(UUID vendorInvoiceId) {
        log.info("Posting AP invoice {} to GL", vendorInvoiceId);

        VendorInvoice invoice = vendorInvoiceRepository.findById(vendorInvoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        // Get AP account and GL accounts
        GlAccount expenseAccount = accountService.getAccountByCode("6000"); // Expense account
        GlAccount apAccount = accountService.getAccountByCode("2100"); // AP Liability account
        PostingPeriod period = resolvePostingPeriod(expenseAccount.getCompanyId(), LocalDate.now());
        
        // Create journal entry
        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(LocalDate.now())
                .postingDate(LocalDate.now())
                .postingPeriod(period)
                .companyId(expenseAccount.getCompanyId())
                .description("AP Invoice Auto-Post")
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        // Debit Expense
        JournalEntryLine debitLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(expenseAccount)
                .debitAmount(invoice.getNetAmount())
                .build();
        
        // Credit Payable
        JournalEntryLine creditLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(apAccount)
                .creditAmount(invoice.getNetAmount())
                .build();
        
        entry.getJournalEntryLines().add(debitLine);
        entry.getJournalEntryLines().add(creditLine);
        
        journalRepository.save(entry);
        log.info("AP invoice posted to GL successfully");
    }

    /**
     * Post AR invoice to GL (Debit Receivable, Credit Revenue)
     */
    public void postArInvoiceToGl(UUID customerInvoiceId) {
        log.info("Posting AR invoice {} to GL", customerInvoiceId);

        CustomerInvoice invoice = customerInvoiceRepository.findById(customerInvoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        // Get AR account and GL accounts
        GlAccount receivableAccount = accountService.getAccountByCode("1200"); // AR Asset account
        GlAccount revenueAccount = accountService.getAccountByCode("4100"); // Revenue account
        PostingPeriod period = resolvePostingPeriod(receivableAccount.getCompanyId(), LocalDate.now());
        
        // Create journal entry
        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(LocalDate.now())
                .postingDate(LocalDate.now())
                .postingPeriod(period)
                .companyId(receivableAccount.getCompanyId())
                .description("AR Invoice Auto-Post")
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        // Debit Receivable
        JournalEntryLine debitLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(receivableAccount)
                .debitAmount(invoice.getNetAmount())
                .build();
        
        // Credit Revenue
        JournalEntryLine creditLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(revenueAccount)
                .creditAmount(invoice.getNetAmount())
                .build();
        
        entry.getJournalEntryLines().add(debitLine);
        entry.getJournalEntryLines().add(creditLine);
        
        journalRepository.save(entry);
        log.info("AR invoice posted to GL successfully");
    }

    /**
     * Post AP payment to GL (Debit Payable, Credit Bank)
     */
    public void postApPaymentToGl(UUID paymentId) {
        log.info("Posting AP payment {} to GL", paymentId);
        
        ApPayment payment = apPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        GlAccount apAccount = accountService.getAccountByCode("2100");
        GlAccount bankAccount = accountService.getAccountByCode("1010");
        PostingPeriod period = resolvePostingPeriod(apAccount.getCompanyId(), payment.getPaymentDate());
        
        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(payment.getPaymentDate())
                .postingDate(payment.getPaymentDate())
                .postingPeriod(period)
                .companyId(apAccount.getCompanyId())
                .description("AP Payment Auto-Post")
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        JournalEntryLine debitLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(apAccount)
                .debitAmount(payment.getPaymentAmount())
                .build();
        
        JournalEntryLine creditLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(bankAccount)
                .creditAmount(payment.getPaymentAmount())
                .build();
        
        entry.getJournalEntryLines().add(debitLine);
        entry.getJournalEntryLines().add(creditLine);
        
        journalRepository.save(entry);
        log.info("AP payment posted to GL successfully");
    }

    /**
     * Post AR receipt to GL (Debit Bank, Credit Receivable)
     */
    public void postArReceiptToGl(UUID receiptId) {
        log.info("Posting AR receipt {} to GL", receiptId);
        
        ArPayment receipt = arPaymentRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));
        
        GlAccount receivableAccount = accountService.getAccountByCode("1200");
        GlAccount bankAccount = accountService.getAccountByCode("1010");
        PostingPeriod period = resolvePostingPeriod(receivableAccount.getCompanyId(), receipt.getPaymentDate());
        
        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + UUID.randomUUID())
                .entryDate(receipt.getPaymentDate())
                .postingDate(receipt.getPaymentDate())
                .postingPeriod(period)
                .companyId(receivableAccount.getCompanyId())
                .description("AR Receipt Auto-Post")
                .status(JournalEntry.Status.DRAFT)
                .build();
        
        JournalEntryLine debitLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(bankAccount)
                .debitAmount(receipt.getPaymentAmount())
                .build();
        
        JournalEntryLine creditLine = JournalEntryLine.builder()
                .journalEntry(entry)
                .glAccount(receivableAccount)
                .creditAmount(receipt.getPaymentAmount())
                .build();
        
        entry.getJournalEntryLines().add(debitLine);
        entry.getJournalEntryLines().add(creditLine);
        
        journalRepository.save(entry);
        log.info("AR receipt posted to GL successfully");
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
