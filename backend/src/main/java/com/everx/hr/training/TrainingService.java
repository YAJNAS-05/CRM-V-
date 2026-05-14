package com.everx.hr.training;

import com.everx.hr.training.dto.*;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;

    @Transactional
    public TrainingDto createTraining(CreateTrainingRequest request) {
        Training training = new Training();
        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        training.setTrainerName(request.getTrainerName());
        training.setStartDate(request.getStartDate());
        training.setEndDate(request.getEndDate());
        training.setMaxParticipants(request.getMaxParticipants());
        training.setLocation(request.getLocation());
        training.setDepartmentId(request.getDepartmentId());
        training.setStatus(TrainingStatus.PLANNED);
        return toDto(trainingRepository.save(training));
    }

    @Transactional(readOnly = true)
    public TrainingDto getById(UUID id) {
        return toDto(trainingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Training not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<TrainingDto> getAll(Pageable pageable, String search, TrainingStatus status, UUID departmentId) {
        return trainingRepository.findAllFiltered(search, status, departmentId, pageable).map(this::toDto);
    }

    @Transactional
    public TrainingDto update(UUID id, UpdateTrainingRequest request) {
        Training training = trainingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Training not found: " + id));

        if (request.getTitle() != null) training.setTitle(request.getTitle());
        if (request.getDescription() != null) training.setDescription(request.getDescription());
        if (request.getTrainerName() != null) training.setTrainerName(request.getTrainerName());
        if (request.getStartDate() != null) training.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) training.setEndDate(request.getEndDate());
        if (request.getMaxParticipants() != null) training.setMaxParticipants(request.getMaxParticipants());
        if (request.getLocation() != null) training.setLocation(request.getLocation());
        if (request.getDepartmentId() != null) training.setDepartmentId(request.getDepartmentId());
        if (request.getStatus() != null) training.setStatus(request.getStatus());

        return toDto(trainingRepository.save(training));
    }

    @Transactional
    public void delete(UUID id) {
        Training training = trainingRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Training not found: " + id));
        training.softDelete();
        trainingRepository.save(training);
    }

    @Transactional
    public TrainingEnrollmentDto enroll(UUID trainingId, UUID employeeId) {
        trainingRepository.findByIdAndNotDeleted(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found: " + trainingId));

        if (enrollmentRepository.existsByTrainingIdAndEmployeeIdAndIsDeleted(trainingId, employeeId, false)) {
            throw new ValidationException("Employee already enrolled in this training");
        }

        TrainingEnrollment enrollment = new TrainingEnrollment();
        enrollment.setTrainingId(trainingId);
        enrollment.setEmployeeId(employeeId);
        return toEnrollmentDto(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<TrainingEnrollmentDto> getEnrollmentsByTraining(UUID trainingId) {
        return enrollmentRepository.findByTrainingId(trainingId).stream()
                .map(this::toEnrollmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainingEnrollmentDto> getEnrollmentsByEmployee(UUID employeeId) {
        return enrollmentRepository.findByEmployeeId(employeeId).stream()
                .map(this::toEnrollmentDto)
                .collect(Collectors.toList());
    }

    private TrainingDto toDto(Training t) {
        TrainingDto dto = new TrainingDto();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setTrainerName(t.getTrainerName());
        dto.setStartDate(t.getStartDate());
        dto.setEndDate(t.getEndDate());
        dto.setMaxParticipants(t.getMaxParticipants());
        dto.setLocation(t.getLocation());
        dto.setDepartmentId(t.getDepartmentId());
        dto.setStatus(t.getStatus());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    private TrainingEnrollmentDto toEnrollmentDto(TrainingEnrollment e) {
        TrainingEnrollmentDto dto = new TrainingEnrollmentDto();
        dto.setId(e.getId());
        dto.setTrainingId(e.getTrainingId());
        dto.setEmployeeId(e.getEmployeeId());
        dto.setCompletedAt(e.getCompletedAt());
        dto.setScore(e.getScore());
        dto.setNotes(e.getNotes());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
