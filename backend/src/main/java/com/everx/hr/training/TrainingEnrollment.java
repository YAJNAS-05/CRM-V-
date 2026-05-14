package com.everx.hr.training;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "training_enrollments", schema = "everx_hr",
        uniqueConstraints = @UniqueConstraint(columnNames = {"training_id", "employee_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrainingEnrollment extends BaseEntity {

    @Column(name = "training_id", nullable = false)
    private UUID trainingId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "score")
    private Integer score;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
