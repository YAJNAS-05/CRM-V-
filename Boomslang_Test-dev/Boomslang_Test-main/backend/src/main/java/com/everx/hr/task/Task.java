package com.everx.hr.task;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "task_title", nullable = false)
    private String taskTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "creator_id", nullable = false)
    private UUID creatorId;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "TODO";

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM";

    @Column(name = "estimated_hours", precision = 10, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "due_date")
    private LocalDate dueDate;
}
