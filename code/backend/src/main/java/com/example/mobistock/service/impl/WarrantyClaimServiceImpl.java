package com.example.mobistock.service.impl;

import com.example.mobistock.domain.entity.AppUser;
import com.example.mobistock.domain.entity.ProductItem;
import com.example.mobistock.domain.entity.ProductWarranty;
import com.example.mobistock.domain.entity.WarrantyClaim;
import com.example.mobistock.domain.enums.ClaimStatus;
import com.example.mobistock.domain.enums.ItemStatus;
import com.example.mobistock.dto.request.CreateClaimRequest;
import com.example.mobistock.dto.request.ResolveClaimRequest;
import com.example.mobistock.dto.response.ProductWarrantyResponse;
import com.example.mobistock.dto.response.WarrantyClaimResponse;
import com.example.mobistock.exception.BadRequestException;
import com.example.mobistock.exception.ConflictException;
import com.example.mobistock.exception.ResourceNotFoundException;
import com.example.mobistock.mapper.WarrantyClaimMapper;
import com.example.mobistock.repository.AppUserRepository;
import com.example.mobistock.repository.ProductItemRepository;
import com.example.mobistock.repository.ProductWarrantyRepository;
import com.example.mobistock.repository.WarrantyClaimRepository;
import com.example.mobistock.service.WarrantyClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarrantyClaimServiceImpl implements WarrantyClaimService {

    /** Claims still occupying the device — a second claim cannot be opened while one of these is active. */
    private static final List<ClaimStatus> ACTIVE_STATUSES = List.of(ClaimStatus.OPEN, ClaimStatus.UNDER_REPAIR);

    /*
     * State machine from the warranty-claim diagram.
     * OPEN         -> UNDER_REPAIR (ส่งซ่อม) | REJECTED (ไม่อยู่ในระยะประกัน/ไม่เข้าเงื่อนไข)
     * UNDER_REPAIR -> REPAIRED (ซ่อมเสร็จ ส่งคืนลูกค้า) | REPLACED (ซ่อมไม่ได้ เปลี่ยนเครื่อง)
     * REPAIRED / REPLACED / REJECTED are terminal.
     */
    private static final Map<ClaimStatus, Set<ClaimStatus>> ALLOWED_TRANSITIONS = Map.of(
            ClaimStatus.OPEN, Set.of(ClaimStatus.UNDER_REPAIR, ClaimStatus.REJECTED),
            ClaimStatus.UNDER_REPAIR, Set.of(ClaimStatus.REPAIRED, ClaimStatus.REPLACED),
            ClaimStatus.REPAIRED, Set.of(),
            ClaimStatus.REPLACED, Set.of(),
            ClaimStatus.REJECTED, Set.of());

    private final WarrantyClaimRepository warrantyClaimRepository;
    private final ProductWarrantyRepository productWarrantyRepository;
    private final ProductItemRepository productItemRepository;
    private final AppUserRepository appUserRepository;
    private final WarrantyClaimMapper warrantyClaimMapper;

    @Override
    @Transactional(readOnly = true)
    public ProductWarrantyResponse getWarrantyByImei(String imei) {
        ProductWarranty warranty = productWarrantyRepository.findByItemImei(imei)
                .orElseThrow(() -> new ResourceNotFoundException("No warranty found for IMEI: " + imei));
        return toWarrantyResponse(warranty);
    }

    @Override
    @Transactional
    public WarrantyClaimResponse createClaim(CreateClaimRequest request) {
        ProductWarranty warranty = productWarrantyRepository.findByItemImei(request.getImei())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No warranty found for IMEI: " + request.getImei()));

        // ตามไดอะแกรม: เข้าสถานะ UNDER_REPAIR ได้เฉพาะ [อยู่ในระยะประกัน]
        if (warranty.getExpireDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Warranty for IMEI " + request.getImei() + " expired on " + warranty.getExpireDate());
        }
        if (!"ACTIVE".equals(warranty.getWarrantyStatus())) {
            throw new BadRequestException(
                    "Warranty for IMEI " + request.getImei() + " is not active (" + warranty.getWarrantyStatus() + ")");
        }
        if (warrantyClaimRepository.existsByWarranty_WarrantyIdAndClaimStatusIn(
                warranty.getWarrantyId(), ACTIVE_STATUSES)) {
            throw new ConflictException("An open claim already exists for IMEI " + request.getImei());
        }

        AppUser createdBy = appUserRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getCreatedByUserId()));

        WarrantyClaim claim = warrantyClaimRepository.save(WarrantyClaim.builder()
                .claimCode(generateClaimCode())
                .warranty(warranty)
                .claimDate(LocalDate.now())
                .symptom(request.getSymptom())
                .claimStatus(ClaimStatus.OPEN)
                .createdBy(createdBy)
                .build());

        return warrantyClaimMapper.toWarrantyClaimResponse(
                warrantyClaimRepository.findDetailById(claim.getClaimId()).orElse(claim));
    }

    @Override
    @Transactional
    public WarrantyClaimResponse resolveClaim(Long claimId, ResolveClaimRequest request) {
        WarrantyClaim claim = warrantyClaimRepository.findDetailById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        ClaimStatus from = claim.getClaimStatus();
        ClaimStatus to = request.getClaimStatus();
        if (!ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
            throw new BadRequestException("Cannot change claim status from " + from + " to " + to);
        }

        claim.setClaimStatus(to);
        claim.setResolution(request.getResolution());
        if (to != ClaimStatus.UNDER_REPAIR) {
            claim.setClosedDate(LocalDate.now());
        }

        syncDeviceState(claim.getWarranty(), to);
        return warrantyClaimMapper.toWarrantyClaimResponse(warrantyClaimRepository.save(claim));
    }

    /*
     * ไดอะแกรมสถานะเครื่อง: SOLD -> UNDER_REPAIR -> (ซ่อมเสร็จ) SOLD | (เปลี่ยนเครื่อง) DEFECTIVE
     * ItemStatus ที่มีอยู่แมปเป็น CLAIMING = UNDER_REPAIR, DAMAGED = DEFECTIVE
     */
    private void syncDeviceState(ProductWarranty warranty, ClaimStatus to) {
        if (warranty.getItemImei() == null) {
            return;
        }
        productItemRepository.findByImei(warranty.getItemImei()).ifPresent(item -> {
            switch (to) {
                case UNDER_REPAIR -> item.setStatus(ItemStatus.CLAIMING);
                case REPAIRED, REJECTED -> item.setStatus(ItemStatus.SOLD);
                case REPLACED -> {
                    // เครื่องเดิมตัดจำหน่าย/คืนผู้ผลิต และปิดวงจรประกันของ IMEI นั้น
                    item.setStatus(ItemStatus.DAMAGED);
                    warranty.setWarrantyStatus("CLAIMED");
                }
                default -> { /* OPEN ยังไม่กระทบสถานะเครื่อง */ }
            }
            productItemRepository.save(item);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public WarrantyClaimResponse getClaimById(Long claimId) {
        return warrantyClaimRepository.findDetailById(claimId)
                .map(warrantyClaimMapper::toWarrantyClaimResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WarrantyClaimResponse> getAllClaims(ClaimStatus status, Pageable pageable) {
        return warrantyClaimRepository.findAllDetail(status, pageable)
                .map(warrantyClaimMapper::toWarrantyClaimResponse);
    }

    private ProductWarrantyResponse toWarrantyResponse(ProductWarranty warranty) {
        return ProductWarrantyResponse.builder()
                .warrantyId(warranty.getWarrantyId())
                .warrantyCode(warranty.getWarrantyCode())
                .itemImei(warranty.getItemImei())
                .startDate(warranty.getStartDate())
                .expireDate(warranty.getExpireDate())
                .termsConditions(warranty.getTermsConditions())
                .warrantyStatus(warranty.getWarrantyStatus())
                .createdAt(warranty.getCreatedAt())
                .build();
    }

    private String generateClaimCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "CLM-" + timestamp + "-" + randomSuffix;
    }
}
