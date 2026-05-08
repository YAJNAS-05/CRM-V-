package com.everx.hr.okr;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "okr_cycles", schema = "everx_hr", indexes = {
    @Index(name = "idx_cycle_dates", columnList = "start_date, end_date"),
    @Index(name = "idx_cycle_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OkrCycle extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PLANNING"; // PLANNING, ACTIVE, REVIEW, CLOSED

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "check_in_frequency", length = 20)
    private String checkInFrequency = "WEEKLY"; // DAILY, WEEKLY, BIWEEKLY, MONTHLY

    @Column(name = "company_objectives_count")
    private Integer companyObjectivesCount = 3; // Max company objectives

    @Column(name = "team_objectives_count")
    private Integer teamObjectivesCount = 3; // Max team objectives per team

    @Column(name = "individual_objectives_count")
    private Integer individualObjectivesCount = 3; // Max individual objectives per person

    @Column(name = "max_key_results_per_objective")
    private Integer maxKeyResultsPerObjective = 5;
}
