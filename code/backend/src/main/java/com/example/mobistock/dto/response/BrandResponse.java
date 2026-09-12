package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BrandResponse {

    private final Integer brandId;
    private final String brandName;
    private final String brandCountry;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
