package com.everx.hr.okr;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "okr_key_results", schema = "everx_hr", indexes = {
    @Index(name = "idx_kr_objective", columnList = "objective_id"),
    @Index(name = "idx_kr_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeyResult extends BaseEntity {

    @Column(name = "objective_id", nullable = false)
    private UUID objectiveId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objective_id", insertable = false, updatable = false)
    private Objective objective;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_value", precision = 15, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue = BigDecimal.ZERO;

    @Column(name = "unit", length = 50)
    private String unit; // PERCENTAGE, NUMBER, CURRENCY, BOOLEAN

    @Column(name = "status", nullable = false, length = 30)
    private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, AT_RISK, COMPLETED, CANCELLED

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "confidence_level")
    private Integer confidenceLevel = 5; // 1-10 scale

    @Column(name = "weight")
    private Integer weight = 1;
}
