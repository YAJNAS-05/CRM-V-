package com.everx.finance.tolerance;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_tolerance", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PaymentTolerance extends BaseEntity {
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "currency", length = 3)
    private String currency;
    @Column(name = "tolerance_amount")
    private BigDecimal toleranceAmount;
    @Column(name = "tolerance_percentage")
    private BigDecimal tolerancePercentage;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
