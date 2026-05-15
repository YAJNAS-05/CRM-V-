package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.SignOffStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class FieldJobSignOffDto {
    private Long signOffId;
    private UUID fieldJobId;
    private Long reportId;
    private SignOffStatus signOffStatus;
    private String clientRepresentative;
    private String clientDesignation;
    private LocalDate signedOffDate;
    private LocalTime signedOffTime;
    private byte[] clientSignatureImage;
    private String clientComments;
    private Integer clientSatisfaction;
    private String disputeReason;
    private String disputeResolution;
    private LocalDate disputeResolvedDate;
    private String waiverReason;
    private String waiverApprovedBy;
    private String everxRepresentative;
    private String signOffLocation;
    private OffsetDateTime createdAt;
}