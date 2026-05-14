package com.everx.project.service;

import com.everx.project.dto.*;
import com.everx.project.entity.Milestone;
import com.everx.project.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PMMilestoneService {
    private final MilestoneRepository milestoneRepository;

    public List<MilestoneDTO> getMilestonesByProject(UUID projectId) {
        return milestoneRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MilestoneDTO getMilestoneById(UUID id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found: " + id));
        return toDTO(milestone);
    }

    @Transactional
    public MilestoneDTO createMilestone(CreateMilestoneRequest request) {
        Milestone milestone = Milestone.builder()
                .projectId(request.getProjectId())
                .name(request.getName())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status("PENDING")
                .progress(0)
                .build();
        
        Milestone saved = milestoneRepository.save(milestone);
        return toDTO(saved);
    }

    @Transactional
    public MilestoneDTO updateMilestone(UUID id, UpdateMilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found: " + id));
        
        if (request.getName() != null) milestone.setName(request.getName());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        if (request.getDueDate() != null) milestone.setDueDate(request.getDueDate());
        if (request.getStatus() != null) milestone.setStatus(request.getStatus());
        if (request.getProgress() != null) milestone.setProgress(request.getProgress());
        
        milestone.setUpdatedAt(LocalDateTime.now());
        Milestone saved = milestoneRepository.save(milestone);
        return toDTO(saved);
    }

    @Transactional
    public void deleteMilestone(UUID id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Milestone not found: " + id));
        milestone.setIsDeleted(true);
        milestone.setUpdatedAt(LocalDateTime.now());
        milestoneRepository.save(milestone);
    }

    private MilestoneDTO toDTO(Milestone milestone) {
        return MilestoneDTO.builder()
                .id(milestone.getId())
                .projectId(milestone.getProjectId())
                .name(milestone.getName())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .status(milestone.getStatus())
                .progress(milestone.getProgress())
                .ownerId(milestone.getOwnerId())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }
}
