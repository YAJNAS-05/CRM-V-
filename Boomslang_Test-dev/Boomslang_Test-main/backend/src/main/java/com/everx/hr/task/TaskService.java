package com.everx.hr.task;

import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.project.Project;
import com.everx.hr.project.ProjectMemberRepository;
import com.everx.hr.project.ProjectRepository;
import com.everx.hr.task.dto.CreateTaskRequest;
import com.everx.hr.task.dto.TaskDto;
import com.everx.hr.task.dto.UpdateTaskRequest;
import com.everx.platform.config.service.OptionSetService;
import com.everx.platform.config.service.WorkflowEngineService;
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

    private static final String MODULE_PM = "PM";
    private static final String ENTITY_TASK = "TASK";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_PRIORITY = "priority";
    private static final String DEFAULT_STATUS = "TODO";
    private static final String DEFAULT_PRIORITY = "MEDIUM";

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final EmployeeRepository employeeRepository;
    private final WorkflowEngineService workflowEngineService;
    private final OptionSetService optionSetService;

    private UUID resolveEmployeeId(UUID userId) {
        if (userId == null) {
            return null;
        }
        return employeeRepository.findByUserIdAndNotDeleted(userId)
                .map(Employee::getId)
                .orElse(null);
    }

    private void assertCanAccessProject(UUID projectId) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UUID employeeId = resolveEmployeeId(userId);
        if (userId == null && employeeId == null) {
            throw new ValidationException("Not authorized to access this project's tasks");
        }

        boolean owner = userId != null && userId.equals(project.getOwnerId());
        boolean member = employeeId != null && projectMemberRepository
                .findByProjectIdAndEmployeeIdAndIsDeletedFalse(projectId, employeeId)
                .isPresent();
        if (!owner && !member) {
            throw new ValidationException("Not authorized to access this project's tasks");
        }
    }

    public TaskDto createTask(CreateTaskRequest request) {
        assertCanAccessProject(request.getProjectId());

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
        String requestedStatus = normalizeTaskStatus(request.getStatus());
        String requestedPriority = normalizeValue(request.getPriority());
        String status = requestedStatus != null
            ? requestedStatus
            : optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_TASK, FIELD_STATUS, DEFAULT_STATUS);
        String priority = requestedPriority != null
            ? requestedPriority
            : optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_TASK, FIELD_PRIORITY, DEFAULT_PRIORITY);
        validateOptionValue(MODULE_PM, ENTITY_TASK, FIELD_STATUS, status, "Task status");
        validateOptionValue(MODULE_PM, ENTITY_TASK, FIELD_PRIORITY, priority, "Task priority");
        task.setStatus(status);
        task.setPriority(priority);
        task.setEstimatedHours(request.getEstimatedHours());
        task.setDueDate(request.getDueDate());

        return TaskDto.fromEntity(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(UUID taskId) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        assertCanAccessProject(task.getProjectId());
        return TaskDto.fromEntity(task);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasksByProject(UUID projectId, Pageable pageable) {
        assertCanAccessProject(projectId);
        return taskRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable).map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasksByAssignee(UUID assigneeId, Pageable pageable) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        if (userId == null || !userId.equals(assigneeId)) {
            throw new ValidationException("Not authorized to view tasks for this assignee");
        }
        return taskRepository.findByAssigneeIdAndIsDeletedFalse(assigneeId, pageable).map(TaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getAllTasks(Pageable pageable) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UUID employeeId = resolveEmployeeId(userId);
        if (userId == null && employeeId == null) {
            return Page.empty(pageable);
        }
        return taskRepository.findAccessibleTasks(userId, employeeId, pageable).map(TaskDto::fromEntity);
    }

    public TaskDto updateTask(UUID taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        assertCanAccessProject(task.getProjectId());

        if (request.getTaskTitle() != null) task.setTaskTitle(request.getTaskTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getAssigneeId() != null) task.setAssigneeId(request.getAssigneeId());
        String requestedStatus = normalizeTaskStatus(request.getStatus());
        if (requestedStatus != null) {
            String currentStatus = normalizeTaskStatus(task.getStatus());
            validateOptionValue(MODULE_PM, ENTITY_TASK, FIELD_STATUS, requestedStatus, "Task status");

            if (!currentStatus.equalsIgnoreCase(requestedStatus)
                    && workflowEngineService.hasWorkflow(MODULE_PM, ENTITY_TASK)) {
                boolean transitionDefined = workflowEngineService
                        .findTransition(MODULE_PM, ENTITY_TASK, currentStatus, requestedStatus)
                        .isPresent();
                if (!transitionDefined) {
                    throw new ValidationException("Transition not allowed by workflow");
                }
                workflowEngineService.enforceTransition(
                    MODULE_PM,
                    ENTITY_TASK,
                        taskId.toString(),
                        currentStatus,
                        requestedStatus);
            }

            task.setStatus(requestedStatus);
        }
        String requestedPriority = normalizeValue(request.getPriority());
        if (requestedPriority != null) {
            validateOptionValue(MODULE_PM, ENTITY_TASK, FIELD_PRIORITY, requestedPriority, "Task priority");
            task.setPriority(requestedPriority);
        }
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        return TaskDto.fromEntity(taskRepository.save(task));
    }

    public void deleteTask(UUID taskId) {
        Task task = taskRepository.findByIdAndIsDeletedFalse(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        assertCanAccessProject(task.getProjectId());
        task.softDelete();
        taskRepository.save(task);
    }

    private String normalizeTaskStatus(String status) {
        if (status == null) {
            return null;
        }
        String trimmed = status.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if ("TO_DO".equalsIgnoreCase(trimmed)) {
            return "TODO";
        }
        return trimmed;
    }

    private String normalizeValue(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validateOptionValue(String module, String entity, String field, String value, String label) {
        if (!optionSetService.isValidOptionValue(module, entity, field, value)) {
            throw new ValidationException(label + " is not configured");
        }
    }
}
