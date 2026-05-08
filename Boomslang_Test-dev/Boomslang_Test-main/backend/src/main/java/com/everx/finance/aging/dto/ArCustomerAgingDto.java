package com.everx.finance.aging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArCustomerAgingDto {
    private UUID customerId;
    private String customerName;
    private BigDecimal totalOpenAmount;
    private List<ArAgingDetailDto> details;
}
