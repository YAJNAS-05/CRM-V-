package com.everx.pm.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddProjectMemberRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    private String role;
}
