package com.example.mobistock.domain.entity;

import com.example.mobistock.domain.enums.SaleStatus;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SALE_ORDER")
@Getter
@Setter
@NoArgsConstructor
public class SaleOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Integer saleId;

    @Column(name = "sale_code", nullable = false, unique = true, length = 50)
    private String saleCode;

    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;

    @Column(name = "sale_total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "sale_additional_cost", precision = 10, scale = 2)
    private BigDecimal additionalCost = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "sale_status", nullable = false, length = 20)
    private SaleStatus status = SaleStatus.Pending;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "saleOrder")
    private List<SaleOrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "saleOrder")
    private List<SaleOrderImage> images = new ArrayList<>();

    @Column(name = "create_by", length = 255)
    private String createdBy;

    @Column(name = "update_by", length = 255)
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void initializeDefaults() {
        if (saleDate == null) {
            saleDate = LocalDateTime.now();
        }
        if (additionalCost == null) {
            additionalCost = BigDecimal.ZERO;
        }
        if (status == null) {
            status = SaleStatus.Pending;
        }
    }
}
