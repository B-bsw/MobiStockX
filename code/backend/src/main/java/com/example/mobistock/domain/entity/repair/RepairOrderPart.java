package com.example.mobistock.domain.entity.repair;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.mobistock.domain.entity.sparePart.SparePart;

@Entity
@Table(name = "REPAIR_ORDER_PART")
@Getter
@Setter
@NoArgsConstructor
public class RepairOrderPart {

    @EmbeddedId
    private RepairOrderPartId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("repairId")
    @JoinColumn(name = "repair_id", nullable = false)
    private RepairOrder repairOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("partId")
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart sparePart;

    @Column(name = "repair_part_quantity")
    private Integer quantity;

    @Column(name = "repair_part_unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updatedAt;
}
