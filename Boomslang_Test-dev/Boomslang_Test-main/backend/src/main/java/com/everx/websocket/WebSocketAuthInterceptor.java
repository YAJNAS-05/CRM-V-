package com.everx.websocket;

import com.everx.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand()) || 
            StompCommand.SEND.equals(accessor.getCommand())) {
            
            String token = extractToken(accessor);
            
            if (token != null && jwtTokenProvider.validateToken(token)) {
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                accessor.setUser(authentication);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("WebSocket authenticated for user: {}", authentication.getName());
            } else {
                log.warn("WebSocket authentication failed");
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Try to get token from native headers
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Try to get token from session attributes
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("token")) {
            return (String) sessionAttributes.get("token");
        }

        // Try to get token from query parameters
        String query = accessor.getDestination();
        if (query != null && query.contains("token=")) {
            int start = query.indexOf("token=") + 6;
            int end = query.indexOf("&", start);
            if (end == -1) end = query.length();
            return query.substring(start, end);
        }

        return null;
    }
}
