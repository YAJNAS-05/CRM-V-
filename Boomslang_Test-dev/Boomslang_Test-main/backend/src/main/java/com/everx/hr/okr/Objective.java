package com.everx.hr.okr;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "okr_objectives", schema = "everx_hr", indexes = {
    @Index(name = "idx_okr_employee", columnList = "employee_id"),
    @Index(name = "idx_okr_cycle", columnList = "cycle_id"),
    @Index(name = "idx_okr_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Objective extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "cycle_id", nullable = false)
    private UUID cycleId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 50)
    private String category; // PROFESSIONAL, PERSONAL, TEAM, COMPANY

    @Column(name = "status", nullable = false, length = 30)
    private String status = "DRAFT"; // DRAFT, ACTIVE, COMPLETED, CANCELLED

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Column(name = "weight")
    private Integer weight = 1; // For weighted objectives

    @Column(name = "alignment_parent_id")
    private UUID alignmentParentId; // Parent objective for cascading

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<KeyResult> keyResults = new ArrayList<>();

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "is_private")
    private Boolean isPrivate = false;
}
