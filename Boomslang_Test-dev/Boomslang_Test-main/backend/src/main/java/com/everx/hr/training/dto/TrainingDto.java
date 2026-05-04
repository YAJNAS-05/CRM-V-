package com.everx.hr.training.dto;

import com.everx.hr.training.TrainingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingDto {
    private UUID id;
    private String title;
    private String description;
    private String trainerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxParticipants;
    private String location;
    private UUID departmentId;
    private TrainingStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
