package com.everx.finance.job;

import com.everx.finance.ar.entity.CustomerInvoice;
import com.everx.finance.ar.repository.CustomerInvoiceRepository;
import com.everx.finance.service.ArService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArReminderJob {
    private final ArService arService;
    private final CustomerInvoiceRepository invoiceRepository;

    /**
     * Send AR reminders for overdue invoices
     */
    @Scheduled(cron = "0 0 3 * * *") // 3 AM daily
    public void sendArReminders() {
        log.info("Starting AR reminder job");
        try {
            List<CustomerInvoice> overdueInvoices = arService.getAgingReport();
            
            for (CustomerInvoice invoice : overdueInvoices) {
                LocalDate dueDate = invoice.getDueDate();
                long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
                
                // Send reminder if 15 or more days overdue
                if (daysOverdue >= 15) {
                    // TODO: Send email/notification to customer
                        log.info("Sending AR reminder for invoice {} to customer {}", 
                            invoice.getInvoiceNumber(), invoice.getCustomerId());
                }
            }
            
            log.info("AR reminder job completed successfully");
        } catch (Exception e) {
            log.error("Error during AR reminder job", e);
        }
    }
}
