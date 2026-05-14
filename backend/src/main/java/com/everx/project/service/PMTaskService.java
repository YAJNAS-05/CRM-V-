package com.everx.project.service;

import com.everx.project.dto.*;
import com.everx.project.entity.Task;
import com.everx.project.repository.PMTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PMTaskService {
    private final PMTaskRepository taskRepository;

    public List<TaskDTO> getTasksByProject(UUID projectId) {
        return taskRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByStatus(UUID projectId, String status) {
        return taskRepository.findByProjectIdAndStatusAndIsDeletedFalse(projectId, status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByAssignee(UUID assigneeId) {
        return taskRepository.findByAssigneeIdAndIsDeletedFalse(assigneeId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByEpic(UUID epicId) {
        return taskRepository.findByEpicIdAndIsDeletedFalse(epicId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksBySprint(UUID sprintId) {
        return taskRepository.findBySprintIdAndIsDeletedFalse(sprintId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getSubtasks(UUID parentTaskId) {
        return taskRepository.findByParentTaskIdAndIsDeletedFalse(parentTaskId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        return toDTO(task);
    }

    @Transactional
    public TaskDTO createTask(CreateTaskRequest request) {
        Integer maxNum = taskRepository.findMaxTaskNumberByProjectId(request.getProjectId()).orElse(0);
        String taskNumber = String.format("TASK-%05d", maxNum + 1);
        
        Task task = Task.builder()
                .projectId(request.getProjectId())
                .taskNumber(taskNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .taskType(request.getTaskType() != null ? request.getTaskType() : "TASK")
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .status(request.getStatus() != null ? request.getStatus() : "TODO")
                .assigneeId(request.getAssigneeId())
                .epicId(request.getEpicId())
                .sprintId(request.getSprintId())
                .milestoneId(request.getMilestoneId())
                .parentTaskId(request.getParentTaskId())
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .timeEstimate(request.getTimeEstimate())
                .storyPoints(request.getStoryPoints())
                .tags(request.getTags())
                .isPrivate(request.getIsPrivate() != null ? request.getIsPrivate() : false)
                .build();
        
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO updateTask(UUID id, UpdateTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getTaskType() != null) task.setTaskType(request.getTaskType());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if ("DONE".equals(request.getStatus())) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getStatusOrder() != null) task.setStatusOrder(request.getStatusOrder());
        if (request.getAssigneeId() != null) task.setAssigneeId(request.getAssigneeId());
        if (request.getEpicId() != null) task.setEpicId(request.getEpicId());
        if (request.getSprintId() != null) task.setSprintId(request.getSprintId());
        if (request.getMilestoneId() != null) task.setMilestoneId(request.getMilestoneId());
        if (request.getStartDate() != null) task.setStartDate(request.getStartDate());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getTimeEstimate() != null) task.setTimeEstimate(request.getTimeEstimate());
        if (request.getTimeSpent() != null) task.setTimeSpent(request.getTimeSpent());
        if (request.getStoryPoints() != null) task.setStoryPoints(request.getStoryPoints());
        if (request.getIsRecurring() != null) task.setIsRecurring(request.getIsRecurring());
        if (request.getRecurringPattern() != null) task.setRecurringPattern(request.getRecurringPattern());
        if (request.getCoverImage() != null) task.setCoverImage(request.getCoverImage());
        if (request.getIsPrivate() != null) task.setIsPrivate(request.getIsPrivate());
        if (request.getTags() != null) task.setTags(request.getTags());
        
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO moveTask(UUID id, MoveTaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if ("DONE".equals(request.getStatus())) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getStatusOrder() != null) task.setStatusOrder(request.getStatusOrder());
        
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public void deleteTask(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        task.setIsDeleted(true);
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    private TaskDTO toDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .projectId(task.getProjectId())
                .taskNumber(task.getTaskNumber())
                .parentTaskId(task.getParentTaskId())
                .epicId(task.getEpicId())
                .sprintId(task.getSprintId())
                .milestoneId(task.getMilestoneId())
                .title(task.getTitle())
                .description(task.getDescription())
                .taskType(task.getTaskType())
                .priority(task.getPriority())
                .status(task.getStatus())
                .statusOrder(task.getStatusOrder())
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .timeEstimate(task.getTimeEstimate())
                .timeSpent(task.getTimeSpent())
                .assigneeId(task.getAssigneeId())
                .storyPoints(task.getStoryPoints())
                .isRecurring(task.getIsRecurring())
                .recurringPattern(task.getRecurringPattern())
                .coverImage(task.getCoverImage())
                .isPrivate(task.getIsPrivate())
                .metadata(task.getMetadata())
                .tags(task.getTags())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .createdBy(task.getCreatedBy())
                .build();
    }
}
