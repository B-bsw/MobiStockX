package com.example.mobistock.dto.response.saleOrder;

import com.example.mobistock.domain.enums.SaleStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class SaleOrderResponse {

    private final Integer saleId;
    private final String saleCode;
    private final LocalDateTime saleDate;
    private final BigDecimal totalAmount;
    private final BigDecimal additionalCost;
    private final SaleStatus status;
    private final Integer customerId;
    private final String createdBy;
    private final String updatedBy;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
