package com.everx.hr.payroll;

import com.everx.hr.PayrollItemStatus;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payroll_items", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollItem extends BaseEntity {

    @Column(name = "payroll_run_id", nullable = false)
    private UUID payrollRunId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "gross_pay", precision = 15, scale = 2)
    private BigDecimal grossPay;

    @Column(name = "deductions", precision = 15, scale = 2)
    private BigDecimal deductions;

    @Column(name = "net_pay", precision = 15, scale = 2)
    private BigDecimal netPay;

    @Column(name = "currency", length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PayrollItemStatus status = PayrollItemStatus.PENDING;

    @Column(name = "paid_date")
    private LocalDate paidDate;
}
