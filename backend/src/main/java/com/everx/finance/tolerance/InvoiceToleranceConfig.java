package com.everx.finance.tolerance;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_tolerance_config", schema = "everx_erp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceToleranceConfig extends BaseEntity {

    @Column(name = "company_code", nullable = false, unique = true, length = 10)
    private String companyCode;

    @Column(name = "tolerance_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tolerancePct = new BigDecimal("5.00");

    @Column(name = "tolerance_abs", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal toleranceAbs = new BigDecimal("100.00");

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    public static InvoiceToleranceConfig defaultConfig() {
        return InvoiceToleranceConfig.builder()
            .companyCode("DEFAULT")
            .tolerancePct(new BigDecimal("5.00"))
            .toleranceAbs(new BigDecimal("100.00"))
            .build();
    }
}
