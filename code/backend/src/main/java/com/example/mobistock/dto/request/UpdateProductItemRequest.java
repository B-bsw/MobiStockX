package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.ItemCondition;
import com.example.mobistock.domain.enums.ItemStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductItemRequest {

    @Size(max = 255, message = "Serial number must not exceed 255 characters")
    private String serialNumber;

    @Size(min = 15, max = 15, message = "IMEI must be exactly 15 digits")
    private String imei;

    @Size(max = 10, message = "Grade must not exceed 10 characters")
    private String grade;

    private ItemCondition condition;

    @Min(value = 0, message = "Battery health must be between 0 and 100")
    @Max(value = 100, message = "Battery health must be between 0 and 100")
    private Integer batteryHealth;

    @NotNull(message = "Cost price is required")
    @PositiveOrZero(message = "Cost price must be positive or zero")
    private BigDecimal costPrice;

    @NotNull(message = "Selling price is required")
    @Positive(message = "Selling price must be positive")
    private BigDecimal sellingPrice;

    @NotNull(message = "Item status is required")
    private ItemStatus status;
}
