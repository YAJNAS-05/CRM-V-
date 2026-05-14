package com.everx.project.service;

import com.everx.project.dto.*;
import com.everx.project.entity.Sprint;
import com.everx.project.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PMSprintService {
    private final SprintRepository sprintRepository;

    public List<SprintDTO> getSprintsByProject(UUID projectId) {
        return sprintRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SprintDTO getSprintById(UUID id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + id));
        return toDTO(sprint);
    }

    public SprintDTO getActiveSprint(UUID projectId) {
        return sprintRepository.findActiveSprint(projectId, LocalDate.now())
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional
    public SprintDTO createSprint(CreateSprintRequest request) {
        Sprint sprint = Sprint.builder()
                .projectId(request.getProjectId())
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status("PLANNING")
                .build();
        
        Sprint saved = sprintRepository.save(sprint);
        return toDTO(saved);
    }

    @Transactional
    public SprintDTO updateSprint(UUID id, UpdateSprintRequest request) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + id));
        
        if (request.getName() != null) sprint.setName(request.getName());
        if (request.getGoal() != null) sprint.setGoal(request.getGoal());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());
        if (request.getVelocity() != null) sprint.setVelocity(request.getVelocity());
        if (request.getCapacity() != null) sprint.setCapacity(request.getCapacity());
        if (request.getRetrospectiveNotes() != null) sprint.setRetrospectiveNotes(request.getRetrospectiveNotes());
        
        sprint.setUpdatedAt(LocalDateTime.now());
        Sprint saved = sprintRepository.save(sprint);
        return toDTO(saved);
    }

    @Transactional
    public SprintDTO startSprint(UUID id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + id));
        sprint.setStatus("ACTIVE");
        sprint.setUpdatedAt(LocalDateTime.now());
        Sprint saved = sprintRepository.save(sprint);
        return toDTO(saved);
    }

    @Transactional
    public SprintDTO completeSprint(UUID id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + id));
        sprint.setStatus("COMPLETED");
        sprint.setUpdatedAt(LocalDateTime.now());
        Sprint saved = sprintRepository.save(sprint);
        return toDTO(saved);
    }

    @Transactional
    public void deleteSprint(UUID id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found: " + id));
        sprint.setIsDeleted(true);
        sprint.setUpdatedAt(LocalDateTime.now());
        sprintRepository.save(sprint);
    }

    private SprintDTO toDTO(Sprint sprint) {
        return SprintDTO.builder()
                .id(sprint.getId())
                .projectId(sprint.getProjectId())
                .name(sprint.getName())
                .goal(sprint.getGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .velocity(sprint.getVelocity())
                .capacity(sprint.getCapacity())
                .retrospectiveNotes(sprint.getRetrospectiveNotes())
                .createdAt(sprint.getCreatedAt())
                .updatedAt(sprint.getUpdatedAt())
                .build();
    }
}
