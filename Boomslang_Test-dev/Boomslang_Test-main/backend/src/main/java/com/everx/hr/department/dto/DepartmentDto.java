package com.everx.hr.department.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private UUID id;
    private String code;
    private String name;
    private UUID parentDepartmentId;
    private UUID managerEmployeeId;
    private Instant createdAt;
    private Instant updatedAt;
}
