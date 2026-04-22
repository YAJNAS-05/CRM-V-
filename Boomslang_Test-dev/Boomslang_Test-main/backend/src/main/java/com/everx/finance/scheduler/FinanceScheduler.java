package com.everx.finance.scheduler;

import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.shared.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FinanceScheduler {

    private final InvoiceRepository invoiceRepository;
    private final MailService mailService;

    @Value("${everx.mail.finance-team:finance@everx.com}")
    private String financeTeamEmail;

    /**
     * Every Monday at 9 AM: Check for overdue invoices and alert finance team.
     */
    @Scheduled(cron = "0 0 9 * * MON")
    @SchedulerLock(name = "alertOverdueInvoices", lockAtMostFor = "30m", lockAtLeastFor = "2m")
    public void alertOverdueInvoices() {
        log.info("Running scheduled job: alertOverdueInvoices");
        List<Invoice> overdueInvoices = invoiceRepository.findOverdueInvoices(LocalDate.now());

        if (overdueInvoices.isEmpty()) {
            log.info("No overdue invoices found.");
            return;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("The following invoices are OVERDUE as of ").append(LocalDate.now()).append(":\n\n");
        
        for (Invoice invoice : overdueInvoices) {
            sb.append("- ").append(invoice.getInvoiceNumber())
              .append(" | Due: ").append(invoice.getDueDate())
              .append(" | Amount: ").append(invoice.getTotalAmount())
              .append(" ").append(invoice.getCurrency())
              .append("\n");
        }

        mailService.sendSimpleMessage(
            financeTeamEmail, 
            "Weekly Alert: Overdue Invoices (" + overdueInvoices.size() + ")", 
            sb.toString()
        );
    }
}
