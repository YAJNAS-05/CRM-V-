package com.everx.reporting.adhoc;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "saved_queries", schema = "everx_reporting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedQuery {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "query_json", columnDefinition = "TEXT")
    private String queryJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;

    @Column(name = "execution_count")
    private Integer executionCount = 0;
}
