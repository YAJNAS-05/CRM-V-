package com.everx.hr.position;

import com.everx.hr.position.dto.CreatePositionRequest;
import com.everx.hr.position.dto.PositionDto;
import com.everx.hr.position.dto.UpdatePositionRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    @Transactional
    public PositionDto createPosition(CreatePositionRequest request) {
        Position position = new Position();
        position.setTitle(request.getTitle());
        position.setGrade(request.getGrade());
        position.setMinSalary(request.getMinSalary());
        position.setMaxSalary(request.getMaxSalary());
        position.setCurrency(request.getCurrency());

        return toDto(positionRepository.save(position));
    }

    @Transactional(readOnly = true)
    public PositionDto getPositionById(java.util.UUID id) {
        Position position = positionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + id));
        return toDto(position);
    }

    @Transactional(readOnly = true)
    public Page<PositionDto> getPositions(Pageable pageable, String search) {
        return positionRepository.findAllFiltered(search, pageable).map(this::toDto);
    }

    @Transactional
    public PositionDto updatePosition(java.util.UUID id, UpdatePositionRequest request) {
        Position position = positionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + id));

        if (request.getTitle() != null) position.setTitle(request.getTitle());
        if (request.getGrade() != null) position.setGrade(request.getGrade());
        if (request.getMinSalary() != null) position.setMinSalary(request.getMinSalary());
        if (request.getMaxSalary() != null) position.setMaxSalary(request.getMaxSalary());
        if (request.getCurrency() != null) position.setCurrency(request.getCurrency());

        return toDto(positionRepository.save(position));
    }

    @Transactional
    public void deletePosition(java.util.UUID id) {
        Position position = positionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Position not found with id: " + id));
        position.softDelete();
        positionRepository.save(position);
    }

    private PositionDto toDto(Position position) {
        PositionDto dto = new PositionDto();
        dto.setId(position.getId());
        dto.setTitle(position.getTitle());
        dto.setGrade(position.getGrade());
        dto.setMinSalary(position.getMinSalary());
        dto.setMaxSalary(position.getMaxSalary());
        dto.setCurrency(position.getCurrency());
        if (position.getCreatedAt() != null) {
            dto.setCreatedAt(position.getCreatedAt().toInstant());
        }
        if (position.getUpdatedAt() != null) {
            dto.setUpdatedAt(position.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
