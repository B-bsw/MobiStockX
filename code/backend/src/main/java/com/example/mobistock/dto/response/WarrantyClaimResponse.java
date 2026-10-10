package com.example.mobistock.dto.response;

import com.example.mobistock.domain.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyClaimResponse {

    private Long claimId;
    private String claimCode;
    private Long warrantyId;
    private String warrantyCode;
    private String itemImei;
    private String modelName;
    private String customerName;
    private LocalDate warrantyExpireDate;
    private LocalDate claimDate;
    private String symptom;
    private String resolution;
    private ClaimStatus claimStatus;
    private LocalDate closedDate;
    private String createdByName;
    private LocalDateTime createdAt;
}
