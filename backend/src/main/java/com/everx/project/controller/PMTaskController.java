package com.everx.project.controller;

import com.everx.project.dto.*;
import com.everx.project.service.PMTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pm/tasks")
@RequiredArgsConstructor
public class PMTaskController {
    private final PMTaskService PMTaskService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDTO>> getTasksByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(PMTaskService.getTasksByProject(projectId));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable UUID projectId, @PathVariable String status) {
        return ResponseEntity.ok(PMTaskService.getTasksByStatus(projectId, status));
    }

    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<TaskDTO>> getTasksByAssignee(@PathVariable UUID assigneeId) {
        return ResponseEntity.ok(PMTaskService.getTasksByAssignee(assigneeId));
    }

    @GetMapping("/epic/{epicId}")
    public ResponseEntity<List<TaskDTO>> getTasksByEpic(@PathVariable UUID epicId) {
        return ResponseEntity.ok(PMTaskService.getTasksByEpic(epicId));
    }

    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<TaskDTO>> getTasksBySprint(@PathVariable UUID sprintId) {
        return ResponseEntity.ok(PMTaskService.getTasksBySprint(sprintId));
    }

    @GetMapping("/subtasks/{parentTaskId}")
    public ResponseEntity<List<TaskDTO>> getSubtasks(@PathVariable UUID parentTaskId) {
        return ResponseEntity.ok(PMTaskService.getSubtasks(parentTaskId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable UUID id) {
        return ResponseEntity.ok(PMTaskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@RequestBody CreateTaskRequest request) {
        return ResponseEntity.ok(PMTaskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable UUID id, @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(PMTaskService.updateTask(id, request));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(@PathVariable UUID id, @RequestBody MoveTaskRequest request) {
        return ResponseEntity.ok(PMTaskService.moveTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        PMTaskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}

