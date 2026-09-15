package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.ItemCondition;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
public class CreateProductItemRequest {

    @NotNull(message = "Product model ID is required")
    private Long modelId;

    private String serialNumber;

    private String imei;

    @Builder.Default
    private ItemCondition condition = ItemCondition.NEW;

    private String grade;

    private Integer batteryHealth;

    @NotNull(message = "Cost price is required")
    @PositiveOrZero(message = "Cost price must be positive or zero")
    private BigDecimal costPrice;

    @NotNull(message = "Selling price is required")
    @Positive(message = "Selling price must be positive")
    private BigDecimal sellingPrice;

    private LocalDateTime warrantyExpireDate;
}
