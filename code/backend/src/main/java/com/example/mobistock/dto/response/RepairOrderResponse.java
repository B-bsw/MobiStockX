package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.RepairStatus;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Builder
public class RepairOrderResponse {
    private final Integer repairId; private final String repairCode;
    private final String problemDescription; private final String technicianNote;
    private final LocalDateTime dateReceived; private final LocalDateTime dateCompleted;
    private final BigDecimal laborCost; private final RepairStatus status;
    private final Integer customerId; private final Integer itemId;
    private final String createdBy; private final String updatedBy;
    private final LocalDateTime createdAt; private final LocalDateTime updatedAt;
}
