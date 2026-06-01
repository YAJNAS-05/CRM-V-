package com.everx.finance.job;

import com.everx.finance.ap.entity.VendorInvoice;
import com.everx.finance.ap.repository.VendorInvoiceRepository;
import com.everx.finance.service.ApService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApAgingJob {
    private final ApService apService;
    private final VendorInvoiceRepository invoiceRepository;

    /**
     * Run daily AP aging calculation
     */
    @Scheduled(cron = "0 0 2 * * *") // 2 AM daily
    public void calculateApAging() {
        log.info("Starting AP aging calculation job");
        try {
            List<VendorInvoice> overdueInvoices = apService.getAgingReport();
            log.info("Found {} overdue invoices", overdueInvoices.size());
            
            for (VendorInvoice invoice : overdueInvoices) {
                LocalDate dueDate = invoice.getDueDate();
                long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
                
                // Apply late fees if more than 30 days overdue
                if (daysOverdue > 30) {
                    BigDecimal lateFee = invoice.getNetAmount().multiply(BigDecimal.valueOf(0.01)); // 1% late fee
                    invoice.setLateFeeApplicable(true);
                    invoice.setLateFeeAmount(invoice.getLateFeeAmount().add(lateFee));
                    invoice.setNetAmount(invoice.getNetAmount().add(lateFee));
                    invoiceRepository.save(invoice);
                    log.info("Applied late fee to invoice {}", invoice.getInvoiceNumber());
                }
            }
            
            log.info("AP aging calculation job completed successfully");
        } catch (Exception e) {
            log.error("Error during AP aging calculation", e);
        }
    }
}
