package com.everx.crm.activity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateActivityRequest {
    
    @NotBlank(message = "Activity type is required")
    @Size(max = 50)
    private String type;

    @Size(max = 255)
    private String subject;

    private String description;
    private Instant dueDate;
    private String status;
    private Integer durationMins;
    private UUID contactId;
    private UUID dealId;
    private UUID leadId;
    private UUID accountId;
    private UUID assignedTo;
}
