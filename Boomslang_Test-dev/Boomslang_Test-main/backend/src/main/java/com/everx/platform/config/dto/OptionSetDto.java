package com.everx.platform.config.dto;

import com.everx.platform.config.entity.OptionSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionSetDto {

    private UUID id;
    private String module;
    private String entity;
    private String fieldName;
    private String name;
    private String description;
    private Boolean isActive;
    private Boolean isSystem;
    private List<OptionValueDto> values;

    public static OptionSetDto fromEntity(OptionSet optionSet, List<OptionValueDto> values) {
        return OptionSetDto.builder()
                .id(optionSet.getId())
                .module(optionSet.getModule())
                .entity(optionSet.getEntity())
                .fieldName(optionSet.getFieldName())
                .name(optionSet.getName())
                .description(optionSet.getDescription())
                .isActive(optionSet.getIsActive())
                .isSystem(optionSet.getIsSystem())
                .values(values)
                .build();
    }
}
