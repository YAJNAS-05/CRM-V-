package com.everx.erp.suppliers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierRequest {
    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    private String companyName;
    @Size(max = 100)
    private String country;
    @Size(max = 255)
    private String contactName;
    @Size(max = 255)
    private String email;
    @Size(max = 20)
    private String phone;
    @Size(max = 50)
    private String supplierType;
    private String paymentTerms;
    private String notes;
}
