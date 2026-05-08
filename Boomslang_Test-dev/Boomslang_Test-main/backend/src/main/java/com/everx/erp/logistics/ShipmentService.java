package com.everx.erp.logistics;

import com.everx.erp.logistics.dto.ShipmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    public Page<ShipmentResponse> findAll(Pageable pageable) {
        return shipmentRepository.findAll(pageable).map(this::toResponse);
    }

    public ShipmentResponse findById(UUID id) {
        Shipment s = shipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shipment not found"));
        return toResponse(s);
    }

    @Transactional
    public ShipmentResponse create(Shipment request) {
        request.setShipmentNumber("SHIP-" + System.currentTimeMillis());
        request.setStatus("PENDING");
        return toResponse(shipmentRepository.save(request));
    }

    private ShipmentResponse toResponse(Shipment s) {
        return ShipmentResponse.builder()
            .id(s.getId())
            .shipmentNumber(s.getShipmentNumber())
            .orderId(s.getOrderId())
            .carrier(s.getCarrier())
            .trackingNumber(s.getTrackingNumber())
            .status(s.getStatus())
            .shipDate(s.getShipDate())
            .deliveryDate(s.getDeliveryDate())
            .build();
    }
}
