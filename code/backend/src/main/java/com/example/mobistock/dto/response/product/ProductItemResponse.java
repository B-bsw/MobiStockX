package com.example.mobistock.dto.response.product;

import com.example.mobistock.domain.enums.ItemStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProductItemResponse {

    private final Integer itemId;
    private final String serialNumber;
    private final String imei;
    private final String lotNumber;
    private final ItemStatus status;
    private final Integer modelId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
