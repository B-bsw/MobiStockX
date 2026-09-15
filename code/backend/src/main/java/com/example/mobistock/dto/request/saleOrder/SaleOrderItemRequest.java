package com.example.mobistock.dto.request.saleOrder;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class SaleOrderItemRequest {

    @NotNull(message = "Sale price is required")
    @DecimalMin(value = "0.00", message = "Sale price must not be negative")
    private BigDecimal salePrice;

    @NotNull(message = "Sale ID is required")
    private Integer saleId;

    @NotNull(message = "Item ID is required")
    private Integer itemId;
}
