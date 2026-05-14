package com.everx.hr.employee.dto;

import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import com.everx.hr.employee.Employee.LifecycleStage;
import com.everx.hr.employee.Employee.WorkLocation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private UUID id;
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
    private Instant createdAt;
    private Instant updatedAt;

    // Extended profile
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String avatarUrl;
    private LocalDate probationEndDate;
    private LocalDate confirmationDate;
    private WorkLocation workLocation;
    private LifecycleStage lifecycleStage;

    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    // Address
    private String addressLine1;
    private String addressCity;
    private String addressState;
    private String addressCountry;
    private String addressPincode;
}
