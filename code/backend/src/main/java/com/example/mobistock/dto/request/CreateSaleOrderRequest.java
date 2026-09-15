package com.example.mobistock.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSaleOrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Cashier user ID is required")
    private Long cashierUserId;

    @Builder.Default
    @PositiveOrZero(message = "Order discount amount must be positive or zero")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Valid
    @NotEmpty(message = "At least one sale item is required")
    private List<SaleItemRequest> items;

    @Valid
    @NotNull(message = "Payment details are required")
    private PaymentRequest payment;

    @Builder.Default
    private Boolean requiresTaxInvoice = false;

    @Valid
    private TaxInvoiceRequest taxInvoice;
}
