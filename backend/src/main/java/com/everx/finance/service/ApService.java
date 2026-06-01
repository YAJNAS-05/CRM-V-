package com.everx.finance.service;

import com.everx.finance.ap.entity.ApPayment;
import com.everx.finance.ap.entity.VendorInvoice;
import com.everx.finance.ap.repository.ApPaymentRepository;
import com.everx.finance.ap.repository.VendorInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApService {
    private final VendorInvoiceRepository invoiceRepository;
    private final ApPaymentRepository paymentRepository;

    /**
     * Record vendor invoice
     */
    public VendorInvoice recordInvoice(VendorInvoice invoice) {
        if (invoice.getInvoiceDate() == null) {
            invoice.setInvoiceDate(LocalDate.now());
        }
        invoice.setStatus(VendorInvoice.Status.RECEIVED);
        return invoiceRepository.save(invoice);
    }

    /**
     * Record payment against invoice
     */
    public ApPayment recordPayment(UUID invoiceId, BigDecimal amount) {
        VendorInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        ApPayment payment = ApPayment.builder()
                .vendorInvoice(invoice)
                .paymentAmount(amount)
                .paymentDate(LocalDate.now())
                .paymentMethod(ApPayment.PaymentMethod.BANK_TRANSFER)
                .currency(invoice.getCurrency())
                .amountInBaseCurrency(amount)
                .build();
        
        ApPayment savedPayment = paymentRepository.save(payment);
        invoice.getPayments().add(savedPayment);

        if (invoice.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(VendorInvoice.Status.PAID);
        } else {
            invoice.setStatus(VendorInvoice.Status.PARTIALLY_PAID);
        }

        invoiceRepository.save(invoice);
        return savedPayment;
    }

    /**
     * Get aging report (invoices past due)
     */
    public List<VendorInvoice> getAgingReport() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now());
    }

    /**
     * Get invoices by vendor
     */
    public List<VendorInvoice> getVendorInvoices(UUID vendorId) {
        return invoiceRepository.findByVendorIdAndIsDeletedFalse(vendorId);
    }

    /**
     * Calculate payment schedule
     */
    public List<Object[]> getPaymentSchedule(LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.getPaymentSchedule(startDate, endDate);
    }
}
