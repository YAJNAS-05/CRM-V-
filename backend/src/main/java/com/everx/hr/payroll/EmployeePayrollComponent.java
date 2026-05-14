package com.everx.hr.payroll;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "employee_payroll_components",
        schema = "everx_hr",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_employee_component",
                columnNames = {"employee_id", "component_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePayrollComponent extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "component_id", nullable = false)
    private UUID componentId;

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "percentage", precision = 8, scale = 2)
    private BigDecimal percentage;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
