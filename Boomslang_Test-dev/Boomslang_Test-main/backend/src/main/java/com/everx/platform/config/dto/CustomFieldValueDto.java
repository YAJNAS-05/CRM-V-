package com.everx.platform.config.dto;

import com.everx.platform.config.entity.CustomFieldValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomFieldValueDto {

    private UUID id;
    private UUID definitionId;
    private String fieldKey;
    private String value;

    public static CustomFieldValueDto fromEntity(CustomFieldValue value) {
        return CustomFieldValueDto.builder()
                .id(value.getId())
                .definitionId(value.getDefinition().getId())
                .fieldKey(value.getDefinition().getFieldKey())
                .value(value.getValue())
                .build();
    }
}
