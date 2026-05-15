package com.everx.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "PMTask")
@Table(name = "pm_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "task_number", nullable = false)
    private String taskNumber;

    @Column(name = "parent_task_id")
    private UUID parentTaskId;

    @Column(name = "epic_id")
    private UUID epicId;

    @Column(name = "sprint_id")
    private UUID sprintId;

    @Column(name = "milestone_id")
    private UUID milestoneId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_type", nullable = false)
    @Builder.Default
    private String taskType = "TASK";

    @Column(nullable = false)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(nullable = false)
    @Builder.Default
    private String status = "TODO";

    @Column(name = "status_order")
    @Builder.Default
    private Integer statusOrder = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "time_estimate")
    private Integer timeEstimate;

    @Column(name = "time_spent")
    @Builder.Default
    private Integer timeSpent = 0;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;

    @Column(name = "recurring_pattern")
    private String recurringPattern;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "is_private")
    @Builder.Default
    private Boolean isPrivate = false;

    @Column(columnDefinition = "json")
    @Builder.Default
    private String metadata = "{}";

    @Column(columnDefinition = "text array")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Version
    private Long version;
}
