package com.everx.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private UUID id;
    private String type;
    private String title;
    private String content;
    private String priority;
    private UUID recipientId;
    private UUID senderId;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata;
    private String status;
    private String category;
}
