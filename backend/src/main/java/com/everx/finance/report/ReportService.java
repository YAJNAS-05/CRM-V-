package com.everx.finance.report;

import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.finance.journal.GlJournalEntryRepository;
import com.everx.finance.payment.Payment;
import com.everx.finance.payment.PaymentRepository;
import com.everx.finance.report.dto.ArAgingResponse;
import com.everx.finance.report.dto.CashFlowResponse;
import com.everx.finance.report.dto.PnLReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final GlJournalEntryRepository glJournalEntryRepository;

    @Transactional(readOnly = true)
    public PnLReportResponse getPnLReport(Invoice.InvoiceEntity entity, LocalDate startDate, LocalDate endDate) {
        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(i -> !i.getIsDeleted() 
                        && (entity == null || i.getEntity() == entity)
                        && i.getIssueDate().isAfter(startDate.minusDays(1)) 
                        && i.getIssueDate().isBefore(endDate.plusDays(1)))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Real cost: sum GL debit entries on account 5000 (COGS/Expense) for the period.
        // Falls back to zero when no AP accrual entries have been posted yet.
        BigDecimal totalCost;
        if (entity != null) {
            totalCost = glJournalEntryRepository
                    .sumDebitsByAccountEntityAndPeriod("5000", entity.name(), startDate, endDate);
        } else {
            totalCost = glJournalEntryRepository
                    .sumDebitsByAccountAndPeriod("5000", startDate, endDate);
        }

        BigDecimal grossProfit = totalRevenue.subtract(totalCost);

        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        // Group by invoice type for breakdown
        invoices.forEach(i -> {
            String type = i.getType().name();
            revenueByCategory.merge(type, i.getTotalAmount(), BigDecimal::add);
        });

        return PnLReportResponse.builder()
                .entity(entity != null ? entity.name() : "ALL")
                .period(startDate + " to " + endDate)
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .grossProfit(grossProfit)
                .netProfit(grossProfit)
                .revenueByCategory(revenueByCategory)
                .build();
    }

    @Transactional(readOnly = true)
    public ArAgingResponse getArAging() {
        List<Invoice> unpaidInvoices = invoiceRepository.findAll().stream()
                .filter(i -> !i.getIsDeleted() 
                        && i.getStatus() != Invoice.InvoiceStatus.PAID 
                        && i.getStatus() != Invoice.InvoiceStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal totalOutstanding = unpaidInvoices.stream()
                .map(i -> i.getTotalAmount().subtract(i.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> agingBuckets = new TreeMap<>();
        agingBuckets.put("0-30", BigDecimal.ZERO);
        agingBuckets.put("31-60", BigDecimal.ZERO);
        agingBuckets.put("61-90", BigDecimal.ZERO);
        agingBuckets.put("90+", BigDecimal.ZERO);

        Map<String, Integer> countBuckets = new TreeMap<>();
        countBuckets.put("0-30", 0);
        countBuckets.put("31-60", 0);
        countBuckets.put("61-90", 0);
        countBuckets.put("90+", 0);

        LocalDate today = LocalDate.now();
        int overdueCount = 0;

        for (Invoice i : unpaidInvoices) {
            long days = ChronoUnit.DAYS.between(i.getDueDate(), today);
            BigDecimal balanced = i.getTotalAmount().subtract(i.getPaidAmount());
            
            String bucket;
            if (days <= 0) bucket = "0-30"; // Not yet overdue or just overdue
            else if (days <= 30) bucket = "0-30";
            else if (days <= 60) bucket = "31-60";
            else if (days <= 90) bucket = "61-90";
            else bucket = "90+";

            if (days > 0) overdueCount++;

            agingBuckets.merge(bucket, balanced, BigDecimal::add);
            countBuckets.put(bucket, countBuckets.getOrDefault(bucket, 0) + 1);
        }

        return ArAgingResponse.builder()
                .totalOutstanding(totalOutstanding)
                .totalOverdueCount(overdueCount)
                .agingBuckets(agingBuckets)
                .countBuckets(countBuckets)
                .build();
    }

    @Transactional(readOnly = true)
    public CashFlowResponse getCashFlow(LocalDate startDate, LocalDate endDate) {
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> !p.getIsDeleted() 
                        && p.getPaymentDate().isAfter(startDate.minusDays(1)) 
                        && p.getPaymentDate().isBefore(endDate.plusDays(1)))
                .collect(Collectors.toList());

        BigDecimal totalInflow = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Map entries by date
        Map<LocalDate, CashFlowResponse.CashFlowEntry> entriesMap = new TreeMap<>();
        payments.forEach(p -> {
            CashFlowResponse.CashFlowEntry entry = entriesMap.computeIfAbsent(p.getPaymentDate(), 
                date -> CashFlowResponse.CashFlowEntry.builder()
                    .date(date)
                    .inflow(BigDecimal.ZERO)
                    .outflow(BigDecimal.ZERO)
                    .balance(BigDecimal.ZERO)
                    .build());
            entry.setInflow(entry.getInflow().add(p.getAmount()));
        });

        List<CashFlowResponse.CashFlowEntry> entries = entriesMap.values().stream().collect(Collectors.toList());
        
        // Calculate cumulative balance
        BigDecimal currentBalance = BigDecimal.ZERO;
        for (CashFlowResponse.CashFlowEntry entry : entries) {
            currentBalance = currentBalance.add(entry.getInflow()).subtract(entry.getOutflow());
            entry.setBalance(currentBalance);
        }

        // Outflow = GL credits on account 1000 (cash paid to suppliers: DR AP / CR Cash).
        // Returns 0 until AP payment entries exist; never negative.
        BigDecimal totalOutflow = glJournalEntryRepository
                .sumCreditsByAccountAndPeriod("1000", startDate, endDate)
                .max(BigDecimal.ZERO);
        BigDecimal netCashFlow = totalInflow.subtract(totalOutflow);

        return CashFlowResponse.builder()
                .totalInflow(totalInflow)
                .totalOutflow(totalOutflow)
                .netCashFlow(netCashFlow)
                .entries(entries)
                .build();
    }
}
