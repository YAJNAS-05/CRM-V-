package com.everx.erp.suppliers.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private UUID id;
    private String supplierNumber;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private Boolean isActive;
}
