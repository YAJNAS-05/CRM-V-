package com.everx.hr.offer.dto;

import com.everx.hr.offer.OfferLetterStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferLetterDto {
    private UUID id;
    private UUID positionId;
    private String candidateName;
    private String candidateEmail;
    private LocalDate offerDate;
    private LocalDate expiryDate;
    private BigDecimal salary;
    private String currency;
    private UUID departmentId;
    private String notes;
    private OfferLetterStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
