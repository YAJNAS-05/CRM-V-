package com.everx.erp.fieldwork;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "field_job_checklists", schema = "everx_erp")
@Getter
@Setter
public class FieldJobChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "checklist_id")
    private Long checklistId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_job_id", nullable = false, unique = true)
    private FieldJob fieldJob;

    @Column(name = "generated_from_template")
    private Long generatedFromTemplate;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_result")
    private ChecklistResult overallResult;

    @Column(name = "completed_by")
    private String completedBy;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FieldJobChecklistItem> items = new ArrayList<>();
}