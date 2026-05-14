package com.everx.hr.offer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfferLetterRequest {

    private UUID positionId;

    @NotBlank(message = "Candidate name is required")
    private String candidateName;

    @NotBlank(message = "Candidate email is required")
    @Email(message = "Email must be valid")
    private String candidateEmail;

    private LocalDate offerDate;
    private LocalDate expiryDate;
    private BigDecimal salary;
    private String currency;
    private UUID departmentId;
    private String notes;
}
