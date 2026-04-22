package com.everx.hr.payroll;

import com.everx.hr.PayFrequency;
import com.everx.hr.PayType;
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
import java.util.UUID;

@Entity
@Table(name = "payroll_profiles", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollProfile extends BaseEntity {

    @Column(name = "employee_id", nullable = false, unique = true)
    private UUID employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_type", nullable = false, length = 50)
    private PayType payType = PayType.SALARY;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_frequency", nullable = false, length = 50)
    private PayFrequency payFrequency = PayFrequency.MONTHLY;

    @Column(name = "salary_amount", precision = 15, scale = 2)
    private BigDecimal salaryAmount;

    @Column(name = "hourly_rate", precision = 15, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "tax_id", length = 100)
    private String taxId;

    @Column(name = "bank_account_masked", length = 100)
    private String bankAccountMasked;
}
