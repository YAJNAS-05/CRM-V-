package com.everx.erp.logistics;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.salesorder.SalesOrderItem;
import com.everx.erp.salesorder.SalesOrderRepository;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.erp.logistics.dto.CreateShipmentRequest;
import com.everx.erp.logistics.dto.ShipmentDto;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final WarrantyRepository warrantyRepository;

    @Transactional
    public ShipmentDto createShipment(CreateShipmentRequest request) {
        Shipment shipment = new Shipment();
        shipment.setSoId(request.getSoId());
        shipment.setPoId(request.getPoId());
        shipment.setTrackingNumber(request.getTrackingNumber());
        shipment.setCarrier(request.getCarrier());
        shipment.setOriginCountry(request.getOriginCountry());
        shipment.setDestinationCountry(request.getDestinationCountry());
        shipment.setStatus(request.getStatus());
        shipment.setShippedDate(request.getShippedDate());
        shipment.setEstimatedArrival(request.getEstimatedArrival());
        shipment.setActualArrival(request.getActualArrival());
        shipment.setBillOfLadingUrl(request.getBillOfLadingUrl());
        shipment.setPackingListUrl(request.getPackingListUrl());
        shipment.setCustomsDeclarationUrl(request.getCustomsDeclarationUrl());
        shipment.setFreightCost(request.getFreightCost());
        shipment.setCurrency(request.getCurrency());
        return toDto(shipmentRepository.save(shipment));
    }

    @Transactional(readOnly = true)
    public ShipmentDto getShipmentById(UUID id) {
        return toDto(shipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<ShipmentDto> getAllShipments(Pageable pageable) {
        return shipmentRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ShipmentDto> getShipmentsByStatus(String status, Pageable pageable) {
        return shipmentRepository.findByStatus(status, pageable).map(this::toDto);
    }

    @Transactional
    public ShipmentDto updateShipment(UUID id, CreateShipmentRequest request) {
        Shipment shipment = shipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id));
        if (request.getSoId() != null) shipment.setSoId(request.getSoId());
        if (request.getPoId() != null) shipment.setPoId(request.getPoId());
        if (request.getTrackingNumber() != null) shipment.setTrackingNumber(request.getTrackingNumber());
        if (request.getCarrier() != null) shipment.setCarrier(request.getCarrier());
        if (request.getOriginCountry() != null) shipment.setOriginCountry(request.getOriginCountry());
        if (request.getDestinationCountry() != null) shipment.setDestinationCountry(request.getDestinationCountry());
        if (request.getStatus() != null) shipment.setStatus(request.getStatus());
        if (request.getShippedDate() != null) shipment.setShippedDate(request.getShippedDate());
        if (request.getEstimatedArrival() != null) shipment.setEstimatedArrival(request.getEstimatedArrival());
        if (request.getActualArrival() != null) shipment.setActualArrival(request.getActualArrival());
        if (request.getBillOfLadingUrl() != null) shipment.setBillOfLadingUrl(request.getBillOfLadingUrl());
        if (request.getPackingListUrl() != null) shipment.setPackingListUrl(request.getPackingListUrl());
        if (request.getCustomsDeclarationUrl() != null) shipment.setCustomsDeclarationUrl(request.getCustomsDeclarationUrl());
        if (request.getFreightCost() != null) shipment.setFreightCost(request.getFreightCost());
        if (request.getCurrency() != null) shipment.setCurrency(request.getCurrency());
        return toDto(shipmentRepository.save(shipment));
    }

    @Transactional
    public void deleteShipment(UUID id) {
        Shipment shipment = shipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id));
        shipment.softDelete();
        shipmentRepository.save(shipment);
    }

    @Transactional
    public ShipmentDto updateStatus(UUID id, String status) {
        Shipment shipment = shipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id));

        shipment.setStatus(status);
        Shipment updated = shipmentRepository.save(shipment);

        if ("IN_TRANSIT".equalsIgnoreCase(status)) {
            updateEquipmentByShipmentSalesOrder(updated, EquipmentStatus.IN_TRANSIT);
        }

        return toDto(updated);
    }

    @Transactional
    public ShipmentDto deliverShipment(UUID id, boolean clientSignatureObtained, String conditionOnDelivery) {
        Shipment shipment = shipmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found with id: " + id));

        if (!clientSignatureObtained) {
            throw new ValidationException("Delivery sign-off is required to complete shipment");
        }

        if (!"GOOD".equalsIgnoreCase(conditionOnDelivery) && !"DAMAGED".equalsIgnoreCase(conditionOnDelivery)) {
            throw new ValidationException("conditionOnDelivery must be GOOD or DAMAGED");
        }

        shipment.setStatus("DELIVERED");
        if (shipment.getActualArrival() == null) {
            shipment.setActualArrival(LocalDate.now());
        }

        Shipment saved = shipmentRepository.save(shipment);

        if ("GOOD".equalsIgnoreCase(conditionOnDelivery)) {
            updateEquipmentByShipmentSalesOrder(saved, EquipmentStatus.INSTALLED);

            if (saved.getSoId() != null) {
                SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(saved.getSoId())
                        .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + saved.getSoId()));
                so.setStatus("INSTALLED");
                salesOrderRepository.save(so);
                createWarrantiesForSalesOrder(so, saved.getActualArrival());
            }
        }

        return toDto(saved);
    }

    private void updateEquipmentByShipmentSalesOrder(Shipment shipment, EquipmentStatus status) {
        if (shipment.getSoId() == null) {
            return;
        }

        SalesOrder so = salesOrderRepository.findByIdAndNotDeleted(shipment.getSoId())
                .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + shipment.getSoId()));

        if (so.getItems() == null) {
            return;
        }

        for (SalesOrderItem item : so.getItems()) {
            if (item.getEquipmentId() == null) {
                continue;
            }

            Equipment equipment = equipmentRepository.findByIdAndNotDeleted(item.getEquipmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + item.getEquipmentId()));
            equipment.setStatus(status);
            equipmentRepository.save(equipment);
        }
    }

    private void createWarrantiesForSalesOrder(SalesOrder so, LocalDate startDate) {
        if (so.getItems() == null) {
            return;
        }

        for (SalesOrderItem item : so.getItems()) {
            if (item.getEquipmentId() == null) {
                continue;
            }

            boolean hasWarranty = !warrantyRepository.findByEquipmentId(item.getEquipmentId()).isEmpty();
            if (hasWarranty) {
                continue;
            }

            Warranty warranty = new Warranty();
            warranty.setEquipmentId(item.getEquipmentId());
            warranty.setSoId(so.getId());
            warranty.setAccountId(so.getAccountId());
            warranty.setStartDate(startDate);
            warranty.setEndDate(startDate.plusMonths(12));
            warranty.setType("PARTS_AND_LABOUR");
            warranty.setStatus("ACTIVE");
            warranty.setNotes("Auto-created on shipment delivery sign-off");
            warrantyRepository.save(warranty);
        }
    }

    private ShipmentDto toDto(Shipment shipment) {
        ShipmentDto dto = new ShipmentDto();
        dto.setId(shipment.getId());
        dto.setSoId(shipment.getSoId());
        dto.setPoId(shipment.getPoId());
        dto.setTrackingNumber(shipment.getTrackingNumber());
        dto.setCarrier(shipment.getCarrier());
        dto.setOriginCountry(shipment.getOriginCountry());
        dto.setDestinationCountry(shipment.getDestinationCountry());
        dto.setStatus(shipment.getStatus());
        dto.setShippedDate(shipment.getShippedDate());
        dto.setEstimatedArrival(shipment.getEstimatedArrival());
        dto.setActualArrival(shipment.getActualArrival());
        dto.setBillOfLadingUrl(shipment.getBillOfLadingUrl());
        dto.setPackingListUrl(shipment.getPackingListUrl());
        dto.setCustomsDeclarationUrl(shipment.getCustomsDeclarationUrl());
        dto.setFreightCost(shipment.getFreightCost());
        dto.setCurrency(shipment.getCurrency());
        dto.setCreatedAt(shipment.getCreatedAt().toInstant());
        dto.setUpdatedAt(shipment.getUpdatedAt().toInstant());
        return dto;
    }
}
