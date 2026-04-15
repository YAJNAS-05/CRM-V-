package com.everx.finance.consolidation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for recording intercompany transactions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordIntercompanyTransactionRequest {
    private String fromEntity;           // Source entity (AU01, US01, JP01)
    private String toEntity;             // Target entity (AU01, US01, JP01)
    private String sourceDocumentType;   // INVOICE, SO, PO, etc.
    private String sourceDocumentId;     // Document number to link back
    private BigDecimal transactionAmount; // Amount in currency
    private String currency;             // USD, AUD, JPY
    private LocalDate transactionDate;   // Date of transaction
    private String consolidationPeriod;  // yyyy-MM format
}
