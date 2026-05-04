package com.everx.hr.training.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainingEnrollmentDto {
    private UUID id;
    private UUID trainingId;
    private UUID employeeId;
    private LocalDate completedAt;
    private Integer score;
    private String notes;
    private OffsetDateTime createdAt;
}
