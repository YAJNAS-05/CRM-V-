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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "field_job_sign_offs", schema = "everx_erp")
@Getter
@Setter
public class FieldJobSignOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sign_off_id")
    private Long signOffId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_job_id", nullable = false, unique = true)
    private FieldJob fieldJob;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private FieldJobReport report;

    @Enumerated(EnumType.STRING)
    @Column(name = "sign_off_status", nullable = false)
    private SignOffStatus signOffStatus = SignOffStatus.NOT_OBTAINED;

    @Column(name = "client_representative", nullable = false)
    private String clientRepresentative;

    @Column(name = "client_designation", nullable = false)
    private String clientDesignation;

    @Column(name = "signed_off_date", nullable = false)
    private LocalDate signedOffDate;

    @Column(name = "signed_off_time", nullable = false)
    private LocalTime signedOffTime;

    @Column(name = "client_signature_image")
    private byte[] clientSignatureImage;

    @Column(name = "client_comments")
    private String clientComments;

    @Column(name = "client_satisfaction")
    private Integer clientSatisfaction;

    @Column(name = "dispute_reason")
    private String disputeReason;

    @Column(name = "dispute_resolution")
    private String disputeResolution;

    @Column(name = "dispute_resolved_date")
    private LocalDate disputeResolvedDate;

    @Column(name = "waiver_reason")
    private String waiverReason;

    @Column(name = "waiver_approved_by")
    private String waiverApprovedBy;

    @Column(name = "everx_representative")
    private String everxRepresentative;

    @Column(name = "sign_off_location")
    private String signOffLocation;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}