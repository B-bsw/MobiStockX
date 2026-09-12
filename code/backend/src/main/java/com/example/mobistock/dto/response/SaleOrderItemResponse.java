package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class SaleOrderItemResponse {

    private final Integer saleItemId;
    private final BigDecimal salePrice;
    private final Integer saleId;
    private final Integer itemId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
