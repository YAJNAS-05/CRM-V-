package com.everx.crm.deal.dto;

import com.everx.crm.deal.DealStage;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDealStageRequest {

    @NotNull(message = "Stage is required")
    private DealStage stage;
}
