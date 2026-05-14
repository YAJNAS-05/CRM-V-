package com.everx.project.service;

import com.everx.project.dto.*;
import com.everx.project.entity.Epic;
import com.everx.project.repository.EpicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PMEpicService {
    private final EpicRepository epicRepository;

    public List<EpicDTO> getEpicsByProject(UUID projectId) {
        return epicRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EpicDTO getEpicById(UUID id) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Epic not found: " + id));
        return toDTO(epic);
    }

    @Transactional
    public EpicDTO createEpic(CreateEpicRequest request) {
        Epic epic = Epic.builder()
                .projectId(request.getProjectId())
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .milestoneId(request.getMilestoneId())
                .status("OPEN")
                .progress(0)
                .build();
        
        Epic saved = epicRepository.save(epic);
        return toDTO(saved);
    }

    @Transactional
    public EpicDTO updateEpic(UUID id, UpdateEpicRequest request) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Epic not found: " + id));
        
        if (request.getName() != null) epic.setName(request.getName());
        if (request.getDescription() != null) epic.setDescription(request.getDescription());
        if (request.getColor() != null) epic.setColor(request.getColor());
        if (request.getStartDate() != null) epic.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) epic.setEndDate(request.getEndDate());
        if (request.getStatus() != null) epic.setStatus(request.getStatus());
        if (request.getProgress() != null) epic.setProgress(request.getProgress());
        if (request.getMilestoneId() != null) epic.setMilestoneId(request.getMilestoneId());
        
        epic.setUpdatedAt(LocalDateTime.now());
        Epic saved = epicRepository.save(epic);
        return toDTO(saved);
    }

    @Transactional
    public void deleteEpic(UUID id) {
        Epic epic = epicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Epic not found: " + id));
        epic.setIsDeleted(true);
        epic.setUpdatedAt(LocalDateTime.now());
        epicRepository.save(epic);
    }

    private EpicDTO toDTO(Epic epic) {
        return EpicDTO.builder()
                .id(epic.getId())
                .projectId(epic.getProjectId())
                .name(epic.getName())
                .description(epic.getDescription())
                .color(epic.getColor())
                .startDate(epic.getStartDate())
                .endDate(epic.getEndDate())
                .status(epic.getStatus())
                .progress(epic.getProgress())
                .ownerId(epic.getOwnerId())
                .milestoneId(epic.getMilestoneId())
                .createdAt(epic.getCreatedAt())
                .updatedAt(epic.getUpdatedAt())
                .build();
    }
}
