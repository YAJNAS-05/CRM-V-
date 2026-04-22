package com.everx.hr.employee.dto;

import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {
    private UUID userId;

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String phone;
    private UUID departmentId;
    private UUID positionId;
    private UUID managerId;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    private EmployeeStatus status;
    private LocalDate hireDate;
    private LocalDate terminationDate;
}
