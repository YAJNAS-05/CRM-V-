package com.everx.finance.aging;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Entity
@Table(name = "ar_aging", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AccountsReceivableAging extends BaseEntity {

    @Column(name = "customer_id", nullable = false)
    private java.util.UUID customerId;

    @Column(name = "invoice_id", nullable = false)
    private java.util.UUID invoiceId;

    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;

    @Column(name = "invoice_date", nullable = false)
    private LocalDateTime invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "invoice_amount", nullable = false)
    private java.math.BigDecimal invoiceAmount;

    @Column(name = "open_amount", nullable = false)
    private java.math.BigDecimal openAmount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "aging_bucket", length = 20)
    private String agingBucket;

    @Column(name = "days_overdue")
    private Integer daysOverdue;
}
