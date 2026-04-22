package com.everx.erp.inventory.bin;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "inventory_bins",
        schema = "everx_erp",
        uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "location"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryBin extends BaseEntity {

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Column(name = "on_hand", nullable = false)
    private Integer onHand = 0;

    @Column(name = "reserved", nullable = false)
    private Integer reserved = 0;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "min_stock")
    private Integer minStock;

    @Column(name = "max_stock")
    private Integer maxStock;
}
