package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProductModelResponse {

    private final Integer modelId;
    private final String modelName;
    private final String madeIn;
    private final Integer warrantyDuration;
    private final Integer brandId;
    private final Integer categoryId;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
