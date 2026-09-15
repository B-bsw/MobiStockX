package com.example.mobistock.dto.response.sparePart;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SparePartResponse {

    private final Integer partId;
    private final String partName;
    private final Integer quantity;
    private final String imageUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
}
