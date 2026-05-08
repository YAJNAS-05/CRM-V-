package com.everx.finance.close.dto;

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
public class ThreeWayMatchExceptionDto {
    private UUID id;
    private UUID purchaseOrderId;
    private String poNumber;
    private UUID invoiceId;
    private String invoiceNumber;
    private UUID receiptId;
    private String receiptNumber;
    private String companyCode;
    private String exceptionType;
    private BigDecimal varianceAmount;
    private BigDecimal variancePercentage;
    private String status;
    private LocalDate createdAt;
}
