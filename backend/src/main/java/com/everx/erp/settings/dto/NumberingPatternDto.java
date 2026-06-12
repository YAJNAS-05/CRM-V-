package com.everx.erp.settings.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NumberingPatternDto {
    private Long id;

    @JsonProperty("documentType")
    private String documentType;

    @JsonProperty("prefix")
    private String prefix;

    @JsonProperty("pattern")
    private String pattern;

    @JsonProperty("sequenceWidth")
    private Integer sequenceWidth;

    @JsonProperty("nextSequence")
    private Long nextSequence;

    @JsonProperty("description")
    private String description;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("example")
    private String example; // Generated example of what the next number will look like
}
