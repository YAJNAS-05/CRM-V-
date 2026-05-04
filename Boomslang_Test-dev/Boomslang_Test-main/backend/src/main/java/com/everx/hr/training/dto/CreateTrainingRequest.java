package com.everx.hr.training.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTrainingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String trainerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxParticipants;
    private String location;
    private UUID departmentId;
}
