package com.everx.workflow;

import com.everx.workflow.dto.WorkflowResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowDefinitionRepository workflowRepository;

    public Page<WorkflowResponse> findAll(Pageable pageable) {
        return workflowRepository.findAll(pageable).map(this::toResponse);
    }

    public WorkflowResponse findById(UUID id) {
        WorkflowDefinition wf = workflowRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Workflow not found"));
        return toResponse(wf);
    }

    @Transactional
    public WorkflowResponse create(WorkflowDefinition request) {
        request.setIsActive(true);
        return toResponse(workflowRepository.save(request));
    }

    private WorkflowResponse toResponse(WorkflowDefinition w) {
        return WorkflowResponse.builder()
            .id(w.getId())
            .workflowName(w.getWorkflowName())
            .workflowType(w.getWorkflowType())
            .isActive(w.getIsActive())
            .build();
    }
}
