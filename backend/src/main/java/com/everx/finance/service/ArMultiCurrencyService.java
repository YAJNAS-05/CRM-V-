package com.everx.finance.service;

import com.everx.finance.ar.entity.ArPayment;
import com.everx.finance.ar.entity.CustomerInvoice;
import com.everx.finance.ar.repository.ArPaymentRepository;
import com.everx.finance.ar.repository.CustomerInvoiceRepository;
import com.everx.finance.dto.ArAgingMultiCurrencyDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArMultiCurrencyService {
    private final CustomerInvoiceRepository invoiceRepository;
    private final ArPaymentRepository paymentRepository;
    private final ExchangeRateService exchangeRateService;

    /**
     * Record AR payment in foreign currency
     */
        public ArPayment recordMultiCurrencyReceipt(UUID invoiceId, BigDecimal paymentAmount,
                                                                                           String paymentCurrency, LocalDate paymentDate) {
        log.info("Recording multi-currency AR receipt: amount={}, currency={}", paymentAmount, paymentCurrency);
        
        CustomerInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        // Convert payment to invoice currency
        BigDecimal convertedAmount = exchangeRateService.convertCurrency(
                paymentCurrency,
                invoice.getCurrency(),
                paymentAmount,
                paymentDate
        );
        
        ArPayment payment = ArPayment.builder()
                .customerInvoice(invoice)
                .paymentAmount(convertedAmount)
                .paymentDate(paymentDate)
                .paymentMethod(ArPayment.PaymentMethod.BANK_TRANSFER)
                .currency(invoice.getCurrency())
                .exchangeRate(paymentAmount.compareTo(BigDecimal.ZERO) == 0
                        ? BigDecimal.ONE
                        : convertedAmount.divide(paymentAmount, 6, RoundingMode.HALF_UP))
                .amountInBaseCurrency(convertedAmount)
                .build();
        
        ArPayment savedPayment = paymentRepository.save(payment);
        
                invoice.getPayments().add(savedPayment);
                if (invoice.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        invoice.setStatus(CustomerInvoice.Status.PAID);
                } else {
                        invoice.setStatus(CustomerInvoice.Status.PARTIALLY_PAID);
                }
                invoiceRepository.save(invoice);
        
                log.info("Multi-currency receipt recorded for invoice: {}", invoice.getId());
        return savedPayment;
    }

    /**
     * Get AR aging report in reporting currency
     */
    public ArAgingMultiCurrencyDto getMultiCurrencyArAging(String reportingCurrency, LocalDate asOfDate) {
        log.info("Generating multi-currency AR aging report");
        
        // Get all outstanding invoices and convert to reporting currency
        // TODO: Implement multi-currency aging aggregation
        
        return ArAgingMultiCurrencyDto.builder()
                .reportingCurrency(reportingCurrency)
                .asOfDate(asOfDate)
                .build();
    }
}
