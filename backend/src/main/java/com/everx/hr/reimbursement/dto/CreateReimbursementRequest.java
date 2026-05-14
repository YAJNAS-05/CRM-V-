package com.everx.hr.reimbursement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReimbursementRequest {
    @NotNull(message = "Requester ID is required")
    private UUID requestedBy;

    private String requesterEmail;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String currency;

    @NotNull(message = "Category is required")
    private String category;

    @NotNull(message = "Request date is required")
    private LocalDate requestDate;

    private String description;
}
