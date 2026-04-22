package com.everx.shared.saga;

import com.everx.shared.saga.event.SagaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Publishes saga events for async processing by saga step listeners
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SagaEventPublisher {
    
    private final ApplicationEventPublisher eventPublisher;
    
    public void publish(SagaEvent event) {
        log.info("Publishing saga event: {} for saga: {}", event.getEventType(), event.getSagaId());
        eventPublisher.publishEvent(event);
    }
}
