package com.everx.project.service;

import com.everx.project.dto.*;
import com.everx.project.entity.Project;
import com.everx.project.repository.PMProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PMProjectService {
    private final PMProjectRepository projectRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findByIsArchivedFalseAndIsDeletedFalse()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByWorkspace(UUID workspaceId) {
        return projectRepository.findByWorkspaceIdAndIsDeletedFalse(workspaceId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByPortfolio(UUID portfolioId) {
        return projectRepository.findByPortfolioIdAndIsDeletedFalse(portfolioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        return toDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .color(request.getColor())
                .category(request.getCategory())
                .projectType(request.getProjectType() != null ? request.getProjectType() : "KANBAN")
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE")
                .status("ACTIVE")
                .workspaceId(request.getWorkspaceId())
                .portfolioId(request.getPortfolioId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .tags(request.getTags())
                .build();
        
        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    @Transactional
    public ProjectDTO updateProject(UUID id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        
        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getIcon() != null) project.setIcon(request.getIcon());
        if (request.getColor() != null) project.setColor(request.getColor());
        if (request.getCategory() != null) project.setCategory(request.getCategory());
        if (request.getProjectType() != null) project.setProjectType(request.getProjectType());
        if (request.getVisibility() != null) project.setVisibility(request.getVisibility());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getTags() != null) project.setTags(request.getTags());
        if (request.getIsArchived() != null) project.setIsArchived(request.getIsArchived());
        
        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        project.setIsDeleted(true);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
    }

    @Transactional
    public ProjectDTO archiveProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        project.setIsArchived(true);
        project.setUpdatedAt(LocalDateTime.now());
        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    private ProjectDTO toDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .workspaceId(project.getWorkspaceId())
                .portfolioId(project.getPortfolioId())
                .name(project.getName())
                .description(project.getDescription())
                .icon(project.getIcon())
                .color(project.getColor())
                .category(project.getCategory())
                .projectType(project.getProjectType())
                .visibility(project.getVisibility())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ownerId(project.getOwnerId())
                .settings(project.getSettings())
                .metadata(project.getMetadata())
                .tags(project.getTags())
                .isArchived(project.getIsArchived())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .createdBy(project.getCreatedBy())
                .build();
    }
}
