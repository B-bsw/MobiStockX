package com.example.mobistock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CategoryResponse {

    private final Integer categoryId;
    private final String categoryNameTh;
    private final String categoryNameEn;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
