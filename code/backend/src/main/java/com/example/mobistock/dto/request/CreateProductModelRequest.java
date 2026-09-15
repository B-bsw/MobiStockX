package com.example.mobistock.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
public class CreateProductModelRequest {

    @NotBlank(message = "Model name is required")
    private String modelName;

    private String color;

    private String storageCapacity;

    @Builder.Default
    private Integer modelWarrantyDuration = 12;

    @Builder.Default
    private Boolean isSerialized = true;

    @PositiveOrZero(message = "Standard cost must be greater than or equal to zero")
    private BigDecimal standardCost;

    @NotNull(message = "Standard price is required")
    @Positive(message = "Standard price must be positive")
    private BigDecimal standardPrice;

    private String imageUrl;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
