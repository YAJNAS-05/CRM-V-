package com.everx.finance.ar.entity;

import com.everx.finance.account.entity.GlAccount;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Customer Invoice - Accounts Receivable invoice sent to customers
 * Tracks invoice lifecycle: DRAFT → SENT → (PARTIALLY_PAID → PAID) OR OVERDUE → WRITTEN_OFF
 */
@Entity
@Table(name = "customer_invoices", schema = "everx_finance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id", "invoice_number"}),
       indexes = {
           @Index(name = "idx_ci_customer", columnList = "customer_id"),
           @Index(name = "idx_ci_status", columnList = "status"),
           @Index(name = "idx_ci_due_date", columnList = "due_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerInvoice extends BaseEntity {

    @Column(nullable = false)
    private UUID customerId;

    @Column(nullable = false, length = 100)
    private String invoiceNumber;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(name = "expected_payment_date")
    private LocalDate expectedPaymentDate;

    @Column(name = "so_id")
    private UUID soId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal grossAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal netAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gl_account_id", foreignKey = @ForeignKey(name = "fk_ci_gl_account"))
    private GlAccount glAccount;

    @Column(name = "posting_date")
    private OffsetDateTime postingDate;

    // AR-Specific Fields
    @Column(name = "last_reminder_sent_date")
    private LocalDate lastReminderSentDate;

    @Column(nullable = false)
    private Integer reminderCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_memo_linked_id",
                foreignKey = @ForeignKey(name = "fk_ci_credit_memo"))
    private CustomerInvoice creditMemoLinked;

    // Aging & Collections
    @Column(nullable = false)
    private Integer daysOverdue = 0;

    @Column(nullable = false)
    private Boolean lateFeeApplicable = false;

    @Column(precision = 19, scale = 2)
    private BigDecimal lateFeeAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean writeoffEligible = false;

    @Column(precision = 19, scale = 2)
    private BigDecimal writeoffAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "customerInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ArPayment> payments = new ArrayList<>();

    /**
     * Calculate outstanding balance
     */
    @Transient
    public BigDecimal getOutstandingAmount() {
        BigDecimal paid = payments.stream()
            .filter(p -> p.getStatus() != ArPayment.Status.FAILED && p.getStatus() != ArPayment.Status.REVERSED)
            .map(ArPayment::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return netAmount.subtract(paid);
    }

    public enum Status {
        DRAFT,
        SENT,
        OVERDUE,
        PARTIALLY_PAID,
        PAID,
        WRITTEN_OFF,
        CANCELLED
    }

    @PreUpdate
    private void onUpdate() {
        daysOverdue = (int) java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        if (daysOverdue > 30) {
            lateFeeApplicable = true;
        }
        if (daysOverdue > 180) {
            writeoffEligible = true;
        }
    }
}
