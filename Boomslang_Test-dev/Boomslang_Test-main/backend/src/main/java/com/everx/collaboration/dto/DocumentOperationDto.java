package com.everx.collaboration.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentOperationDto {
    private String id;
    private String sessionId;
    private String userId;
    private String operationType;
    private String content;
    private int position;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata;
}
