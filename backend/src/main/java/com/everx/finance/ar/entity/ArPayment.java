package com.everx.finance.ar.entity;

import com.everx.finance.journal.entity.JournalEntry;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * AR Payment - Payment received from customer for an invoice
 */
@Entity
@Table(name = "ar_payments", schema = "everx_finance",
       indexes = {
           @Index(name = "idx_arp_customer_invoice", columnList = "customer_invoice_id"),
           @Index(name = "idx_arp_status", columnList = "status"),
           @Index(name = "idx_arp_payment_date", columnList = "payment_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_invoice_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_arp_customer_invoice"))
    private CustomerInvoice customerInvoice;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal paymentAmount;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Column(length = 100)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.PENDING;

    // FX & GL
    @Column(precision = 19, scale = 4)
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountInBaseCurrency;

    @Column(name = "bank_deposit_id")
    private UUID bankDepositId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_journal_entry_id",
                foreignKey = @ForeignKey(name = "fk_arp_journal_entry"))
    private JournalEntry paymentJournalEntry;

    // Reconciliation
    @Column(name = "reconciled_at")
    private OffsetDateTime reconciledAt;

    @Column(name = "bank_statement_id")
    private UUID bankStatementId;

    public enum PaymentMethod {
        BANK_TRANSFER,
        CREDIT_CARD,
        CHECK,
        ACH,
        CASH
    }

    public enum Status {
        PENDING,
        CLEARED,
        FAILED,
        REVERSED
    }
}
