package com.everx.hr.reimbursement;

import com.everx.hr.ReimbursementStatus;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reimbursement_requests", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReimbursementRequest extends BaseEntity {

    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Column(name = "requester_email")
    private String requesterEmail;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ReimbursementStatus status = ReimbursementStatus.SUBMITTED;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "paid_by")
    private UUID paidBy;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "payment_reference", length = 120)
    private String paymentReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
