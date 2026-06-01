package com.everx.finance.service;

import com.everx.finance.ap.repository.VendorInvoiceRepository;
import com.everx.finance.ar.repository.CustomerInvoiceRepository;
import com.everx.finance.journal.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class FinanceReportService {
    private final JournalEntryRepository journalRepository;
    private final VendorInvoiceRepository vendorInvoiceRepository;
    private final CustomerInvoiceRepository customerInvoiceRepository;

    /**
     * Generate trial balance report
     */
    public Map<String, Object> generateTrialBalance(LocalDate asOfDate) {
        List<Object[]> trialBalance = journalRepository.getTrialBalance(asOfDate);
        
        Map<String, Object> report = new HashMap<>();
        report.put("reportDate", asOfDate);
        report.put("reportType", "TRIAL_BALANCE");
        report.put("data", trialBalance);
        
        // Calculate totals
        double totalDebits = 0;
        double totalCredits = 0;
        for (Object[] row : trialBalance) {
            totalDebits += ((Number) row[2]).doubleValue();
            totalCredits += ((Number) row[3]).doubleValue();
        }
        
        report.put("totalDebits", totalDebits);
        report.put("totalCredits", totalCredits);
        report.put("isBalanced", Math.abs(totalDebits - totalCredits) < 0.01);
        
        return report;
    }

    /**
     * Generate AP aging report
     */
    public Map<String, Object> generateApAging() {
        List<Object[]> agingData = vendorInvoiceRepository.getApAging();
        
        Map<String, Object> report = new HashMap<>();
        report.put("reportDate", LocalDate.now());
        report.put("reportType", "AP_AGING");
        report.put("data", agingData);
        
        return report;
    }

    /**
     * Generate AR aging report
     */
    public Map<String, Object> generateArAging() {
        List<Object[]> agingData = customerInvoiceRepository.getArAging();
        
        Map<String, Object> report = new HashMap<>();
        report.put("reportDate", LocalDate.now());
        report.put("reportType", "AR_AGING");
        report.put("data", agingData);
        
        return report;
    }

    /**
     * Generate cash flow report
     */
    public Map<String, Object> generateCashFlow(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportPeriod", "FROM_" + startDate + "_TO_" + endDate);
        report.put("reportType", "CASH_FLOW");
        
        // Get AP and AR data for period
        List<Object[]> apPayments = vendorInvoiceRepository.getPaymentSchedule(startDate, endDate);
        List<Object[]> arReceipts = customerInvoiceRepository.getPaymentSchedule(startDate, endDate);
        
        report.put("apPayments", apPayments);
        report.put("arReceipts", arReceipts);
        
        return report;
    }
}
