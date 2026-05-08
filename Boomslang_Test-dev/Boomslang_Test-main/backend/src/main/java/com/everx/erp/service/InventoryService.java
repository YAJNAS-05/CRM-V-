package com.everx.erp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    public Map<String, Object> getInventoryItems(UUID tenantId) {
        log.info("Getting inventory items for tenant: {}", tenantId);
        
        List<Map<String, Object>> items = Arrays.asList(
            Map.of(
                "id", UUID.randomUUID(),
                "sku", "LAPTOP-001",
                "name", "Business Laptop",
                "description", "High-performance laptop for business use",
                "category", "Electronics",
                "unitPrice", new BigDecimal("1299.99"),
                "quantityOnHand", 45,
                "reorderLevel", 10,
                "maxStock", 100,
                "location", "Warehouse A",
                "status", "IN_STOCK"
            ),
            Map.of(
                "id", UUID.randomUUID(),
                "sku", "DESK-002",
                "name", "Office Desk",
                "description", "Ergonomic office desk",
                "category", "Furniture",
                "unitPrice", new BigDecimal("599.99"),
                "quantityOnHand", 8,
                "reorderLevel", 15,
                "maxStock", 50,
                "location", "Warehouse B",
                "status", "LOW_STOCK"
            ),
            Map.of(
                "id", UUID.randomUUID(),
                "sku", "CHAIR-003",
                "name", "Office Chair",
                "description", "Comfortable office chair",
                "category", "Furniture",
                "unitPrice", new BigDecimal("299.99"),
                "quantityOnHand", 0,
                "reorderLevel", 20,
                "maxStock", 60,
                "location", "Warehouse B",
                "status", "OUT_OF_STOCK"
            )
        );
        
        return Map.of(
            "items", items,
            "totalItems", items.size(),
            "totalValue", new BigDecimal("125997.00"),
            "lowStockItems", 2,
            "outOfStockItems", 1
        );
    }

    public Map<String, Object> getPurchaseOrders(UUID tenantId) {
        log.info("Getting purchase orders for tenant: {}", tenantId);
        
        List<Map<String, Object>> orders = Arrays.asList(
            Map.of(
                "id", UUID.randomUUID(),
                "orderNumber", "PO-2024-001",
                "supplier", "Office Supplies Inc",
                "status", "PENDING",
                "orderDate", LocalDateTime.now().minusDays(5),
                "expectedDelivery", LocalDateTime.now().plusDays(10),
                "totalAmount", new BigDecimal("5999.99"),
                "items", Arrays.asList(
                    Map.of("sku", "DESK-002", "quantity", 10, "unitPrice", new BigDecimal("599.99"))
                )
            ),
            Map.of(
                "id", UUID.randomUUID(),
                "orderNumber", "PO-2024-002",
                "supplier", "Tech Electronics Ltd",
                "status", "DELIVERED",
                "orderDate", LocalDateTime.now().minusDays(15),
                "expectedDelivery", LocalDateTime.now().minusDays(2),
                "totalAmount", new BigDecimal("25999.80"),
                "items", Arrays.asList(
                    Map.of("sku", "LAPTOP-001", "quantity", 20, "unitPrice", new BigDecimal("1299.99"))
                )
            )
        );
        
        return Map.of(
            "orders", orders,
            "totalOrders", orders.size(),
            "pendingOrders", 1,
            "totalValue", new BigDecimal("31999.79")
        );
    }

    public Map<String, Object> getSalesOrders(UUID tenantId) {
        log.info("Getting sales orders for tenant: {}", tenantId);
        
        List<Map<String, Object>> orders = Arrays.asList(
            Map.of(
                "id", UUID.randomUUID(),
                "orderNumber", "SO-2024-001",
                "customer", "ABC Corporation",
                "status", "PROCESSING",
                "orderDate", LocalDateTime.now().minusDays(2),
                "expectedDelivery", LocalDateTime.now().plusDays(7),
                "totalAmount", new BigDecimal("3899.97"),
                "items", Arrays.asList(
                    Map.of("sku", "LAPTOP-001", "quantity", 3, "unitPrice", new BigDecimal("1299.99"))
                )
            ),
            Map.of(
                "id", UUID.randomUUID(),
                "orderNumber", "SO-2024-002",
                "customer", "XYZ Industries",
                "status", "SHIPPED",
                "orderDate", LocalDateTime.now().minusDays(5),
                "expectedDelivery", LocalDateTime.now().plusDays(2),
                "totalAmount", new BigDecimal("1799.97"),
                "items", Arrays.asList(
                    Map.of("sku", "DESK-002", "quantity", 3, "unitPrice", new BigDecimal("599.99"))
                )
            )
        );
        
        return Map.of(
            "orders", orders,
            "totalOrders", orders.size(),
            "processingOrders", 1,
            "shippedOrders", 1,
            "totalValue", new BigDecimal("5699.94")
        );
    }

    public Map<String, Object> getProductionOrders(UUID tenantId) {
        log.info("Getting production orders for tenant: {}", tenantId);
        
        List<Map<String, Object>> orders = Arrays.asList(
            Map.of(
                "id", UUID.randomUUID(),
                "orderNumber", "PR-2024-001",
                "product", "Custom Office Set",
                "status", "IN_PROGRESS",
                "startDate", LocalDateTime.now().minusDays(3),
                "expectedCompletion", LocalDateTime.now().plusDays(4),
                "progress", 65,
                "quantity", 25,
                "materials", Arrays.asList(
                    Map.of("name", "Wood", "quantity", 500, "unit", "kg"),
                    Map.of("name", "Metal", "quantity", 100, "unit", "kg")
                )
            )
        );
        
        return Map.of(
            "orders", orders,
            "totalOrders", orders.size(),
            "inProgressOrders", 1,
            "completedOrders", 0
        );
    }

    public Map<String, Object> getInventoryAnalytics(UUID tenantId) {
        log.info("Getting inventory analytics for tenant: {}", tenantId);
        
        return Map.of(
            "totalItems", 1250,
            "totalValue", new BigDecimal("1250000.00"),
            "lowStockItems", 15,
            "outOfStockItems", 8,
            "categories", Arrays.asList(
                Map.of("name", "Electronics", "count", 450, "value", new BigDecimal("450000.00")),
                Map.of("name", "Furniture", "count", 320, "value", new BigDecimal("320000.00")),
                Map.of("name", "Supplies", "count", 480, "value", new BigDecimal("480000.00"))
            ),
            "topSuppliers", Arrays.asList(
                Map.of("name", "Office Supplies Inc", "orders", 45, "value", new BigDecimal("125000.00")),
                Map.of("name", "Tech Electronics Ltd", "orders", 32, "value", new BigDecimal("289000.00"))
            )
        );
    }
}
