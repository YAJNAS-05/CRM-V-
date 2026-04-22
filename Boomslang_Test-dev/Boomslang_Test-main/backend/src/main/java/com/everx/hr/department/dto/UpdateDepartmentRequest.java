package com.everx.hr.department.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDepartmentRequest {
    private String code;
    private String name;
    private UUID parentDepartmentId;
    private UUID managerEmployeeId;
}
