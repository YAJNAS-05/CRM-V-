package com.everx.hr.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AttendanceCorrectionRequest {
    @NotNull
    private OffsetDateTime punchIn;

    private OffsetDateTime punchOut;

    private String notes;
}

