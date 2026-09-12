package com.example.mobistock.domain.entity;

import com.example.mobistock.domain.enums.RepairImageType;
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
import java.time.LocalDateTime;

@Entity @Table(name = "REPAIR_ORDER_IMAGE") @Getter @Setter @NoArgsConstructor
public class RepairOrderImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id") private Integer imageId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "repair_id", nullable = false)
    private RepairOrder repairOrder;
    @Column(name = "image_url", nullable = false, length = 255) private String imageUrl;
    @Column(name = "image_caption", length = 255) private String imageCaption;
    @Enumerated(EnumType.STRING) @Column(name = "image_type", length = 20)
    private RepairImageType imageType = RepairImageType.received;
    @CreationTimestamp @Column(name = "create_at", nullable = false, updatable = false) private LocalDateTime createdAt;
}
