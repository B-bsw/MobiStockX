package com.example.mobistock.domain.entity;

import com.example.mobistock.domain.enums.RepairStatus;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "REPAIR_ORDER")
@Getter
@Setter
@NoArgsConstructor
public class RepairOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "repair_id")
    private Integer repairId;

    @Column(name = "repair_code", length = 255)
    private String repairCode;

    @Column(name = "repair_problem_desc", columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "repair_technician_note", columnDefinition = "TEXT")
    private String technicianNote;

    @Column(name = "repair_date_received")
    private LocalDateTime dateReceived;

    @Column(name = "repair_date_completed")
    private LocalDateTime dateCompleted;

    @Column(name = "repair_labor_cost", precision = 10, scale = 2)
    private BigDecimal laborCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "repair_status", length = 30)
    private RepairStatus status = RepairStatus.received;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProductItem item;

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

    @OneToMany(mappedBy = "repairOrder")
    private List<RepairOrderPart> parts = new ArrayList<>();

    @OneToMany(mappedBy = "repairOrder")
    private List<RepairOrderImage> images = new ArrayList<>();
}
