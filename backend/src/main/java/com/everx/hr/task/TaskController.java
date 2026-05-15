package com.everx.hr.task;

import com.everx.hr.task.dto.CreateTaskRequest;
import com.everx.hr.task.dto.TaskDto;
import com.everx.hr.task.dto.UpdateTaskRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('HR_VIEW')")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskDto>>> getTasks(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID assigneeId,
            Pageable pageable) {
        if (projectId != null) {
            return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksByProject(projectId, pageable)));
        }
        if (assigneeId != null) {
            return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksByAssignee(assigneeId, pageable)));
        }
        return ResponseEntity.ok(ApiResponse.ok(taskService.getAllTasks(pageable)));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTask(taskId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(taskService.createTask(request), "Task created"));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable UUID taskId,
            @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.updateTask(taskId, request), "Task updated"));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable UUID taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.okMessage("Task deleted"));
    }
}
