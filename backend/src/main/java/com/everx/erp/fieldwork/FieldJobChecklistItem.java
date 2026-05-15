package com.everx.erp.fieldwork;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "field_job_checklist_items", schema = "everx_erp")
@Getter
@Setter
public class FieldJobChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_instance_id")
    private Long itemInstanceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checklist_id", nullable = false)
    private FieldJobChecklist checklist;

    @Column(name = "template_item_id")
    private Long templateItemId;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "item_text", nullable = false)
    private String itemText;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private ChecklistResult result;

    @Column(name = "engineer_note")
    private String engineerNote;

    @Column(name = "photo_attached", nullable = false)
    private Boolean photoAttached = false;

    @Column(name = "photo")
    private byte[] photo;
}