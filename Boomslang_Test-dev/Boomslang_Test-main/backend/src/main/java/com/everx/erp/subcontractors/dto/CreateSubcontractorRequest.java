package com.everx.erp.subcontractors.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubcontractorRequest {
    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    private String companyName;
    @Size(max = 255)
    private String contactName;
    @Size(max = 255)
    private String email;
    @Size(max = 20)
    private String phone;
    @Size(max = 100)
    private String country;
    private String[] coverageRegions;
    private String[] specialisations;
    private BigDecimal hourlyRate;
    @Size(max = 3)
    private String currency;
    private String notes;
}
