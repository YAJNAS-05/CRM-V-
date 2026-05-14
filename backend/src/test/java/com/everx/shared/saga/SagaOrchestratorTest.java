package com.everx.shared.saga;

import com.everx.shared.saga.event.SagaEvent;
import com.everx.shared.saga.event.SagaEventType;
import com.everx.shared.saga.state.SagaState;
import com.everx.shared.saga.state.SagaStateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SagaOrchestratorTest {

    @Mock
    private SagaStateRepository sagaStateRepository;

    @Mock
    private SagaEventPublisher eventPublisher;

    @InjectMocks
    private SagaOrchestrator sagaOrchestrator;

    @Test
    void handleFailure_compensatesCurrentStepNames() {
        String sagaId = "saga-current";
        SagaState sagaState = buildState(sagaId, List.of("RESERVE_INVENTORY", "CREATE_SALES_ORDER", "CREATE_INVOICE"));

        when(sagaStateRepository.findBySagaId(sagaId)).thenReturn(Optional.of(sagaState));
        when(sagaStateRepository.save(any(SagaState.class))).thenAnswer(invocation -> invocation.getArgument(0));

        sagaOrchestrator.handleFailure(sagaId, "CREATE_INVOICE", "boom");

        ArgumentCaptor<SagaEvent> captor = ArgumentCaptor.forClass(SagaEvent.class);
        verify(eventPublisher, times(4)).publish(captor.capture());

        List<SagaEventType> eventTypes = captor.getAllValues().stream().map(SagaEvent::getEventType).toList();
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_INVENTORY_RELEASE));
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_SALES_ORDER));
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_INVOICE_VOID));
        assertTrue(eventTypes.contains(SagaEventType.SAGA_FAILED));
    }

    @Test
    void handleFailure_compensatesLegacyStepNames() {
        String sagaId = "saga-legacy";
        SagaState sagaState = buildState(sagaId, List.of("EQUIPMENT_RESERVED", "SHIPMENT_CREATED", "DEPOSIT_INVOICE_CREATED"));

        when(sagaStateRepository.findBySagaId(sagaId)).thenReturn(Optional.of(sagaState));
        when(sagaStateRepository.save(any(SagaState.class))).thenAnswer(invocation -> invocation.getArgument(0));

        sagaOrchestrator.handleFailure(sagaId, "DEPOSIT_INVOICE_CREATED", "boom");

        ArgumentCaptor<SagaEvent> captor = ArgumentCaptor.forClass(SagaEvent.class);
        verify(eventPublisher, times(4)).publish(captor.capture());

        List<SagaEventType> eventTypes = captor.getAllValues().stream().map(SagaEvent::getEventType).toList();
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_INVENTORY_RELEASE));
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_SALES_ORDER));
        assertTrue(eventTypes.contains(SagaEventType.COMPENSATE_INVOICE_VOID));
        assertTrue(eventTypes.contains(SagaEventType.SAGA_FAILED));
    }

    private SagaState buildState(String sagaId, List<String> completedSteps) {
        Map<String, Object> context = new HashMap<>();
        context.put("completedSteps", new ArrayList<>(completedSteps));

        return SagaState.builder()
                .sagaId(sagaId)
                .referenceId(UUID.randomUUID())
                .referenceType("SALES_ORDER_CONFIRM")
                .status(SagaState.SagaStatus.STARTED)
                .currentStep(completedSteps.get(completedSteps.size() - 1))
                .context(context)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .retryCount(0)
                .build();
    }
}
