package com.everx.finance.aging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArAgingBucketDto {
    private String bucketName;
    private Integer fromDays;
    private Integer toDays;
    private BigDecimal totalAmount;
    private Integer invoiceCount;
}
