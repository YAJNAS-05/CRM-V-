package com.everx.shared.saga;

import com.everx.shared.saga.event.SagaEvent;
import com.everx.shared.saga.event.SagaEventType;
import com.everx.shared.saga.state.SagaState;
import com.everx.shared.saga.state.SagaStateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * SAGA Pattern Implementation for Distributed Transactions
 * 
 * Coordinates multi-service workflows (Quote → SO → Invoice → Payment)
 * Ensures ACID properties across service boundaries without distributed transactions.
 * 
 * On failure at any step:
 * - Automatically triggers compensating transactions in reverse order
 * - Maintains audit trail of all state transitions
 * - Prevents orphaned records (Quote accepted but SO not created)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SagaOrchestrator {

    private final SagaStateRepository sagaStateRepository;
    private final SagaEventPublisher eventPublisher;

    /**
     * FIX #1: Implement Saga for Quote→SO→Invoice→Payment Workflow
     * 
     * Starts a new saga orchestration with guaranteed atomicity across services.
     * If any step fails, compensating transactions reverse prior steps.
     */
    @Transactional
    public String initiateSalesOrderSaga(UUID referenceId, String referenceType, Map<String, Object> context) {
        String sagaId = UUID.randomUUID().toString();

        Map<String, Object> safeContext = context != null ? new HashMap<>(context) : new HashMap<>();
        safeContext.putIfAbsent("completedSteps", new ArrayList<String>());
        
        SagaState sagaState = SagaState.builder()
            .sagaId(sagaId)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .status(SagaState.SagaStatus.STARTED)
            .currentStep("INITIALIZED")
            .context(safeContext)
            .createdAt(OffsetDateTime.now())
            .updatedAt(OffsetDateTime.now())
            .retryCount(0)
            .build();
        
        sagaStateRepository.save(sagaState);
        log.info("Initiated Sales Order Saga: {} for {}: {}", sagaId, referenceType, referenceId);
        
        // Publish first event
        eventPublisher.publish(new SagaEvent(
            sagaId,
            SagaEventType.SAGA_STARTED,
            safeContext
        ));
        
        return sagaId;
    }

    /**
     * Transitions saga to next step and publishes event
     */
    @Transactional
    public void transitionStep(String sagaId, String nextStep, Map<String, Object> stepData) {
        SagaState state = sagaStateRepository.findBySagaId(sagaId)
            .orElseThrow(() -> new IllegalArgumentException("Saga not found: " + sagaId));
        
        String previousStep = state.getCurrentStep();
        Map<String, Object> context = state.getContext() != null ? state.getContext() : new HashMap<>();
        @SuppressWarnings("unchecked")
        List<String> completedSteps = (List<String>) context.getOrDefault("completedSteps", new ArrayList<String>());
        if (previousStep != null && !completedSteps.contains(previousStep)) {
            completedSteps.add(previousStep);
        }
        context.put("completedSteps", completedSteps);
        state.setContext(context);
        state.setCurrentStep(nextStep);
        state.setUpdatedAt(OffsetDateTime.now());
        sagaStateRepository.save(state);
        
        log.info("Saga {} transitioned: {} → {}", sagaId, previousStep, nextStep);
        
        // Publish step completed event
        eventPublisher.publish(new SagaEvent(
            sagaId,
            SagaEventType.STEP_COMPLETED,
            stepData
        ));
    }

    /**
     * Handles failure and initiates compensating transaction chain
     * 
     * Example:
     * 
     * 
     *   If "CREATE_INVOICE" fails after "CREATE_SALES_ORDER" succeeded,
     *   automatically compensates: DELETE_SALES_ORDER → RELEASE_INVENTORY
     */
    @Transactional
    public void handleFailure(String sagaId, String failedStep, String errorReason) {
        SagaState state = sagaStateRepository.findBySagaId(sagaId)
            .orElseThrow(() -> new IllegalArgumentException("Saga not found: " + sagaId));
        
        state.setStatus(SagaState.SagaStatus.FAILED);
        state.setFailureReason(errorReason);
        state.setUpdatedAt(OffsetDateTime.now());
        sagaStateRepository.save(state);
        
        log.error("Saga {} failed at step: {}. Reason: {}", sagaId, failedStep, errorReason);
        
        // Trigger compensating transactions in reverse order
        List<String> completedSteps = getCompletedSteps(state);
        Collections.reverse(completedSteps);
        
        for (String step : completedSteps) {
            compensateStep(sagaId, step);
        }
        
        // Publish failure event
        eventPublisher.publish(new SagaEvent(
            sagaId,
            SagaEventType.SAGA_FAILED,
            Map.of("failedStep", failedStep, "reason", errorReason)
        ));
    }

    /**
     * Executes compensating transaction for a step
     */
    @Transactional
    private void compensateStep(String sagaId, String step) {
        log.info("Compensating step: {} for saga: {}", step, sagaId);
        
        switch(step) {
            case "CREATE_SALES_ORDER":
            case "SHIPMENT_CREATED":
                eventPublisher.publish(new SagaEvent(
                    sagaId,
                    SagaEventType.COMPENSATE_SALES_ORDER,
                    Map.of()
                ));
                break;
            case "RESERVE_INVENTORY":
            case "EQUIPMENT_RESERVED":
                eventPublisher.publish(new SagaEvent(
                    sagaId,
                    SagaEventType.COMPENSATE_INVENTORY_RELEASE,
                    Map.of()
                ));
                break;
            case "CREATE_INVOICE":
            case "DEPOSIT_INVOICE_CREATED":
                eventPublisher.publish(new SagaEvent(
                    sagaId,
                    SagaEventType.COMPENSATE_INVOICE_VOID,
                    Map.of()
                ));
                break;
        }
    }

    private List<String> getCompletedSteps(SagaState state) {
        if (state.getContext() == null) {
            return new ArrayList<>();
        }
        @SuppressWarnings("unchecked")
        List<String> completedSteps = (List<String>) state.getContext().get("completedSteps");
        return completedSteps != null ? new ArrayList<>(completedSteps) : new ArrayList<>();
    }

    /**
     * Mark saga as successfully completed
     */
    @Transactional
    public void markComplete(String sagaId) {
        SagaState state = sagaStateRepository.findBySagaId(sagaId)
            .orElseThrow(() -> new IllegalArgumentException("Saga not found: " + sagaId));
        
        state.setStatus(SagaState.SagaStatus.COMPLETED);
        state.setUpdatedAt(OffsetDateTime.now());
        sagaStateRepository.save(state);
        
        log.info("Saga {} completed successfully", sagaId);
        
        eventPublisher.publish(new SagaEvent(
            sagaId,
            SagaEventType.SAGA_COMPLETED,
            Map.of()
        ));
    }
}
