package com.everx.project.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneDTO {
    private UUID id;
    private UUID projectId;
    private String name;
    private String description;
    private LocalDate dueDate;
    private String status;
    private Integer progress;
    private UUID ownerId;
    private String ownerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
