package com.example.mobistock.dto.response;

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
public class SaleOrderItemResponse {

    private Long saleItemId;
    private Long modelId;
    private String modelName;
    private Long itemId;
    private String itemSerialNumber;
    private String itemImei;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal unitPrice;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private LocalDateTime warrantyExpireDate;
    private ProductWarrantyResponse warranty;
}
