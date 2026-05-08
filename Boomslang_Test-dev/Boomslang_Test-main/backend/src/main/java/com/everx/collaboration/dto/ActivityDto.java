package com.everx.collaboration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private UUID id;
    private UUID sessionId;
    private UUID userId;
    private String type;
    private String data;
    private LocalDateTime timestamp;
}
