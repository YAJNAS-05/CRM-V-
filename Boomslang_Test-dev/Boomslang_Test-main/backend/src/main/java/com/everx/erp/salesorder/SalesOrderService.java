package com.everx.erp.salesorder;

import com.everx.erp.salesorder.dto.SalesOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;

    public Page<SalesOrderResponse> findAll(Pageable pageable) {
        return salesOrderRepository.findAll(pageable).map(this::toResponse);
    }

    public SalesOrderResponse findById(UUID id) {
        SalesOrder so = salesOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sales Order not found"));
        return toResponse(so);
    }

    @Transactional
    public SalesOrderResponse create(SalesOrder request) {
        request.setSoNumber(generateSONumber());
        request.setStatus("DRAFT");
        return toResponse(salesOrderRepository.save(request));
    }

    private String generateSONumber() {
        return "SO-" + System.currentTimeMillis();
    }

    private SalesOrderResponse toResponse(SalesOrder so) {
        return SalesOrderResponse.builder()
            .id(so.getId())
            .soNumber(so.getSoNumber())
            .customerId(so.getCustomerId())
            .companyCode(so.getCompanyCode())
            .orderDate(so.getOrderDate())
            .deliveryDate(so.getDeliveryDate())
            .totalAmount(so.getTotalAmount())
            .currency(so.getCurrency())
            .status(so.getStatus())
            .build();
    }
}
