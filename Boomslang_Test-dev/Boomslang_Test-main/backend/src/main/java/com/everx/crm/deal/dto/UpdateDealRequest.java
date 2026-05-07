package com.everx.crm.deal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDealRequest {

    private String name;
    private String stage;
    private BigDecimal amount;
    private Integer probability;
    private LocalDate expectedCloseDate;
    private LocalDate actualCloseDate;
    private String leadSource;
    private UUID accountId;
    private UUID primaryContactId;
    private String description;
    private String lossReason;
    private String nextStep;
    private String campaignSource;
    private UUID ownerId;
}
