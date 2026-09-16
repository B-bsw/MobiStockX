package com.example.mobistock.domain.entity;

import com.example.mobistock.common.BaseEntity;
import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PRODUCT_ITEM")
public class ProductItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "item_serial_number", unique = true)
    private String serialNumber;

    @Column(name = "item_imei", length = 15, unique = true)
    private String imei;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "item_condition", nullable = false)
    private ItemCondition condition = ItemCondition.NEW;

    @Column(name = "item_grade", length = 10)
    private String grade;

    @Column(name = "battery_health")
    private Integer batteryHealth;

    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "item_status", nullable = false)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "warranty_expire_date")
    private LocalDateTime warrantyExpireDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private ProductModel productModel;
}
