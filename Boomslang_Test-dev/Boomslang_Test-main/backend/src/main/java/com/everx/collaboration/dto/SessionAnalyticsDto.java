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
public class SessionAnalyticsDto {
    private String sessionId;
    private int activeUsers;
    private int totalMessages;
    private int totalOperations;
    private LocalDateTime sessionStart;
    private LocalDateTime lastActivity;
    private Map<String, Object> analytics;
}
