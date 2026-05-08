package com.everx.pm.project;

import com.everx.pm.project.dto.AddProjectMemberRequest;
import com.everx.pm.project.dto.CreateProjectCostRequest;
import com.everx.pm.project.dto.CreateProjectRequest;
import com.everx.pm.project.dto.ProjectCostDto;
import com.everx.pm.project.dto.ProjectDetailDto;
import com.everx.pm.project.dto.ProjectDto;
import com.everx.pm.project.dto.ProjectMemberDto;
import com.everx.pm.project.dto.UpdateProjectRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pm/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getProjects(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getAccessibleProjects(pageable)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDetailDto>> getProjectDetail(@PathVariable UUID projectId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectDetail(projectId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(projectService.createProject(request), "Project created"));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable UUID projectId,
            @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.updateProject(projectId, request), "Project updated"));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.okMessage("Project deleted"));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<ProjectMemberDto>> addMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody AddProjectMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(projectService.addMember(projectId, request), "Member added"));
    }

    @DeleteMapping("/{projectId}/members/{employeeId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID employeeId) {
        projectService.removeMember(projectId, employeeId);
        return ResponseEntity.ok(ApiResponse.okMessage("Member removed"));
    }

    @PostMapping("/{projectId}/costs")
    public ResponseEntity<ApiResponse<ProjectCostDto>> addCost(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateProjectCostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(projectService.addProjectCost(projectId, request), "Project cost recorded"));
    }
}
