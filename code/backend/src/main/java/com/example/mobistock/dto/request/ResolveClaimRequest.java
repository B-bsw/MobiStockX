package com.example.mobistock.dto.request;

import com.example.mobistock.domain.enums.ClaimStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResolveClaimRequest {

    /** Target state: UNDER_REPAIR, REPAIRED, REPLACED or REJECTED. */
    @NotNull(message = "Claim status is required")
    private ClaimStatus claimStatus;

    @Size(max = 1000, message = "Resolution must not exceed 1000 characters")
    private String resolution;
}
