package com.everx.crm.leadscore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordLeadScoreRequest {

    @NotBlank(message = "Activity type is required")
    private String activityType;
}
