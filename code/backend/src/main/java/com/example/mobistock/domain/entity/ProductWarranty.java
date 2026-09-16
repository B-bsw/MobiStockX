package com.example.mobistock.domain.entity;

import com.example.mobistock.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PRODUCT_WARRANTY")
public class ProductWarranty extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "warranty_id")
    private Long warrantyId;

    @Column(name = "warranty_code", nullable = false, unique = true)
    private String warrantyCode;

    @Column(name = "item_imei", length = 15)
    private String itemImei;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expire_date", nullable = false)
    private LocalDate expireDate;

    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Builder.Default
    @Column(name = "warranty_status", nullable = false)
    private String warrantyStatus = "ACTIVE";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_item_id", nullable = false, unique = true)
    private SaleOrderItem saleOrderItem;
}
