package com.everx.collaboration.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinSessionRequest {
    private String userId;
    private String userName;
    private String sessionId;
    private Map<String, Object> metadata;
}
