package com.everx.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity(name = "PMEpic")
@Table(name = "pm_epics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Epic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String color;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private String status = "OPEN";

    @Column
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "milestone_id")
    private UUID milestoneId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;
}
