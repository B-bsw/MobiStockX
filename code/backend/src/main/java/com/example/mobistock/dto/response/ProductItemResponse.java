package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductItemResponse {

    private Long itemId;
    private Long modelId;
    private String modelName;
    private String serialNumber;
    private String imei;
    private ItemCondition condition;
    private String grade;
    private Integer batteryHealth;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private ItemStatus status;
    private LocalDateTime warrantyExpireDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
