package com.everx.hr.attendance;

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
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_punches", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendancePunch extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "punch_in", nullable = false)
    private OffsetDateTime punchIn;

    @Column(name = "punch_out")
    private OffsetDateTime punchOut;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public boolean isOpen() {
        return punchOut == null;
    }
}

