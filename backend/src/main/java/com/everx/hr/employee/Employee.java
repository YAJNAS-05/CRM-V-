package com.everx.hr.employee;

import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employees", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends BaseEntity {

    public enum WorkLocation { OFFICE, REMOTE, HYBRID }

    public enum LifecycleStage {
        PROBATION, CONFIRMED, PIP, RESIGNED, OFFBOARDED, ALUMNI
    }

    @Column(name = "user_id", unique = true)
    private UUID userId;

    @Column(name = "employee_code", unique = true, nullable = false, length = 50)
    private String employeeCode;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "position_id")
    private UUID positionId;

    @Column(name = "manager_id")
    private UUID managerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 50)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    // --- Extended Profile Fields ---

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "confirmation_date")
    private LocalDate confirmationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_location", length = 20)
    private WorkLocation workLocation = WorkLocation.OFFICE;

    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_stage", length = 20)
    private LifecycleStage lifecycleStage = LifecycleStage.PROBATION;

    // --- Emergency Contact ---
    @Column(name = "emergency_contact_name", length = 150)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 30)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    // --- Government IDs (stored as masked/hashed values) ---
    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "aadhaar_masked", length = 20)
    private String aadhaarMasked;

    @Column(name = "passport_number", length = 30)
    private String passportNumber;

    // --- Address ---
    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 100)
    private String addressState;

    @Column(name = "address_country", length = 100)
    private String addressCountry;

    @Column(name = "address_pincode", length = 20)
    private String addressPincode;
}
