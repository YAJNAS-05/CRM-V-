package com.everx.hr.appraisal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "appraisal_goals", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppraisalGoal extends BaseEntity {

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "NOT_STARTED";

    @Column(name = "progress", nullable = false)
    private Integer progress = 0;

    @Column(name = "parent_goal_id")
    private String parentGoalId;

    @Column(name = "parent_goal_title")
    private String parentGoalTitle;

    @Column(name = "owner_name")
    private String ownerName;
}
