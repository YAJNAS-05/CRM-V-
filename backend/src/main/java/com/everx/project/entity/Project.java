package com.everx.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "PMProject")
@Table(name = "pm_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "workspace_id")
    private UUID workspaceId;

    @Column(name = "portfolio_id")
    private UUID portfolioId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String category;

    @Column(name = "project_type", nullable = false)
    @Builder.Default
    private String projectType = "KANBAN";

    @Column(name = "visibility", nullable = false)
    @Builder.Default
    private String visibility = "PRIVATE";

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(columnDefinition = "json")
    @Builder.Default
    private String settings = "{}";

    @Column(columnDefinition = "json")
    @Builder.Default
    private String metadata = "{}";

    @Column(columnDefinition = "text array")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

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
