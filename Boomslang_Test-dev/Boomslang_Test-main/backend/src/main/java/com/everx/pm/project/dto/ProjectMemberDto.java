package com.everx.pm.project.dto;

import com.everx.pm.project.ProjectMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberDto {

    private UUID id;
    private UUID projectId;
    private UUID employeeId;
    private String role;
    private OffsetDateTime addedAt;

    public static ProjectMemberDto fromEntity(ProjectMember member) {
        return ProjectMemberDto.builder()
                .id(member.getId())
                .projectId(member.getProjectId())
                .employeeId(member.getEmployeeId())
                .role(member.getRole())
                .addedAt(member.getAddedAt())
                .build();
    }
}
