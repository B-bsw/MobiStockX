package com.example.mobistock.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RepairOrderPartResponse {

    private final Integer repairId;
    private final Integer partId;
    private final Integer quantity;
    private final BigDecimal unitPrice;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
