package com.example.mobistock.dto.request.saleOrder;

import com.example.mobistock.domain.enums.SaleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class SaleOrderRequest {

    @NotBlank(message = "Sale code is required")
    @Size(max = 50, message = "Sale code must not exceed 50 characters")
    private String saleCode;

    @NotNull(message = "Sale date is required")
    private LocalDateTime saleDate;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.00", message = "Total amount must not be negative")
    private BigDecimal totalAmount;

    @DecimalMin(value = "0.00", message = "Additional cost must not be negative")
    private BigDecimal additionalCost = BigDecimal.ZERO;

    private SaleStatus status = SaleStatus.Pending;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    @Size(max = 255, message = "Created by must not exceed 255 characters")
    private String createdBy;

    @Size(max = 255, message = "Updated by must not exceed 255 characters")
    private String updatedBy;
}
