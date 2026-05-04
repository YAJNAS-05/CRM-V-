package com.everx.hr.leave;

import com.everx.hr.AccrualFrequency;
import com.everx.hr.LeaveType;
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

@Entity
@Table(name = "leave_policies", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeavePolicy extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 50)
    private LeaveType leaveType;

    @Column(name = "annual_entitlement", nullable = false, precision = 6, scale = 2)
    private BigDecimal annualEntitlement = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "accrual_frequency", length = 20)
    private AccrualFrequency accrualFrequency = AccrualFrequency.MONTHLY;

    @Column(name = "carry_forward_limit", precision = 6, scale = 2)
    private BigDecimal carryForwardLimit;

    @Column(name = "max_balance", precision = 6, scale = 2)
    private BigDecimal maxBalance;

    @Column(name = "allow_negative", nullable = false)
    private Boolean allowNegative = false;

    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval = true;

    @Column(name = "min_service_days")
    private Integer minServiceDays;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
