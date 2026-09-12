package com.example.mobistock.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "SPARE_PART")
@Getter
@Setter
@NoArgsConstructor
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id")
    private Integer partId;

    @Column(name = "part_name", length = 255)
    private String partName;

    @Column(name = "part_quantity")
    private Integer quantity = 0;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @OneToMany(mappedBy = "sparePart")
    private List<SupplierSparePart> suppliers = new ArrayList<>();

    @OneToMany(mappedBy = "sparePart")
    private List<RepairOrderPart> repairOrderParts = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updatedAt;
}
