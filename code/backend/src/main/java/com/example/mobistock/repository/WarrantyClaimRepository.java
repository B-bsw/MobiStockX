package com.example.mobistock.repository;

import com.example.mobistock.domain.entity.WarrantyClaim;
import com.example.mobistock.domain.enums.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarrantyClaimRepository extends JpaRepository<WarrantyClaim, Long> {

    Optional<WarrantyClaim> findByClaimCode(String claimCode);

    /** An IMEI may be claimed repeatedly over time, but only one claim can be open at once. */
    boolean existsByWarranty_WarrantyIdAndClaimStatusIn(Long warrantyId, java.util.Collection<ClaimStatus> statuses);

    /*
     * List/detail endpoints: โหลด warranty -> saleOrderItem -> model/customer ในชุดเดียว
     * กัน N+1 เวลาแสดงตารางเคลม
     */
    @Query(value = """
            SELECT c FROM WarrantyClaim c
            JOIN FETCH c.warranty w
            JOIN FETCH w.saleOrderItem soi
            LEFT JOIN FETCH soi.productModel
            LEFT JOIN FETCH soi.saleOrder so
            LEFT JOIN FETCH so.customer
            LEFT JOIN FETCH c.createdBy
            WHERE (:status IS NULL OR c.claimStatus = :status)
            """,
            countQuery = """
                    SELECT COUNT(c) FROM WarrantyClaim c
                    WHERE (:status IS NULL OR c.claimStatus = :status)
                    """)
    Page<WarrantyClaim> findAllDetail(@Param("status") ClaimStatus status, Pageable pageable);

    @Query("""
            SELECT c FROM WarrantyClaim c
            JOIN FETCH c.warranty w
            JOIN FETCH w.saleOrderItem soi
            LEFT JOIN FETCH soi.productModel
            LEFT JOIN FETCH soi.saleOrder so
            LEFT JOIN FETCH so.customer
            LEFT JOIN FETCH c.createdBy
            WHERE c.claimId = :claimId
            """)
    Optional<WarrantyClaim> findDetailById(@Param("claimId") Long claimId);
}
