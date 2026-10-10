package com.example.mobistock.controller.api;

import com.example.mobistock.common.ApiResponse;
import com.example.mobistock.common.PageResponse;
import com.example.mobistock.domain.enums.ClaimStatus;
import com.example.mobistock.dto.request.CreateClaimRequest;
import com.example.mobistock.dto.request.ResolveClaimRequest;
import com.example.mobistock.dto.response.ProductWarrantyResponse;
import com.example.mobistock.dto.response.WarrantyClaimResponse;
import com.example.mobistock.service.WarrantyClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class WarrantyClaimController {

    private final WarrantyClaimService warrantyClaimService;

    @GetMapping("/warranty/{imei}")
    public ResponseEntity<ApiResponse<ProductWarrantyResponse>> getWarrantyByImei(@PathVariable String imei) {
        return ResponseEntity.ok(ApiResponse.success(warrantyClaimService.getWarrantyByImei(imei)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WarrantyClaimResponse>> createClaim(
            @Valid @RequestBody CreateClaimRequest request) {
        WarrantyClaimResponse response = warrantyClaimService.createClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Claim created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarrantyClaimResponse>> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(warrantyClaimService.getClaimById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<WarrantyClaimResponse>>> getAllClaims(
            @RequestParam(required = false) ClaimStatus status,
            @PageableDefault(size = 20, sort = "claimId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(warrantyClaimService.getAllClaims(status, pageable))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WarrantyClaimResponse>> resolveClaim(
            @PathVariable Long id,
            @Valid @RequestBody ResolveClaimRequest request) {
        WarrantyClaimResponse response = warrantyClaimService.resolveClaim(id, request);
        return ResponseEntity.ok(ApiResponse.success("Claim updated successfully", response));
    }
}
