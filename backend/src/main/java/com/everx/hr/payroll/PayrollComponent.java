package com.everx.hr.payroll;

import com.everx.hr.PayrollCalculationType;
import com.everx.hr.PayrollComponentType;
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

@Entity
@Table(name = "payroll_components", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollComponent extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "component_type", nullable = false, length = 20)
    private PayrollComponentType componentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_type", nullable = false, length = 20)
    private PayrollCalculationType calculationType = PayrollCalculationType.FIXED;

    @Column(name = "default_amount", precision = 15, scale = 2)
    private BigDecimal defaultAmount;

    @Column(name = "default_percentage", precision = 8, scale = 2)
    private BigDecimal defaultPercentage;

    @Column(name = "taxable", nullable = false)
    private Boolean taxable = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
