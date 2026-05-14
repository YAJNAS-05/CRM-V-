package com.everx.project.controller;

import com.everx.project.dto.*;
import com.everx.project.service.PMProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/projects")
@RequiredArgsConstructor
public class PMProjectController {
    private final PMProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(projectService.getProjectsByWorkspace(workspaceId));
    }

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByPortfolio(@PathVariable UUID portfolioId) {
        return ResponseEntity.ok(projectService.getProjectsByPortfolio(portfolioId));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@RequestBody CreateProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable UUID id, @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ProjectDTO> archiveProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.archiveProject(id));
    }
}
