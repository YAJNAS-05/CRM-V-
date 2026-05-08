package com.everx.finance.aging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArAgingReportDto {
    private String companyCode;
    private String companyName;
    private List<ArAgingBucketDto> buckets;
    private BigDecimal totalOutstanding;
    private Integer totalInvoices;
}
