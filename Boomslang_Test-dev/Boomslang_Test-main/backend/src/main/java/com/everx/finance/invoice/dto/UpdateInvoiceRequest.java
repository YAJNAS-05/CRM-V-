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
public class UpdateInvoiceRequest {
    private LocalDateTime invoiceDate;
    private LocalDateTime dueDate;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private String currency;
    private String entity;
    private String description;
}
