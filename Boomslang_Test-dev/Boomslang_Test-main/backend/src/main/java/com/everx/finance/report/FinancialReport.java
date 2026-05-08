package com.everx.finance.report;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "financial_report", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FinancialReport extends BaseEntity {
    @Column(name = "report_name", nullable = false, length = 100)
    private String reportName;
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "period_key", nullable = false, length = 7)
    private String periodKey;
    @Column(name = "report_type", length = 30)
    private String reportType;
    @Column(name = "status", length = 20)
    private String status;
    @Column(name = "generated_by")
    private UUID generatedBy;
}
