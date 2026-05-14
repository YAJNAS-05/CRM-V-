package com.everx.shared.saga.event;

import lombok.Getter;
import java.time.OffsetDateTime;
import java.util.Map;

@Getter
public class SagaEvent {
    private final String sagaId;
    private final SagaEventType eventType;
    private final Map<String, Object> payload;

    private final OffsetDateTime timestamp;

    public SagaEvent(String sagaId, SagaEventType eventType, Map<String, Object> payload) {
        this.sagaId = sagaId;
        this.eventType = eventType;
        this.payload = payload;
        this.timestamp = OffsetDateTime.now();
    }
}
