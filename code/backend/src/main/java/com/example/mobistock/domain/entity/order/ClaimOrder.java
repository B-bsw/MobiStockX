package com.example.mobistock.domain.entity.order;

import com.example.mobistock.domain.entity.Customer;
import com.example.mobistock.domain.entity.product.ProductItem;
import com.example.mobistock.domain.entity.supplier.Supplier;
import com.example.mobistock.domain.enums.claim.ClaimResolution;
import com.example.mobistock.domain.enums.claim.ClaimStatus;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity @Table(name = "CLAIM_ORDER") @Getter @Setter @NoArgsConstructor
public class ClaimOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id") private Integer claimId;
    @Column(name = "claim_code", length = 255) private String claimCode;
    @Column(name = "claim_date_received") private LocalDateTime dateReceived;
    @Column(name = "claim_date_returned") private LocalDateTime dateReturned;
    @Enumerated(EnumType.STRING) @Column(name = "claim_status", length = 20)
    private ClaimStatus status = ClaimStatus.pending;
    @Enumerated(EnumType.STRING) @Column(name = "claim_resolution", length = 20)
    private ClaimResolution resolution = ClaimResolution.unknown;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "supplier_id") private Supplier supplier;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id") private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "item_id") private ProductItem item;
    @Column(name = "create_by", length = 255) private String createdBy;
    @Column(name = "update_by", length = 255) private String updatedBy;
    @CreationTimestamp @Column(name = "create_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "update_at") private LocalDateTime updatedAt;
}
