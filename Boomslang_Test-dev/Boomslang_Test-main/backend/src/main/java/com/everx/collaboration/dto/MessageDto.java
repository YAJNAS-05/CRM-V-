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
public class MessageDto {
    private String id;
    private String sessionId;
    private String senderId;
    private String content;
    private String type;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata;
}
