package com.everx.finance.consolidation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for intercompany transactions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntercompanyTransactionResponse {
    private UUID id;
    private String fromEntity;
    private String toEntity;
    private String sourceDocumentType;
    private String sourceDocumentId;
    private BigDecimal transactionAmount;
    private String currency;
    private LocalDate transactionDate;
    private String eliminationStatus;
    private String eliminatedBy;
    private LocalDateTime eliminatedAt;
    private String consolidationPeriod;
    private String eliminationNotes;
}
