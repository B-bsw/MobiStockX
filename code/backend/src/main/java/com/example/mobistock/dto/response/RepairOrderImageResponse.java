package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.RepairImageType;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class RepairOrderImageResponse {
    private final Integer imageId; private final Integer repairId;
    private final String imageUrl; private final String imageCaption;
    private final RepairImageType imageType; private final LocalDateTime createdAt;
}
