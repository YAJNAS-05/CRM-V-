package com.everx.finance.invoice.dto;

import com.everx.finance.invoice.Invoice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {
    private String invoiceNumber;
    private UUID soId;
    private UUID accountId;
    private Invoice.InvoiceEntity entity;
    private Invoice.InvoiceType type;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String notes;
}
