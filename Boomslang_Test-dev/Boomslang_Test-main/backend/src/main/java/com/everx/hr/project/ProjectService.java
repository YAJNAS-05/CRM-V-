package com.everx.hr.project;

import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.project.dto.AddProjectMemberRequest;
import com.everx.hr.project.dto.CreateProjectCostRequest;
import com.everx.hr.project.dto.CreateProjectRequest;
import com.everx.hr.project.dto.ProjectCostDto;
import com.everx.hr.project.dto.ProjectDetailDto;
import com.everx.hr.project.dto.ProjectDto;
import com.everx.hr.project.dto.ProjectMemberDto;
import com.everx.hr.project.dto.UpdateProjectRequest;
import com.everx.hr.task.Task;
import com.everx.hr.task.TaskRepository;
import com.everx.hr.task.dto.TaskDto;
import com.everx.hr.timeentry.TimeEntry;
import com.everx.hr.timeentry.TimeEntryRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectCostRepository projectCostRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public Page<ProjectDto> getAccessibleProjects(Pageable pageable) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UUID employeeId = resolveEmployeeId(userId);
        if (userId == null && employeeId == null) {
            return Page.empty(pageable);
        }
        return projectRepository.findAccessibleProjects(userId, employeeId, pageable)
                .map(ProjectDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProjectDetailDto getProjectDetail(UUID projectId) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        List<ProjectMemberDto> members = projectMemberRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(ProjectMemberDto::fromEntity)
                .toList();

        List<TaskDto> tasks = taskRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(TaskDto::fromEntity)
                .toList();

        List<ProjectCostDto> costs = projectCostRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(ProjectCostDto::fromEntity)
                .toList();

        List<TimeEntry> timeEntries = timeEntryRepository.findByProjectIdAndIsDeletedFalse(projectId);
        BigDecimal totalLaborHours = BigDecimal.ZERO;
        BigDecimal totalLaborCost = BigDecimal.ZERO;

        for (TimeEntry entry : timeEntries) {
            Integer minutes = entry.getDurationMinutes();
            if (minutes == null) {
                continue;
            }
            BigDecimal hours = BigDecimal.valueOf(minutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            totalLaborHours = totalLaborHours.add(hours);
            if (entry.getRatePerHour() != null) {
                totalLaborCost = totalLaborCost.add(hours.multiply(entry.getRatePerHour()));
            }
        }

        BigDecimal otherCosts = costs.stream()
                .filter(cost -> cost.getCostType() == null || !"LABOR".equalsIgnoreCase(cost.getCostType()))
                .map(ProjectCostDto::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = totalLaborCost.add(otherCosts);
        BigDecimal budget = project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO;
        BigDecimal profitability = budget.subtract(totalCost);

        Integer profitMargin = 0;
        if (budget.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = profitability.multiply(BigDecimal.valueOf(100))
                    .divide(budget, 2, RoundingMode.HALF_UP)
                    .intValue();
        }

        return ProjectDetailDto.builder()
                .project(ProjectDto.fromEntity(project))
                .members(members)
                .tasks(tasks)
                .costs(costs)
                .totalLaborHours(totalLaborHours)
                .actualCost(totalCost)
                .profitability(profitability)
                .profitMargin(profitMargin)
                .build();
    }

    public ProjectDto createProject(CreateProjectRequest request) {
        UUID ownerId = request.getOwnerId() != null
                ? request.getOwnerId()
                : SecurityUserContext.getCurrentUserIdOrNull();

        if (ownerId == null) {
            throw new ValidationException("Owner ID is required to create a project");
        }

        Project project = new Project();
        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setOwnerId(ownerId);
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "IN_PROGRESS");
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setBudget(request.getBudget());
        project.setCurrency(request.getCurrency());
        project.setLinkedFieldJobId(request.getLinkedFieldJobId());

        return ProjectDto.fromEntity(projectRepository.save(project));
    }

    public ProjectDto updateProject(UUID projectId, UpdateProjectRequest request) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        if (request.getProjectCode() != null) project.setProjectCode(request.getProjectCode());
        if (request.getProjectName() != null) project.setProjectName(request.getProjectName());
        if (request.getOwnerId() != null) project.setOwnerId(request.getOwnerId());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getBudget() != null) project.setBudget(request.getBudget());
        if (request.getCurrency() != null) project.setCurrency(request.getCurrency());
        if (request.getLinkedFieldJobId() != null) project.setLinkedFieldJobId(request.getLinkedFieldJobId());

        return ProjectDto.fromEntity(projectRepository.save(project));
    }

    public void deleteProject(UUID projectId) {
        Project project = projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
        project.softDelete();
        projectRepository.save(project);
    }

    public ProjectMemberDto addMember(UUID projectId, AddProjectMemberRequest request) {
        projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndEmployeeIdAndIsDeletedFalse(projectId, request.getEmployeeId())
                .orElse(null);

        if (member == null) {
            member = new ProjectMember();
            member.setProjectId(projectId);
            member.setEmployeeId(request.getEmployeeId());
        }

        member.setRole(request.getRole());
        member.setAddedAt(OffsetDateTime.now());

        return ProjectMemberDto.fromEntity(projectMemberRepository.save(member));
    }

    public void removeMember(UUID projectId, UUID employeeId) {
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndEmployeeIdAndIsDeletedFalse(projectId, employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Project member not found"));

        member.softDelete();
        projectMemberRepository.save(member);
    }

    public ProjectCostDto addProjectCost(UUID projectId, CreateProjectCostRequest request) {
        projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));

        ProjectCost cost = new ProjectCost();
        cost.setProjectId(projectId);
        cost.setCostType(request.getCostType());
        cost.setAmount(request.getAmount());
        cost.setDescription(request.getDescription());
        cost.setRecordedDate(request.getRecordedDate() != null ? request.getRecordedDate() : LocalDate.now());

        return ProjectCostDto.fromEntity(projectCostRepository.save(cost));
    }

    private UUID resolveEmployeeId(UUID userId) {
        if (userId == null) {
            return null;
        }
        return employeeRepository.findByUserIdAndNotDeleted(userId)
                .map(Employee::getId)
                .orElse(null);
    }
}
