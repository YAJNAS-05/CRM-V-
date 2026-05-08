package com.everx.erp.equipment;

import com.everx.erp.equipment.dto.CreateEquipmentRequest;
import com.everx.erp.equipment.dto.EquipmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public Page<EquipmentResponse> findAll(Pageable pageable) {
        return equipmentRepository.findAll(pageable).map(this::toResponse);
    }

    public EquipmentResponse findById(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return toResponse(equipment);
    }

    public EquipmentResponse findByNumber(String equipmentNumber) {
        Equipment equipment = equipmentRepository.findByEquipmentNumber(equipmentNumber)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return toResponse(equipment);
    }

    @Transactional
    public EquipmentResponse create(CreateEquipmentRequest request) {
        Equipment equipment = Equipment.builder()
            .equipmentNumber(generateEquipmentNumber())
            .equipmentType(request.getEquipmentType())
            .description(request.getDescription())
            .serialNumber(request.getSerialNumber())
            .locationId(request.getLocationId())
            .purchaseDate(request.getPurchaseDate())
            .purchaseCost(request.getPurchaseCost())
            .status("ACTIVE")
            .build();
        return toResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public EquipmentResponse update(UUID id, CreateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        equipment.setEquipmentType(request.getEquipmentType());
        equipment.setDescription(request.getDescription());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setLocationId(request.getLocationId());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setPurchaseCost(request.getPurchaseCost());
        return toResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public void delete(UUID id) {
        equipmentRepository.deleteById(id);
    }

    private String generateEquipmentNumber() {
        return "EQ-" + System.currentTimeMillis();
    }

    private EquipmentResponse toResponse(Equipment equipment) {
        return EquipmentResponse.builder()
            .id(equipment.getId())
            .equipmentNumber(equipment.getEquipmentNumber())
            .equipmentType(equipment.getEquipmentType())
            .description(equipment.getDescription())
            .serialNumber(equipment.getSerialNumber())
            .status(equipment.getStatus())
            .locationId(equipment.getLocationId())
            .purchaseDate(equipment.getPurchaseDate())
            .purchaseCost(equipment.getPurchaseCost())
            .build();
    }
}
