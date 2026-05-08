package com.everx.collaboration;

import com.everx.collaboration.dto.CollaborationSessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CollaborationSessionRepository sessionRepository;

    public Page<CollaborationSessionResponse> findAll(Pageable pageable) {
        return sessionRepository.findAll(pageable).map(this::toResponse);
    }

    public CollaborationSessionResponse findById(UUID id) {
        CollaborationSession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        return toResponse(session);
    }

    @Transactional
    public CollaborationSessionResponse create(CollaborationSession request) {
        request.setStatus("ACTIVE");
        return toResponse(sessionRepository.save(request));
    }

    private CollaborationSessionResponse toResponse(CollaborationSession s) {
        return CollaborationSessionResponse.builder()
            .id(s.getId())
            .sessionName(s.getSessionName())
            .documentId(s.getDocumentId())
            .createdBy(s.getCreatedBy())
            .status(s.getStatus())
            .build();
    }
}
