package com.everx.platform.config.dto;

import com.everx.platform.config.entity.OptionValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionValueDto {

    private UUID id;
    private String value;
    private String label;
    private String colorCode;
    private Integer sortOrder;
    private String description;
    private Boolean isActive;
    private Boolean isDefault;

    public static OptionValueDto fromEntity(OptionValue value) {
        return OptionValueDto.builder()
                .id(value.getId())
                .value(value.getValue())
                .label(value.getLabel())
                .colorCode(value.getColorCode())
                .sortOrder(value.getSortOrder())
                .description(value.getDescription())
                .isActive(value.getIsActive())
                .isDefault(value.getIsDefault())
                .build();
    }
}
