package com.everx.hr.holiday;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "holidays", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Holiday extends BaseEntity {

    @Column(name = "holiday_date", nullable = false)
    private LocalDate holidayDate;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "is_optional", nullable = false)
    private Boolean optional = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
