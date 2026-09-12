package com.example.mobistock.dto.request.order;

import com.example.mobistock.domain.enums.claim.ClaimResolution;
import com.example.mobistock.domain.enums.claim.ClaimStatus;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
public class ClaimOrderRequest {
    @Size(max = 255) private String claimCode;
    private LocalDateTime dateReceived;
    private LocalDateTime dateReturned;
    private ClaimStatus status = ClaimStatus.pending;
    private ClaimResolution resolution = ClaimResolution.unknown;
    private Integer supplierId;
    private Integer customerId;
    private Integer itemId;
    @Size(max = 255) private String createdBy;
    @Size(max = 255) private String updatedBy;
}
