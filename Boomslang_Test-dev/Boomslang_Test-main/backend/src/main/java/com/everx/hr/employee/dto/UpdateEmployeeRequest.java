package com.everx.hr.employee.dto;

import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {
    private UUID userId;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UUID departmentId;
    private UUID positionId;
    private UUID managerId;
    private EmploymentType employmentType;
    private EmployeeStatus status;
    private LocalDate hireDate;
    private LocalDate terminationDate;
}
