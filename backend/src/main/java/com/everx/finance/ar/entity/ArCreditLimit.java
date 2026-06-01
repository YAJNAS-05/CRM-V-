package com.everx.finance.ar.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * AR Credit Limit - Customer credit limit and utilization tracking
 */
@Entity
@Table(name = "ar_credit_limits", schema = "everx_finance",
       uniqueConstraints = @UniqueConstraint(columnNames = "customer_id"),
       indexes = {
           @Index(name = "idx_acl_status", columnList = "status")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArCreditLimit extends BaseEntity {

    @Column(nullable = false, unique = true)
    private UUID customerId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal creditLimit;

    @Column(precision = 19, scale = 2)
    private BigDecimal availableCredit;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_date")
    private OffsetDateTime approvedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String suspensionReason;

    public enum Status {
        ACTIVE,
        SUSPENDED,
        EXPIRED
    }

    /**
     * Calculate utilization percentage
     */
    @Transient
    public BigDecimal getUtilizationPercentage() {
        if (creditLimit.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (availableCredit == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal utilized = creditLimit.subtract(availableCredit);
        return utilized.multiply(new BigDecimal("100")).divide(creditLimit, 2, java.math.RoundingMode.HALF_UP);
    }
}
