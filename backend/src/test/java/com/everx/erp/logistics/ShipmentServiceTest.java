package com.everx.erp.logistics;

import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.salesorder.SalesOrderItem;
import com.everx.erp.salesorder.SalesOrderRepository;
import com.everx.erp.logistics.dto.CreateShipmentRequest;
import com.everx.erp.logistics.siteassessment.SiteAssessmentService;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.shared.exception.ValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private WarrantyRepository warrantyRepository;

    @Mock
    private SiteAssessmentService siteAssessmentService;

    @InjectMocks
    private ShipmentService shipmentService;

    @Test
    void createShipment_requiresConfirmedSalesOrder() {
        UUID soId = UUID.randomUUID();
        UUID siteAssessmentId = UUID.randomUUID();

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setSoId(soId);
        request.setSiteAssessmentId(siteAssessmentId);
        request.setStatus("PREPARING");

        SalesOrder draftSalesOrder = new SalesOrder();
        draftSalesOrder.setStatus("DRAFT");

        when(salesOrderRepository.findByIdAndNotDeleted(soId)).thenReturn(Optional.of(draftSalesOrder));

        assertThrows(ValidationException.class, () -> shipmentService.createShipment(request));

        verify(siteAssessmentService).requireReadyById(siteAssessmentId);
        verify(shipmentRepository, never()).save(any(Shipment.class));
    }

    @Test
    void updateShipment_whenChangingSo_requiresConfirmedSalesOrder() {
        UUID shipmentId = UUID.randomUUID();
        UUID soId = UUID.randomUUID();

        Shipment existingShipment = new Shipment();
        existingShipment.setStatus("PREPARING");

        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setSoId(soId);
        request.setStatus("PREPARING");

        SalesOrder draftSalesOrder = new SalesOrder();
        draftSalesOrder.setStatus("DRAFT");

        when(shipmentRepository.findByIdAndNotDeleted(shipmentId)).thenReturn(Optional.of(existingShipment));
        when(salesOrderRepository.findByIdAndNotDeleted(soId)).thenReturn(Optional.of(draftSalesOrder));

        assertThrows(ValidationException.class, () -> shipmentService.updateShipment(shipmentId, request));

        verify(shipmentRepository, never()).save(any(Shipment.class));
    }

    @Test
    void deliverShipment_goodCondition_installsEquipmentAndCreatesWarranty() {
        UUID shipmentId = UUID.randomUUID();
        UUID soId = UUID.randomUUID();
        UUID equipmentId = UUID.randomUUID();

        Shipment shipment = new Shipment();
        shipment.setSoId(soId);
        shipment.setStatus("IN_TRANSIT");
        shipment.setCreatedAt(OffsetDateTime.now());
        shipment.setUpdatedAt(OffsetDateTime.now());

        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setId(soId);
        salesOrder.setAccountId(UUID.randomUUID());
        salesOrder.setStatus("CONFIRMED");

        SalesOrderItem item = new SalesOrderItem();
        item.setEquipmentId(equipmentId);
        item.setQuantity(1);
        salesOrder.setItems(List.of(item));

        Equipment equipment = new Equipment();
        equipment.setStatus(EquipmentStatus.IN_TRANSIT);

        when(shipmentRepository.findByIdAndNotDeleted(shipmentId)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(salesOrderRepository.findByIdAndNotDeleted(soId)).thenReturn(Optional.of(salesOrder));
        when(salesOrderRepository.save(any(SalesOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(equipmentRepository.findByIdAndNotDeleted(equipmentId)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(warrantyRepository.findByEquipmentId(equipmentId)).thenReturn(List.of());
        when(warrantyRepository.save(any(Warranty.class))).thenAnswer(invocation -> invocation.getArgument(0));

        shipmentService.deliverShipment(shipmentId, true, "GOOD");

        verify(equipmentRepository).save(argThat(eq -> eq.getStatus() == EquipmentStatus.INSTALLED));
        verify(salesOrderRepository).save(argThat(so -> "INSTALLED".equals(so.getStatus())));
        verify(warrantyRepository).save(any(Warranty.class));
    }

    @Test
    void deliverShipment_damagedCondition_marksEquipmentUnderMaintenanceWithoutWarranty() {
        UUID shipmentId = UUID.randomUUID();
        UUID soId = UUID.randomUUID();
        UUID equipmentId = UUID.randomUUID();

        Shipment shipment = new Shipment();
        shipment.setSoId(soId);
        shipment.setStatus("IN_TRANSIT");
        shipment.setCreatedAt(OffsetDateTime.now());
        shipment.setUpdatedAt(OffsetDateTime.now());

        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setId(soId);
        salesOrder.setStatus("CONFIRMED");

        SalesOrderItem item = new SalesOrderItem();
        item.setEquipmentId(equipmentId);
        item.setQuantity(1);
        salesOrder.setItems(List.of(item));

        Equipment equipment = new Equipment();
        equipment.setStatus(EquipmentStatus.IN_TRANSIT);

        when(shipmentRepository.findByIdAndNotDeleted(shipmentId)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(salesOrderRepository.findByIdAndNotDeleted(soId)).thenReturn(Optional.of(salesOrder));
        when(equipmentRepository.findByIdAndNotDeleted(equipmentId)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        shipmentService.deliverShipment(shipmentId, true, "DAMAGED");

        verify(equipmentRepository).save(argThat(eq -> eq.getStatus() == EquipmentStatus.UNDER_MAINTENANCE));
        verify(salesOrderRepository, never()).save(any(SalesOrder.class));
        verify(warrantyRepository, never()).save(any(Warranty.class));
    }
}
