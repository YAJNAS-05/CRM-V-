package com.everx.crm.deal.dto;

import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealDto {

    private UUID id;
    private String name;
    private DealStage stage;
    private BigDecimal amount;
    private Integer probability;
    private Integer daysInStage;
    private Integer daysInPipeline;
    private BigDecimal expectedRevenueWeighted;
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
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static DealDto fromEntity(Deal deal) {
        return DealDto.builder()
                .id(deal.getId())
                .name(deal.getName())
                .stage(deal.getStage())
                .amount(deal.getAmount())
                .probability(deal.getProbability())
                .daysInStage(deal.getDaysInStage())
                .daysInPipeline(deal.getDaysInPipeline())
                .expectedRevenueWeighted(deal.getExpectedRevenueWeighted())
                .expectedCloseDate(deal.getExpectedCloseDate())
                .actualCloseDate(deal.getActualCloseDate())
                .leadSource(deal.getLeadSource())
                .accountId(deal.getAccountId())
                .primaryContactId(deal.getPrimaryContactId())
                .description(deal.getDescription())
                .lossReason(deal.getLossReason())
                .nextStep(deal.getNextStep())
                .campaignSource(deal.getCampaignSource())
                .ownerId(deal.getOwnerId())
                .createdAt(deal.getCreatedAt())
                .updatedAt(deal.getUpdatedAt())
                .build();
    }
}
