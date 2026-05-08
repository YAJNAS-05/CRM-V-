package com.everx.hr.reimbursement.dto;

import com.everx.hr.ReimbursementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReimbursementRequestDto {
    private UUID id;
    private UUID requestedBy;
    private String requesterEmail;
    private BigDecimal amount;
    private String currency;
    private String category;
    private LocalDate requestDate;
    private String description;
    private ReimbursementStatus status;
    private UUID approvedBy;
    private OffsetDateTime approvedAt;
    private UUID paidBy;
    private OffsetDateTime paidAt;
    private String paymentReference;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
