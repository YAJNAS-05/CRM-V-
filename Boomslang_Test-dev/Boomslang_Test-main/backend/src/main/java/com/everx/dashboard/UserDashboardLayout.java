package com.everx.dashboard;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_dashboard_layouts", schema = "everx_dashboard", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "dashboard_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardLayout {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "dashboard_type", nullable = false, length = 50)
    private String dashboardType;

    @Column(name = "layout_json", columnDefinition = "TEXT")
    private String layoutJson;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
