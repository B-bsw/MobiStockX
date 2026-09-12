package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.ClaimResolution;
import com.example.mobistock.domain.enums.ClaimStatus;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @Builder
public class ClaimOrderResponse {
    private final Integer claimId; private final String claimCode;
    private final LocalDateTime dateReceived; private final LocalDateTime dateReturned;
    private final ClaimStatus status; private final ClaimResolution resolution;
    private final Integer supplierId; private final Integer customerId; private final Integer itemId;
    private final String createdBy; private final String updatedBy;
    private final LocalDateTime createdAt; private final LocalDateTime updatedAt;
}
