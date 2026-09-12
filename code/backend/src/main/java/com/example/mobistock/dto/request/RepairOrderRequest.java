package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.RepairStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
public class RepairOrderRequest {
    @Size(max = 255) private String repairCode;
    private String problemDescription;
    private String technicianNote;
    private LocalDateTime dateReceived;
    private LocalDateTime dateCompleted;
    @DecimalMin(value = "0.00") private BigDecimal laborCost;
    private RepairStatus status = RepairStatus.received;
    private Integer customerId;
    private Integer itemId;
    @Size(max = 255) private String createdBy;
    @Size(max = 255) private String updatedBy;
}
