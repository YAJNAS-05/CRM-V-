package com.everx.finance.period;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Entity
@Table(name = "fiscal_period", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FiscalPeriod extends BaseEntity {
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "period_key", nullable = false, length = 7)
    private String periodKey;
    @Column(name = "period_name", length = 50)
    private String periodName;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    @Column(name = "is_open", nullable = false)
    private Boolean isOpen;
    @Column(name = "is_adjustment", nullable = false)
    private Boolean isAdjustment;
}
