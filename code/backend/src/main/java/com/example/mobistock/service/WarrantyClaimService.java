package com.example.mobistock.service;

import com.example.mobistock.domain.enums.ClaimStatus;
import com.example.mobistock.dto.request.CreateClaimRequest;
import com.example.mobistock.dto.request.ResolveClaimRequest;
import com.example.mobistock.dto.response.ProductWarrantyResponse;
import com.example.mobistock.dto.response.WarrantyClaimResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WarrantyClaimService {

    /** Warranty lookup by IMEI, used by the claim intake form. */
    ProductWarrantyResponse getWarrantyByImei(String imei);

    WarrantyClaimResponse createClaim(CreateClaimRequest request);

    WarrantyClaimResponse resolveClaim(Long claimId, ResolveClaimRequest request);

    WarrantyClaimResponse getClaimById(Long claimId);

    Page<WarrantyClaimResponse> getAllClaims(ClaimStatus status, Pageable pageable);
}
