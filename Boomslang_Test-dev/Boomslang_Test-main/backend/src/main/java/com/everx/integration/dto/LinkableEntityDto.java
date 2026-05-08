package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkableEntityDto {
    private String module;
    private String entityType;
    private String displayName;
    private String icon;
    private int count;
    private List<EntityLinkDto> links;
}
