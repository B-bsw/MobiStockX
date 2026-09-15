package com.example.mobistock.dto.response.repair;

import java.time.LocalDateTime;

import com.example.mobistock.domain.enums.repair.RepairImageType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RepairOrderImageResponse {

    private final Integer imageId;
    private final Integer repairId;
    private final String imageUrl;
    private final String imageCaption;
    private final RepairImageType imageType;
    private final LocalDateTime createdAt;
}
