package com.everx.websocket;

import com.everx.websocket.dto.WebSocketMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final WebSocketMessageRepository messageRepository;

    public Page<WebSocketMessageResponse> findAll(Pageable pageable) {
        return messageRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public WebSocketMessageResponse create(WebSocketMessage request) {
        return toResponse(messageRepository.save(request));
    }

    private WebSocketMessageResponse toResponse(WebSocketMessage m) {
        return WebSocketMessageResponse.builder()
            .id(m.getId())
            .messageType(m.getMessageType())
            .payload(m.getPayload())
            .build();
    }
}
