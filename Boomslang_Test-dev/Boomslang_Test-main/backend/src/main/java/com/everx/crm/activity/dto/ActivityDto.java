package com.everx.crm.activity.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private UUID id;
    private String type;
    private String subject;
    private String description;
    private Instant dueDate;
    private Instant completedAt;
    private String status;
    private Integer durationMins;
    private UUID contactId;
    private UUID dealId;
    private UUID leadId;
    private UUID accountId;
    private UUID assignedTo;
    private Instant createdAt;
    private Instant updatedAt;
}
