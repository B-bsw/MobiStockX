package com.example.mobistock.domain.entity;

import com.example.mobistock.common.BaseEntity;
import com.example.mobistock.domain.enums.ClaimStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "WARRANTY_CLAIM", indexes = {
        @Index(name = "idx_claim_warranty", columnList = "warranty_id"),
        @Index(name = "idx_claim_status", columnList = "claim_status")
})
public class WarrantyClaim extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @Column(name = "claim_code", nullable = false, unique = true)
    private String claimCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warranty_id", nullable = false)
    private ProductWarranty warranty;

    @Column(name = "claim_date", nullable = false)
    private LocalDate claimDate;

    @Column(name = "symptom", nullable = false, columnDefinition = "TEXT")
    private String symptom;

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "claim_status", nullable = false, length = 20)
    private ClaimStatus claimStatus = ClaimStatus.OPEN;

    @Column(name = "closed_date")
    private LocalDate closedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;
}
