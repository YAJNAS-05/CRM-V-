package com.everx.erp.equipment;

import com.everx.erp.equipment.dto.CreateEquipmentRequest;
import com.everx.erp.equipment.dto.EquipmentDto;
import com.everx.erp.equipment.dto.UpdateEquipmentRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    @Transactional
    public EquipmentDto createEquipment(CreateEquipmentRequest request) {
        if (equipmentRepository.findByInternalCode(request.getInternalCode()).isPresent()) {
            throw new ValidationException("Equipment with internal code " + request.getInternalCode() + " already exists");
        }

        Equipment equipment = new Equipment();
        equipment.setInternalCode(request.getInternalCode());
        equipment.setMake(request.getMake());
        equipment.setModel(request.getModel());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setCategory(request.getCategory());
        equipment.setSliceConfig(request.getSliceConfig());
        equipment.setFieldStrength(request.getFieldStrength());
        equipment.setConditionGrade(request.getConditionGrade());
        equipment.setStatus(request.getStatus() != null ? request.getStatus() : EquipmentStatus.IN_STOCK);
        equipment.setWarehouseLocation(request.getWarehouseLocation());
        equipment.setAcquisitionCost(request.getAcquisitionCost());
        equipment.setAcquisitionCurrency(request.getAcquisitionCurrency());
        equipment.setAskingPrice(request.getAskingPrice());
        equipment.setAskingCurrency(request.getAskingCurrency());
        equipment.setYearOfManufacture(request.getYearOfManufacture());
        equipment.setHoursOfUse(request.getHoursOfUse());
        equipment.setTgaCompliant(request.getTgaCompliant());
        equipment.setCeMarked(request.getCeMarked());
        equipment.setFdaCleared(request.getFdaCleared());
        equipment.setLocationCountry(request.getLocationCountry());
        equipment.setSoftware(request.getSoftware());
        equipment.setSoftwareVersion(request.getSoftwareVersion());
        equipment.setTubeType(request.getTubeType());
        equipment.setInstalledOptions(request.getInstalledOptions());
        equipment.setDetectorSize(request.getDetectorSize());
        equipment.setTubeReplaced(request.getTubeReplaced());
        equipment.setTubeScanSeconds(request.getTubeScanSeconds());
        equipment.setNumRxChannels(request.getNumRxChannels());
        equipment.setCoils(request.getCoils());
        equipment.setChoiceOfProbes(request.getChoiceOfProbes());
        equipment.setTubeManufactured(request.getTubeManufactured());
        equipment.setFlatDetectorManufactured(request.getFlatDetectorManufactured());
        equipment.setNotes(request.getNotes());
        equipment.setImages(request.getImages());

        Equipment saved = equipmentRepository.save(equipment);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public EquipmentDto getEquipmentById(UUID id) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + id));
        return toDto(equipment);
    }

    @Transactional(readOnly = true)
    public EquipmentDto getEquipmentByCode(String code) {
        Equipment equipment = equipmentRepository.findByInternalCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with code: " + code));
        return toDto(equipment);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentDto> getAllEquipment(Pageable pageable) {
        return equipmentRepository.findAllNotDeleted(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentDto> getEquipmentByStatus(EquipmentStatus status, Pageable pageable) {
        return equipmentRepository.findByStatus(status, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentDto> getEquipmentByCategory(String category, Pageable pageable) {
        return equipmentRepository.findByCategory(category, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentDto> getEquipmentByWarehouse(String location, Pageable pageable) {
        return equipmentRepository.findByWarehouseLocation(location, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentDto> searchEquipment(String search, Pageable pageable) {
        return equipmentRepository.searchEquipment(search, pageable)
                .map(this::toDto);
    }

    @Transactional
    public EquipmentDto updateEquipment(UUID id, UpdateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + id));

        if (request.getInternalCode() != null && !request.getInternalCode().equals(equipment.getInternalCode())) {
            if (equipmentRepository.findByInternalCode(request.getInternalCode()).isPresent()) {
                throw new ValidationException("Equipment with internal code " + request.getInternalCode() + " already exists");
            }
            equipment.setInternalCode(request.getInternalCode());
        }

        if (request.getMake() != null) equipment.setMake(request.getMake());
        if (request.getModel() != null) equipment.setModel(request.getModel());
        if (request.getSerialNumber() != null) equipment.setSerialNumber(request.getSerialNumber());
        if (request.getCategory() != null) equipment.setCategory(request.getCategory());
        if (request.getSliceConfig() != null) equipment.setSliceConfig(request.getSliceConfig());
        if (request.getFieldStrength() != null) equipment.setFieldStrength(request.getFieldStrength());
        if (request.getConditionGrade() != null) equipment.setConditionGrade(request.getConditionGrade());
        if (request.getStatus() != null) equipment.setStatus(request.getStatus());
        if (request.getWarehouseLocation() != null) equipment.setWarehouseLocation(request.getWarehouseLocation());
        if (request.getAcquisitionCost() != null) equipment.setAcquisitionCost(request.getAcquisitionCost());
        if (request.getAcquisitionCurrency() != null) equipment.setAcquisitionCurrency(request.getAcquisitionCurrency());
        if (request.getAskingPrice() != null) equipment.setAskingPrice(request.getAskingPrice());
        if (request.getAskingCurrency() != null) equipment.setAskingCurrency(request.getAskingCurrency());
        if (request.getYearOfManufacture() != null) equipment.setYearOfManufacture(request.getYearOfManufacture());
        if (request.getHoursOfUse() != null) equipment.setHoursOfUse(request.getHoursOfUse());
        if (request.getTgaCompliant() != null) equipment.setTgaCompliant(request.getTgaCompliant());
        if (request.getCeMarked() != null) equipment.setCeMarked(request.getCeMarked());
        if (request.getFdaCleared() != null) equipment.setFdaCleared(request.getFdaCleared());
        if (request.getLocationCountry() != null) equipment.setLocationCountry(request.getLocationCountry());
        if (request.getSoftware() != null) equipment.setSoftware(request.getSoftware());
        if (request.getSoftwareVersion() != null) equipment.setSoftwareVersion(request.getSoftwareVersion());
        if (request.getTubeType() != null) equipment.setTubeType(request.getTubeType());
        if (request.getInstalledOptions() != null) equipment.setInstalledOptions(request.getInstalledOptions());
        if (request.getDetectorSize() != null) equipment.setDetectorSize(request.getDetectorSize());
        if (request.getTubeReplaced() != null) equipment.setTubeReplaced(request.getTubeReplaced());
        if (request.getTubeScanSeconds() != null) equipment.setTubeScanSeconds(request.getTubeScanSeconds());
        if (request.getNumRxChannels() != null) equipment.setNumRxChannels(request.getNumRxChannels());
        if (request.getCoils() != null) equipment.setCoils(request.getCoils());
        if (request.getChoiceOfProbes() != null) equipment.setChoiceOfProbes(request.getChoiceOfProbes());
        if (request.getTubeManufactured() != null) equipment.setTubeManufactured(request.getTubeManufactured());
        if (request.getFlatDetectorManufactured() != null) equipment.setFlatDetectorManufactured(request.getFlatDetectorManufactured());
        if (request.getNotes() != null) equipment.setNotes(request.getNotes());
        if (request.getImages() != null) equipment.setImages(request.getImages());

        Equipment updated = equipmentRepository.save(equipment);
        return toDto(updated);
    }

    @Transactional
    public void deleteEquipment(UUID id) {
        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + id));
        equipment.softDelete();
        equipmentRepository.save(equipment);
    }

    private EquipmentDto toDto(Equipment equipment) {
        EquipmentDto dto = new EquipmentDto();
        dto.setId(equipment.getId());
        dto.setInternalCode(equipment.getInternalCode());
        dto.setMake(equipment.getMake());
        dto.setModel(equipment.getModel());
        dto.setSerialNumber(equipment.getSerialNumber());
        dto.setCategory(equipment.getCategory());
        dto.setSliceConfig(equipment.getSliceConfig());
        dto.setFieldStrength(equipment.getFieldStrength());
        dto.setConditionGrade(equipment.getConditionGrade());
        dto.setStatus(equipment.getStatus());
        dto.setWarehouseLocation(equipment.getWarehouseLocation());
        dto.setAcquisitionCost(equipment.getAcquisitionCost());
        dto.setAcquisitionCurrency(equipment.getAcquisitionCurrency());
        dto.setAskingPrice(equipment.getAskingPrice());
        dto.setAskingCurrency(equipment.getAskingCurrency());
        dto.setYearOfManufacture(equipment.getYearOfManufacture());
        dto.setHoursOfUse(equipment.getHoursOfUse());
        dto.setTgaCompliant(equipment.getTgaCompliant());
        dto.setCeMarked(equipment.getCeMarked());
        dto.setFdaCleared(equipment.getFdaCleared());
        dto.setLocationCountry(equipment.getLocationCountry());
        dto.setSoftware(equipment.getSoftware());
        dto.setSoftwareVersion(equipment.getSoftwareVersion());
        dto.setTubeType(equipment.getTubeType());
        dto.setInstalledOptions(equipment.getInstalledOptions());
        dto.setDetectorSize(equipment.getDetectorSize());
        dto.setTubeReplaced(equipment.getTubeReplaced());
        dto.setTubeScanSeconds(equipment.getTubeScanSeconds());
        dto.setNumRxChannels(equipment.getNumRxChannels());
        dto.setCoils(equipment.getCoils());
        dto.setChoiceOfProbes(equipment.getChoiceOfProbes());
        dto.setTubeManufactured(equipment.getTubeManufactured());
        dto.setFlatDetectorManufactured(equipment.getFlatDetectorManufactured());
        dto.setNotes(equipment.getNotes());
        dto.setImages(equipment.getImages());
        dto.setCreatedAt(equipment.getCreatedAt().toInstant());
        dto.setUpdatedAt(equipment.getUpdatedAt().toInstant());
        return dto;
    }
}
