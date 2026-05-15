package com.everx.finance.invoice;

import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.workflow.SalesOrderInvoiceGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Finance-side implementation of ERP invoice workflow boundary.
 */
@Component
@RequiredArgsConstructor
public class FinanceSalesOrderInvoiceGateway implements SalesOrderInvoiceGateway {

    private final InvoiceRepository invoiceRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Override
    public void createFinalInvoiceForSalesOrder(SalesOrder so, String invoiceType) {
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .soId(so.getId())
                .accountId(so.getAccountId())
                .entity(Invoice.InvoiceEntity.AUSTRALIA)
                .type(Invoice.InvoiceType.valueOf(invoiceType))
                .status(Invoice.InvoiceStatus.SENT)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .currency(so.getCurrency())
                .subtotal(so.getTotalAmount())
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(so.getTotalAmount())
                .paidAmount(BigDecimal.ZERO)
                .notes("Auto-generated " + invoiceType + " from Sales Order " + so.getSoNumber())
                .build();

        invoice.setCreatedAt(OffsetDateTime.now());
        invoice.setUpdatedAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);
    }

    private String generateInvoiceNumber() {
        return documentNumberGenerator.generate(
            "INV-SO",
            candidate -> invoiceRepository.findByInvoiceNumberAndIsDeletedFalse(candidate).isPresent()
        );
    }
}
