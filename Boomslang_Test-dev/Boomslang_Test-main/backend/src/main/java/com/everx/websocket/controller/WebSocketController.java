package com.everx.websocket;

import com.everx.websocket.dto.WebSocketMessage;
import com.everx.websocket.dto.ModuleSubscriptionRequest;
import com.everx.websocket.dto.TypingIndicatorRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final RealTimeNotificationService notificationService;

    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public WebSocketMessage handlePing(Principal principal) {
        log.debug("Ping received from: {}", principal.getName());
        return WebSocketMessage.builder()
            .type("PONG")
            .message("Connection active")
            .timestamp(java.time.Instant.now())
            .build();
    }

    @MessageMapping("/subscribe/module")
    public void handleModuleSubscription(@Payload ModuleSubscriptionRequest request, 
                                          Principal principal) {
        log.info("User {} subscribed to module: {}", principal.getName(), request.getModule());
        // Subscription handling logic
    }

    @MessageMapping("/user/typing")
    public void handleUserTypingIndicator(@Payload TypingIndicatorRequest request,
                                           Principal principal) {
        // Broadcast typing indicator to relevant users
        notificationService.broadcastToModule(request.getModule(), 
            WebSocketMessage.builder()
                .type("USER_TYPING")
                .message(principal.getName() + " is typing...")
                .data(request)
                .timestamp(java.time.Instant.now())
                .build());
    }
}
