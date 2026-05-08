package com.everx.erp.purchaseorder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private UUID id;
    private String poNumber;
    private UUID vendorId;
    private String vendorName;
    private String companyCode;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
}
