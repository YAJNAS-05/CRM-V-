package com.everx.finance.aging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArAgingDetailDto {
    private UUID invoiceId;
    private String invoiceNumber;
    private LocalDateTime invoiceDate;
    private LocalDateTime dueDate;
    private BigDecimal invoiceAmount;
    private BigDecimal openAmount;
    private String currency;
    private String agingBucket;
    private Integer daysOverdue;
}
