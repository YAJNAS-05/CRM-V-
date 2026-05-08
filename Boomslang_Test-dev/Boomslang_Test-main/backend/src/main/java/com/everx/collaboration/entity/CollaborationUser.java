package com.everx.collaboration.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "collaboration_user", schema = "everx_collaboration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class CollaborationUser extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "user_name", nullable = false, length = 200)
    private String userName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "is_online")
    private Boolean isOnline;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "cursor_position")
    private Integer cursorPosition;

    @Column(name = "current_document_id")
    private UUID currentDocumentId;
}
