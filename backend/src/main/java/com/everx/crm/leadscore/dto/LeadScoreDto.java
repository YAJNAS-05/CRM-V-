package com.everx.crm.leadscore.dto;

import com.everx.crm.leadscore.LeadScore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadScoreDto {

    private UUID id;
    private UUID leadId;
    private String scoreType;
    private Integer points;
    private OffsetDateTime createdAt;

    public static LeadScoreDto fromEntity(LeadScore score) {
        return LeadScoreDto.builder()
                .id(score.getId())
                .leadId(score.getLeadId())
                .scoreType(score.getScoreType())
                .points(score.getPoints())
                .createdAt(score.getCreatedAt())
                .build();
    }
}
