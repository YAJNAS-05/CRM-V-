package com.everx.hr.leave;

import com.everx.hr.LeaveType;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        name = "leave_balances",
        schema = "everx_hr",
        uniqueConstraints = @UniqueConstraint(name = "uk_leave_balance_employee_type", columnNames = {"employee_id", "leave_type"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 50)
    private LeaveType leaveType;

    @Column(name = "available_days", nullable = false, precision = 6, scale = 2)
    private BigDecimal availableDays = BigDecimal.ZERO;

    @Column(name = "used_days", nullable = false, precision = 6, scale = 2)
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pending_days", nullable = false, precision = 6, scale = 2)
    private BigDecimal pendingDays = BigDecimal.ZERO;

    @Column(name = "last_accrued_on")
    private LocalDate lastAccruedOn;
}
