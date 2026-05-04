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
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "employee_compensations",
        schema = "everx_hr",
        uniqueConstraints = @UniqueConstraint(name = "uk_employee_compensation", columnNames = {"employee_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCompensation extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "annual_ctc", nullable = false, precision = 15, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}
