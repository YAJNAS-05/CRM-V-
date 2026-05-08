package com.everx.fieldwork.service;

import com.everx.fieldwork.dto.*;
import com.everx.fieldwork.entity.Technician;
import com.everx.fieldwork.repository.TechnicianRepository;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public ApiResponse<Page<TechnicianDto>> getAllTechnicians(Pageable pageable) {
        log.info("Getting all technicians with pagination: {}", pageable);
        
        Page<Technician> technicians = technicianRepository.findAll(pageable);
        Page<TechnicianDto> technicianDtos = technicians.map(this::convertToDto);
        
        return ApiResponse.ok(technicianDtos, "Technicians retrieved successfully");
    }

    public ApiResponse<TechnicianDto> getTechnicianById(UUID technicianId) {
        log.info("Getting technician by ID: {}", technicianId);
        
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));
        
        TechnicianDto technicianDto = convertToDto(technician);
        
        return ApiResponse.ok(technicianDto, "Technician retrieved successfully");
    }

    public ApiResponse<TechnicianDto> getTechnicianByEmployeeId(String employeeId) {
        log.info("Getting technician by employee ID: {}", employeeId);
        
        Technician technician = technicianRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with employee ID: " + employeeId));
        
        TechnicianDto technicianDto = convertToDto(technician);
        
        return ApiResponse.ok(technicianDto, "Technician retrieved successfully");
    }

    public ApiResponse<TechnicianDto> createTechnician(CreateTechnicianRequest request) {
        log.info("Creating new technician: {}", request.getFirstName());
        
        // Check if email already exists
        if (technicianRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        
        // Check if employee ID already exists
        if (technicianRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists: " + request.getEmployeeId());
        }
        
        // Create technician entity
        Technician technician = Technician.builder()
                .id(UUID.randomUUID())
                .employeeId(request.getEmployeeId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobilePhone(request.getMobilePhone())
                .profileImageUrl(request.getProfileImageUrl())
                .status(request.getStatus())
                .level(request.getLevel())
                .skills(request.getSkills())
                .certifications(request.getCertifications())
                .specializations(request.getSpecializations())
                .availableForFieldWork(request.getAvailableForFieldWork())
                .hasValidDriversLicense(request.getHasValidDriversLicense())
                .hasVehicle(request.getHasVehicle())
                .vehicleInfo(request.getVehicleInfo())
                .licenseNumber(request.getLicenseNumber())
                .licenseExpiryDate(request.getLicenseExpiryDate())
                .homeLatitude(request.getHomeLatitude())
                .homeLongitude(request.getHomeLongitude())
                .homeAddress(request.getHomeAddress())
                .workingRegion(request.getWorkingRegion())
                .workingAreaRadius(request.getWorkingAreaRadius())
                .workStartTime(request.getWorkStartTime())
                .workEndTime(request.getWorkEndTime())
                .availableWeekends(request.getAvailableWeekends())
                .availableHolidays(request.getAvailableHolidays())
                .technicalSkills(request.getTechnicalSkills())
                .softSkills(request.getSoftSkills())
                .safetyTraining(request.getSafetyTraining())
                .equipmentTraining(request.getEquipmentTraining())
                .assignedEquipment(request.getAssignedEquipment())
                .assignedTools(request.getAssignedTools())
                .assignedVehicle(request.getAssignedVehicle())
                .smsNotificationsEnabled(request.getSmsNotificationsEnabled())
                .emailNotificationsEnabled(request.getEmailNotificationsEnabled())
                .pushNotificationsEnabled(request.getPushNotificationsEnabled())
                .preferredLanguage(request.getPreferredLanguage())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelationship(request.getEmergencyContactRelationship())
                .medicalClearanceValid(request.getMedicalClearanceValid())
                .medicalClearanceExpiry(request.getMedicalClearanceExpiry())
                .medicalConditions(request.getMedicalConditions())
                .allergies(request.getAllergies())
                .lastSafetyTraining(request.getLastSafetyTraining())
                .lastTechnicalTraining(request.getLastTechnicalTraining())
                .trainingRecords(request.getTrainingRecords())
                .gpsTrackingEnabled(request.getGpsTrackingEnabled())
                .locationSharingEnabled(request.getLocationSharingEnabled())
                .locationUpdateInterval(request.getLocationUpdateInterval())
                .hrEmployeeId(request.getHrEmployeeId())
                .payrollId(request.getPayrollId())
                .badgeNumber(request.getBadgeNumber())
                .createdBy(request.getCreatedBy())
                .lastModifiedBy(request.getCreatedBy())
                .build();
        
        // Save technician
        Technician savedTechnician = technicianRepository.save(technician);
        
        TechnicianDto technicianDto = convertToDto(savedTechnician);
        
        return ApiResponse.created(technicianDto, "Technician created successfully");
    }

    public ApiResponse<TechnicianDto> updateTechnician(UUID technicianId, UpdateTechnicianRequest request) {
        log.info("Updating technician: {}", technicianId);
        
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));
        
        // Check if email is being changed and if it already exists
        if (request.getEmail() != null && !request.getEmail().equals(technician.getEmail())) {
            if (technicianRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
        }
        
        // Update fields
        updateTechnicianFromRequest(technician, request);
        technician.setLastModifiedBy(request.getLastModifiedBy());
        
        // Save updated technician
        Technician updatedTechnician = technicianRepository.save(technician);
        
        TechnicianDto technicianDto = convertToDto(updatedTechnician);
        
        return ApiResponse.ok(technicianDto, "Technician updated successfully");
    }

    public ApiResponse<Void> deleteTechnician(UUID technicianId) {
        log.info("Deleting technician: {}", technicianId);
        
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));
        
        // Check if technician has active jobs
        if (technician.getJobsInProgress() > 0) {
            throw new IllegalStateException("Cannot delete technician with active jobs");
        }
        
        // Delete technician
        technicianRepository.delete(technician);
        
        return ApiResponse.noContent("Technician deleted successfully");
    }

    public ApiResponse<List<TechnicianDto>> getAvailableTechnicians() {
        log.info("Getting available technicians");
        
        List<Technician> technicians = technicianRepository.findAvailableTechnicians();
        
        List<TechnicianDto> technicianDtos = technicians.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(technicianDtos, "Available technicians retrieved successfully");
    }

    public ApiResponse<Page<TechnicianDto>> searchTechnicians(String searchTerm, Pageable pageable) {
        log.info("Searching technicians with term: {}", searchTerm);
        
        Page<Technician> technicians = technicianRepository.findBySearchTerm(searchTerm, pageable);
        Page<TechnicianDto> technicianDtos = technicians.map(this::convertToDto);
        
        return ApiResponse.ok(technicianDtos, "Technician search completed");
    }

    public ApiResponse<List<TechnicianDto>> getTechniciansByLevel(Technician.TechnicianLevel level) {
        log.info("Getting technicians by level: {}", level);
        
        List<Technician> technicians = technicianRepository.findByLevel(level);
        
        List<TechnicianDto> technicianDtos = technicians.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(technicianDtos, "Technicians by level retrieved successfully");
    }

    public ApiResponse<List<TechnicianDto>> getTechniciansBySkill(String skill) {
        log.info("Getting technicians by skill: {}", skill);
        
        List<Technician> technicians = technicianRepository.findBySkill(skill);
        
        List<TechnicianDto> technicianDtos = technicians.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(technicianDtos, "Technicians by skill retrieved successfully");
    }

    public ApiResponse<List<TechnicianDto>> getTechniciansByLocation(Double latitude, Double longitude, Double radiusKm) {
        log.info("Getting technicians by location: {},{} within {}km", latitude, longitude, radiusKm);
        
        List<Technician> technicians = technicianRepository.findByLocationWithinRadius(latitude, longitude, radiusKm);
        
        List<TechnicianDto> technicianDtos = technicians.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(technicianDtos, "Technicians by location retrieved successfully");
    }

    public ApiResponse<TechnicianDto> updateTechnicianStatus(UUID technicianId, Technician.TechnicianStatus status) {
        log.info("Updating technician {} status to: {}", technicianId, status);
        
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));
        
        technician.setStatus(status);
        Technician updatedTechnician = technicianRepository.save(technician);
        
        TechnicianDto technicianDto = convertToDto(updatedTechnician);
        
        return ApiResponse.ok(technicianDto, "Technician status updated successfully");
    }

    public ApiResponse<TechnicianPerformanceDto> getTechnicianPerformance(UUID technicianId) {
        log.info("Getting performance for technician: {}", technicianId);
        
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));
        
        TechnicianPerformanceDto performanceDto = TechnicianPerformanceDto.builder()
                .technicianId(technician.getId().toString())
                .technicianName(technician.getFirstName() + " " + technician.getLastName())
                .jobsCompleted(technician.getJobsCompleted())
                .jobsInProgress(technician.getJobsInProgress())
                .averageRating(technician.getAverageRating())
                .totalRatings(technician.getTotalRatings())
                .totalEarnings(technician.getTotalEarnings())
                .averageJobDuration(technician.getAverageJobDuration())
                .onTimeCompletionRate(technician.getOnTimeCompletionRate())
                .customerSatisfactionScore(technician.getCustomerSatisfactionScore())
                .build();
        
        return ApiResponse.ok(performanceDto, "Technician performance retrieved successfully");
    }

    public ApiResponse<List<TechnicianDto>> getTopPerformers(int limit) {
        log.info("Getting top {} performers", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Technician> technicians = technicianRepository.findTopPerformers(pageable);
        
        List<TechnicianDto> technicianDtos = technicians.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(technicianDtos, "Top performers retrieved successfully");
    }

    // Private helper methods

    private void updateTechnicianFromRequest(Technician technician, UpdateTechnicianRequest request) {
        if (request.getEmployeeId() != null) {
            technician.setEmployeeId(request.getEmployeeId());
        }
        if (request.getFirstName() != null) {
            technician.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            technician.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            technician.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            technician.setPhone(request.getPhone());
        }
        if (request.getMobilePhone() != null) {
            technician.setMobilePhone(request.getMobilePhone());
        }
        if (request.getProfileImageUrl() != null) {
            technician.setProfileImageUrl(request.getProfileImageUrl());
        }
        if (request.getStatus() != null) {
            technician.setStatus(request.getStatus());
        }
        if (request.getLevel() != null) {
            technician.setLevel(request.getLevel());
        }
        if (request.getSkills() != null) {
            technician.setSkills(request.getSkills());
        }
        if (request.getCertifications() != null) {
            technician.setCertifications(request.getCertifications());
        }
        if (request.getSpecializations() != null) {
            technician.setSpecializations(request.getSpecializations());
        }
        if (request.getAvailableForFieldWork() != null) {
            technician.setAvailableForFieldWork(request.getAvailableForFieldWork());
        }
        if (request.getHasValidDriversLicense() != null) {
            technician.setHasValidDriversLicense(request.getHasValidDriversLicense());
        }
        if (request.getHasVehicle() != null) {
            technician.setHasVehicle(request.getHasVehicle());
        }
        if (request.getVehicleInfo() != null) {
            technician.setVehicleInfo(request.getVehicleInfo());
        }
        if (request.getLicenseNumber() != null) {
            technician.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getLicenseExpiryDate() != null) {
            technician.setLicenseExpiryDate(request.getLicenseExpiryDate());
        }
        if (request.getCurrentLatitude() != null) {
            technician.setCurrentLatitude(request.getCurrentLatitude());
        }
        if (request.getCurrentLongitude() != null) {
            technician.setCurrentLongitude(request.getCurrentLongitude());
        }
        if (request.getCurrentAddress() != null) {
            technician.setCurrentAddress(request.getCurrentAddress());
        }
        if (request.getLastLocationUpdate() != null) {
            technician.setLastLocationUpdate(request.getLastLocationUpdate());
        }
        if (request.getHomeLatitude() != null) {
            technician.setHomeLatitude(request.getHomeLatitude());
        }
        if (request.getHomeLongitude() != null) {
            technician.setHomeLongitude(request.getHomeLongitude());
        }
        if (request.getHomeAddress() != null) {
            technician.setHomeAddress(request.getHomeAddress());
        }
        if (request.getWorkingRegion() != null) {
            technician.setWorkingRegion(request.getWorkingRegion());
        }
        if (request.getWorkingAreaRadius() != null) {
            technician.setWorkingAreaRadius(request.getWorkingAreaRadius());
        }
        if (request.getWorkStartTime() != null) {
            technician.setWorkStartTime(request.getWorkStartTime());
        }
        if (request.getWorkEndTime() != null) {
            technician.setWorkEndTime(request.getWorkEndTime());
        }
        if (request.getAvailableWeekends() != null) {
            technician.setAvailableWeekends(request.getAvailableWeekends());
        }
        if (request.getAvailableHolidays() != null) {
            technician.setAvailableHolidays(request.getAvailableHolidays());
        }
        if (request.getTechnicalSkills() != null) {
            technician.setTechnicalSkills(request.getTechnicalSkills());
        }
        if (request.getSoftSkills() != null) {
            technician.setSoftSkills(request.getSoftSkills());
        }
        if (request.getSafetyTraining() != null) {
            technician.setSafetyTraining(request.getSafetyTraining());
        }
        if (request.getEquipmentTraining() != null) {
            technician.setEquipmentTraining(request.getEquipmentTraining());
        }
        if (request.getAssignedEquipment() != null) {
            technician.setAssignedEquipment(request.getAssignedEquipment());
        }
        if (request.getAssignedTools() != null) {
            technician.setAssignedTools(request.getAssignedTools());
        }
        if (request.getAssignedVehicle() != null) {
            technician.setAssignedVehicle(request.getAssignedVehicle());
        }
        if (request.getSmsNotificationsEnabled() != null) {
            technician.setSmsNotificationsEnabled(request.getSmsNotificationsEnabled());
        }
        if (request.getEmailNotificationsEnabled() != null) {
            technician.setEmailNotificationsEnabled(request.getEmailNotificationsEnabled());
        }
        if (request.getPushNotificationsEnabled() != null) {
            technician.setPushNotificationsEnabled(request.getPushNotificationsEnabled());
        }
        if (request.getPreferredLanguage() != null) {
            technician.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getEmergencyContactName() != null) {
            technician.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getEmergencyContactPhone() != null) {
            technician.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }
        if (request.getEmergencyContactRelationship() != null) {
            technician.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        }
        if (request.getMedicalClearanceValid() != null) {
            technician.setMedicalClearanceValid(request.getMedicalClearanceValid());
        }
        if (request.getMedicalClearanceExpiry() != null) {
            technician.setMedicalClearanceExpiry(request.getMedicalClearanceExpiry());
        }
        if (request.getMedicalConditions() != null) {
            technician.setMedicalConditions(request.getMedicalConditions());
        }
        if (request.getAllergies() != null) {
            technician.setAllergies(request.getAllergies());
        }
        if (request.getLastSafetyTraining() != null) {
            technician.setLastSafetyTraining(request.getLastSafetyTraining());
        }
        if (request.getLastTechnicalTraining() != null) {
            technician.setLastTechnicalTraining(request.getLastTechnicalTraining());
        }
        if (request.getTrainingRecords() != null) {
            technician.setTrainingRecords(request.getTrainingRecords());
        }
        if (request.getGpsTrackingEnabled() != null) {
            technician.setGpsTrackingEnabled(request.getGpsTrackingEnabled());
        }
        if (request.getLocationSharingEnabled() != null) {
            technician.setLocationSharingEnabled(request.getLocationSharingEnabled());
        }
        if (request.getLocationUpdateInterval() != null) {
            technician.setLocationUpdateInterval(request.getLocationUpdateInterval());
        }
        if (request.getHrEmployeeId() != null) {
            technician.setHrEmployeeId(request.getHrEmployeeId());
        }
        if (request.getPayrollId() != null) {
            technician.setPayrollId(request.getPayrollId());
        }
        if (request.getBadgeNumber() != null) {
            technician.setBadgeNumber(request.getBadgeNumber());
        }
    }

    private TechnicianDto convertToDto(Technician technician) {
        return TechnicianDto.builder()
                .id(technician.getId())
                .employeeId(technician.getEmployeeId())
                .firstName(technician.getFirstName())
                .lastName(technician.getLastName())
                .email(technician.getEmail())
                .phone(technician.getPhone())
                .mobilePhone(technician.getMobilePhone())
                .profileImageUrl(technician.getProfileImageUrl())
                .status(technician.getStatus())
                .level(technician.getLevel())
                .skills(technician.getSkills())
                .certifications(technician.getCertifications())
                .specializations(technician.getSpecializations())
                .availableForFieldWork(technician.getAvailableForFieldWork())
                .hasValidDriversLicense(technician.getHasValidDriversLicense())
                .hasVehicle(technician.getHasVehicle())
                .vehicleInfo(technician.getVehicleInfo())
                .licenseNumber(technician.getLicenseNumber())
                .licenseExpiryDate(technician.getLicenseExpiryDate())
                .currentLatitude(technician.getCurrentLatitude())
                .currentLongitude(technician.getCurrentLongitude())
                .currentAddress(technician.getCurrentAddress())
                .lastLocationUpdate(technician.getLastLocationUpdate())
                .homeAddress(technician.getHomeAddress())
                .homeLatitude(technician.getHomeLatitude())
                .homeLongitude(technician.getHomeLongitude())
                .workingRegion(technician.getWorkingRegion())
                .workingAreaRadius(technician.getWorkingAreaRadius())
                .workStartTime(technician.getWorkStartTime())
                .workEndTime(technician.getWorkEndTime())
                .availableWeekends(technician.getAvailableWeekends())
                .availableHolidays(technician.getAvailableHolidays())
                .jobsCompleted(technician.getJobsCompleted())
                .jobsInProgress(technician.getJobsInProgress())
                .averageRating(technician.getAverageRating())
                .totalRatings(technician.getTotalRatings())
                .totalEarnings(technician.getTotalEarnings())
                .averageJobDuration(technician.getAverageJobDuration())
                .onTimeCompletionRate(technician.getOnTimeCompletionRate())
                .customerSatisfactionScore(technician.getCustomerSatisfactionScore())
                .technicalSkills(technician.getTechnicalSkills())
                .softSkills(technician.getSoftSkills())
                .safetyTraining(technician.getSafetyTraining())
                .equipmentTraining(technician.getEquipmentTraining())
                .assignedEquipment(technician.getAssignedEquipment())
                .assignedTools(technician.getAssignedTools())
                .assignedVehicle(technician.getAssignedVehicle())
                .smsNotificationsEnabled(technician.getSmsNotificationsEnabled())
                .emailNotificationsEnabled(technician.getEmailNotificationsEnabled())
                .pushNotificationsEnabled(technician.getPushNotificationsEnabled())
                .preferredLanguage(technician.getPreferredLanguage())
                .emergencyContactName(technician.getEmergencyContactName())
                .emergencyContactPhone(technician.getEmergencyContactPhone())
                .emergencyContactRelationship(technician.getEmergencyContactRelationship())
                .medicalClearanceValid(technician.getMedicalClearanceValid())
                .medicalClearanceExpiry(technician.getMedicalClearanceExpiry())
                .medicalConditions(technician.getMedicalConditions())
                .allergies(technician.getAllergies())
                .lastSafetyTraining(technician.getLastSafetyTraining())
                .lastTechnicalTraining(technician.getLastTechnicalTraining())
                .trainingRecords(technician.getTrainingRecords())
                .gpsTrackingEnabled(technician.getGpsTrackingEnabled())
                .locationSharingEnabled(technician.getLocationSharingEnabled())
                .locationUpdateInterval(technician.getLocationUpdateInterval())
                .hrEmployeeId(technician.getHrEmployeeId())
                .payrollId(technician.getPayrollId())
                .badgeNumber(technician.getBadgeNumber())
                .createdAt(technician.getCreatedAt())
                .updatedAt(technician.getUpdatedAt())
                .createdBy(technician.getCreatedBy())
                .lastModifiedBy(technician.getLastModifiedBy())
                .build();
    }
}
