package com.everx.crm.activity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activities", schema = "everx_crm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Activity extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String type;

    @Column(length = 255)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "duration_mins")
    private Integer durationMins;

    @Column(name = "contact_id")
    private UUID contactId;

    @Column(name = "deal_id")
    private UUID dealId;

    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "assigned_to")
    private UUID assignedTo;
}
