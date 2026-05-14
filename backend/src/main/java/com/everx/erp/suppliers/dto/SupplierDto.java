package com.everx.erp.suppliers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private UUID id;
    private String companyName;
    private String country;
    private String contactName;
    private String email;
    private String phone;
    private String supplierType;
    private String paymentTerms;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
