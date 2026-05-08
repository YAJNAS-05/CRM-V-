package com.everx.erp.fieldwork;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "field_job", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FieldJob extends BaseEntity {
    @Column(name = "job_number", nullable = false, unique = true)
    private String jobNumber;
    
    @Column(name = "title", length = 200)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "status", length = 20)
    private String status;
    
    @Column(name = "priority", length = 20)
    private String priority;
    
    @Column(name = "technician_id")
    private UUID technicianId;
    
    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;
    
    @Column(name = "location_id")
    private UUID locationId;
    
    @Column(name = "customer_id")
    private UUID customerId;
}
