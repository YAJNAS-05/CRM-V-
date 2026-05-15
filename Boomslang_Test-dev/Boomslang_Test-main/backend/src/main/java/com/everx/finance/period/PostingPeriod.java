package com.everx.finance.period;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

/**
 * Represents a posting period for financial accounting.
 * Prevents posting of transactions outside open periods.
 */
@Entity
@Table(name = "posting_periods", schema = "everx_erp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_code", "fiscal_year", "period"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PostingPeriod extends BaseEntity {

    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;

    @Column(name = "fiscal_year", nullable = false)
    private Integer fiscalYear;

    @Column(name = "period", nullable = false)
    private Integer period;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private PeriodStatus status = PeriodStatus.OPEN;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "closed_by", length = 100)
    private String closedBy;

    public enum PeriodStatus {
        OPEN, CLOSED, LOCKED
    }
}
