package com.everx.hr.reimbursement.dto;

import com.everx.hr.ReimbursementStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReimbursementRequest {
    private BigDecimal amount;
    private String currency;
    private String category;
    private LocalDate requestDate;
    private String description;
    private ReimbursementStatus status;
    private String notes;
}
