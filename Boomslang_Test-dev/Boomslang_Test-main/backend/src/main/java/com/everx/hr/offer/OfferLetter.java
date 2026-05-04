package com.everx.hr.offer;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "offer_letters", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfferLetter extends BaseEntity {

    @Column(name = "position_id")
    private UUID positionId;

    @Column(name = "candidate_name", nullable = false, length = 200)
    private String candidateName;

    @Column(name = "candidate_email", nullable = false, length = 255)
    private String candidateEmail;

    @Column(name = "offer_date")
    private LocalDate offerDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "salary", precision = 15, scale = 2)
    private BigDecimal salary;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OfferLetterStatus status = OfferLetterStatus.DRAFT;
}
