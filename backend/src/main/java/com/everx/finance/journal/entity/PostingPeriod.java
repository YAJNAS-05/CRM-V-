package com.everx.finance.journal.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Posting Period - Accounting period control (OPEN/CLOSED/LOCKED)
 */
@Entity
@Table(name = "posting_periods", schema = "everx_finance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "period_name"}),
       indexes = {
           @Index(name = "idx_pp_company", columnList = "company_id"),
           @Index(name = "idx_pp_status", columnList = "status"),
           @Index(name = "idx_pp_dates", columnList = "start_date,end_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostingPeriod extends BaseEntity {

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false, length = 100)
    private String periodName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.DRAFT;

    @Column(nullable = false)
    private Boolean allowManualAdjustments = false;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @Column(name = "closed_by")
    private UUID closedBy;

    @Column(columnDefinition = "TEXT")
    private String closingNotes;

    /**
     * Validates date constraints
     */
    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
    }

    public enum Status {
        DRAFT,
        OPEN,
        CLOSED,
        LOCKED
    }

    /**
     * Check if posting is allowed in this period
     */
    public boolean isPostingAllowed() {
        return status == Status.OPEN;
    }

    /**
     * Check if this date falls within the period
     */
    public boolean contains(LocalDate date) {
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }
}
