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
public class ProductModelResponse {

    private Long modelId;
    private String modelName;
    private String color;
    private String storageCapacity;
    private Integer modelWarrantyDuration;
    private Boolean isSerialized;
    private Integer stockQuantity;
    private BigDecimal standardCost;
    private BigDecimal standardPrice;
    private String imageUrl;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryNameTh;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
