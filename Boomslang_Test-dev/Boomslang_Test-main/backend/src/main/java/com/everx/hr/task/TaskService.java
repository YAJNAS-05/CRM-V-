package com.everx.hr.task;

import com.everx.hr.project.ProjectRepository;
import com.everx.hr.task.dto.CreateTaskRequest;
import com.everx.hr.task.dto.TaskDto;
import com.everx.hr.task.dto.UpdateTaskRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskDto createTask(CreateTaskRequest request) {
        projectRepository.findByIdAndIsDeletedFalse(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + request.getProjectId()));

        UUID creatorId = request.getCreatorId() != null
                ? request.getCreatorId()
                : SecurityUserContext.getCurrentUserIdOrNull();
        if (creatorId == null) {
            throw new ValidationException("Creator ID is required to create a task");
        }

        Task task = new Task();
        task.setProjectId(request.getProjectId());
        task.setTaskTitle(request.getTaskTitle());
        task.setDescription(request.getDescription());
        task.setCreatorId(creatorId);
        task.setAssigneeId(request.getAssigneeId());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TO_DO");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        task.setEstimatedHours(request.getEstimatedHours());
        task.setDueDate(request.getDueDate());

        return TaskDto.fromEntity(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(UUID taskId) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        return TaskDto.fromEntity(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasksByProject(UUID projectId, Pageable pageable) {
        return taskRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable).map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasksByAssignee(UUID assigneeId, Pageable pageable) {
        return taskRepository.findByAssigneeIdAndIsDeletedFalse(assigneeId, pageable).map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getAllTasks(Pageable pageable) {
        return taskRepository.findAllByIsDeletedFalse(pageable).map(TaskDto::fromEntity);
    }

    public TaskDto updateTask(UUID taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        if (request.getTaskTitle() != null) task.setTaskTitle(request.getTaskTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getAssigneeId() != null) task.setAssigneeId(request.getAssigneeId());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        return TaskDto.fromEntity(taskRepository.save(task));
    }

    public void deleteTask(UUID taskId) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        task.softDelete();
        taskRepository.save(task);
    }
}
