package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Builder
public class RepairOrderPartResponse {
    private final Integer repairId; private final Integer partId;
    private final Integer quantity; private final BigDecimal unitPrice;
    private final LocalDateTime createdAt; private final LocalDateTime updatedAt;
}
