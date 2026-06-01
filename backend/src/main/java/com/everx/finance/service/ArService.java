package com.everx.finance.service;

import com.everx.finance.ar.entity.ArCreditLimit;
import com.everx.finance.ar.entity.ArPayment;
import com.everx.finance.ar.entity.CustomerInvoice;
import com.everx.finance.ar.repository.ArCreditLimitRepository;
import com.everx.finance.ar.repository.ArPaymentRepository;
import com.everx.finance.ar.repository.CustomerInvoiceRepository;
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
public class ArService {
    private final CustomerInvoiceRepository invoiceRepository;
    private final ArPaymentRepository paymentRepository;
    private final ArCreditLimitRepository creditLimitRepository;

    /**
     * Create customer invoice
     */
    public CustomerInvoice createInvoice(CustomerInvoice invoice) {
        // Check credit limit
        ArCreditLimit limit = creditLimitRepository.findByCustomerIdAndIsDeletedFalse(invoice.getCustomerId())
                .orElseThrow(() -> new RuntimeException("No credit limit set for customer"));

        BigDecimal availableCredit = limit.getAvailableCredit() != null
                ? limit.getAvailableCredit()
                : limit.getCreditLimit();

        if (invoice.getNetAmount().compareTo(availableCredit) > 0) {
            throw new RuntimeException("Credit limit exceeded");
        }

        if (invoice.getInvoiceDate() == null) {
            invoice.setInvoiceDate(LocalDate.now());
        }
        invoice.setStatus(CustomerInvoice.Status.SENT);
        return invoiceRepository.save(invoice);
    }

    /**
     * Record payment against invoice
     */
    public ArPayment recordPayment(UUID invoiceId, BigDecimal amount) {
        CustomerInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        ArPayment payment = ArPayment.builder()
                .customerInvoice(invoice)
                .paymentAmount(amount)
                .paymentDate(LocalDate.now())
                .paymentMethod(ArPayment.PaymentMethod.BANK_TRANSFER)
                .currency(invoice.getCurrency())
                .amountInBaseCurrency(amount)
                .build();
        
        ArPayment savedPayment = paymentRepository.save(payment);
        invoice.getPayments().add(savedPayment);

        if (invoice.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(CustomerInvoice.Status.PAID);
        } else {
            invoice.setStatus(CustomerInvoice.Status.PARTIALLY_PAID);
        }

        invoiceRepository.save(invoice);
        return savedPayment;
    }

    /**
     * Get aging report (invoices past due)
     */
    public List<CustomerInvoice> getAgingReport() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now());
    }

    /**
     * Get customer invoices
     */
    public List<CustomerInvoice> getCustomerInvoices(UUID customerId) {
        return invoiceRepository.findByCustomerIdAndIsDeletedFalse(customerId);
    }

    /**
     * Update credit limit
     */
    public ArCreditLimit updateCreditLimit(UUID customerId, BigDecimal newLimit) {
        ArCreditLimit limit = creditLimitRepository.findByCustomerIdAndIsDeletedFalse(customerId)
                .orElseThrow(() -> new RuntimeException("Credit limit not found"));
        limit.setCreditLimit(newLimit);
        limit.setAvailableCredit(newLimit);
        return creditLimitRepository.save(limit);
    }
}
