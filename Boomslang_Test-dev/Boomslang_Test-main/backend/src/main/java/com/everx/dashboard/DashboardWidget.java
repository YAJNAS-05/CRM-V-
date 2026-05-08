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
@Table(name = "dashboard_widgets", schema = "everx_dashboard")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardWidget {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "widget_type", nullable = false, length = 50)
    private String widgetType;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "position_x")
    private Integer positionX = 0;

    @Column(name = "position_y")
    private Integer positionY = 0;

    @Column(name = "width")
    private Integer width = 1;

    @Column(name = "height")
    private Integer height = 1;

    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;

    @Column(name = "dashboard_type", length = 50)
    private String dashboardType;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
