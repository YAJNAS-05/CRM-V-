package com.everx.hr.payslip;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payslips", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payslip extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "payroll_run_id")
    private UUID payrollRunId;

    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @Column(name = "gross_pay", precision = 15, scale = 2)
    private BigDecimal grossPay;

    @Column(name = "deductions", precision = 15, scale = 2)
    private BigDecimal deductions;

    @Column(name = "net_pay", precision = 15, scale = 2)
    private BigDecimal netPay;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PayslipStatus status = PayslipStatus.GENERATED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
