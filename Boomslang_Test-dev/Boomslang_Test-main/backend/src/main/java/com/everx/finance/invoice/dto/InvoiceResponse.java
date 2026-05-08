package com.everx.finance.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private UUID customerId;
    private String customerName;
    private String companyCode;
    private LocalDateTime invoiceDate;
    private LocalDateTime dueDate;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal openAmount;
    private String currency;
    private String status;
    private String entity;
}
