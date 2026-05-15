package com.everx.erp.subcontractors.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcontractorDto {
    private UUID id;
    private String companyName;
    private String contactName;
    private String email;
    private String phone;
    private String country;
    private String[] coverageRegions;
    private String[] specialisations;
    private BigDecimal hourlyRate;
    private String currency;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
