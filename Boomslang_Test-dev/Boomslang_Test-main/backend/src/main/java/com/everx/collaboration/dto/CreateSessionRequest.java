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
public class CreateSessionRequest {
    private String title;
    private String description;
    private String documentId;
    private String ownerId;
    private Map<String, Object> metadata;
}
